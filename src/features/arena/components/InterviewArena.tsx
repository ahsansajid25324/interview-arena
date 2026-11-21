import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Clock,
  Send,
  SkipForward,
  AlertTriangle,
  Bot,
  User,
  Flag,
  CheckCircle2,
} from "lucide-react";
import type {
  AnswerStatus,
  InterviewConfig,
  PanelMessage,
  RoundSummary,
  RubricItem,
  SpeakerRole,
} from "../../../types/interview";
import { useCountdownTimer } from "../hooks/useCountDownTimer";
import { evaluateTurnAndGetNext } from "../../../services/mockInterviewService";

interface InterviewArenaProps {
  config: InterviewConfig;
  initialSpeaker: SpeakerRole;
  initialQuestion: string;
  rubric: RubricItem[];
  onRubricChange: (updated: RubricItem[]) => void;
  onComplete: (rounds: RoundSummary[]) => void;
}

const MIN_ANSWER_WORDS = 5;

export const InterviewArena: React.FC<InterviewArenaProps> = ({
  config,
  initialSpeaker,
  initialQuestion,
  rubric,
  onRubricChange,
  onComplete,
}) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [messages, setMessages] = useState<PanelMessage[]>([
    {
      id: "msg_1",
      round: 1,
      sender: "panel",
      speaker: initialSpeaker,
      content: initialQuestion,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [roundSummaries, setRoundSummaries] = useState<RoundSummary[]>([]);

  const draftRef = useRef(draftAnswer);
  const lockSubmitRef = useRef(false);
  const resetTimerRef = useRef<(newSeconds?: number) => void>(() => {});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    draftRef.current = draftAnswer;
  }, [draftAnswer]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isEvaluating]);

  const processTurn = useCallback(
    async (rawAnswer: string, status: AnswerStatus) => {
      if (lockSubmitRef.current) return;
      lockSubmitRef.current = true;
      setIsEvaluating(true);
      setValidationError(null);

      const cleaned = rawAnswer.trim();
      const userMsg: PanelMessage = {
        id: `user_${Date.now()}`,
        round: currentRound,
        sender: "user",
        content:
          status === "skipped"
            ? "[Question Skipped]"
            : cleaned || "[Time Expired — No Answer Submitted]",
        status,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setDraftAnswer("");

      const result = await evaluateTurnAndGetNext({
        config,
        round: currentRound,
        currentQuestion,
        userAnswer: cleaned,
        status,
        currentRubric: rubric,
      });

      onRubricChange(result.updatedRubric);

      const newSummary: RoundSummary = {
        round: currentRound,
        question: currentQuestion,
        userAnswer: userMsg.content,
        status,
        panelFeedback: result.feedbackNote,
        idealHint: result.idealHint,
      };
      const updatedSummaries = [...roundSummaries, newSummary];
      setRoundSummaries(updatedSummaries);

      const coachMsg: PanelMessage = {
        id: `coach_${Date.now()}`,
        round: currentRound,
        sender: "panel",
        speaker: "Coach",
        content: result.feedbackNote,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (currentRound >= config.totalRounds || !result.nextQuestion) {
        setMessages((prev) => [...prev, coachMsg]);
        setIsEvaluating(false);
        lockSubmitRef.current = false;
        setTimeout(() => onComplete(updatedSummaries), 900);
        return;
      }

      const nextRound = currentRound + 1;
      const nextPanelMsg: PanelMessage = {
        id: `panel_${Date.now() + 1}`,
        round: nextRound,
        sender: "panel",
        speaker: result.nextSpeaker || "Architect",
        content: result.nextQuestion,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, coachMsg, nextPanelMsg]);
      setCurrentRound(nextRound);
      setCurrentQuestion(result.nextQuestion);
      setIsEvaluating(false);
      lockSubmitRef.current = false;
      resetTimerRef.current(config.secondsPerQuestion);
    },
    [
      config,
      currentQuestion,
      currentRound,
      onComplete,
      onRubricChange,
      roundSummaries,
      rubric,
    ],
  );

  const handleTimerExpire = useCallback(() => {
    const text = draftRef.current.trim();
    if (text.length > 0) {
      processTurn(text, "timed_out");
    } else {
      processTurn("", "skipped");
    }
  }, [processTurn]);

  const { formattedTime, isWarning, isCritical, resetTimer } =
    useCountdownTimer({
      initialSeconds: config.secondsPerQuestion,
      isPaused: isEvaluating,
      onExpire: handleTimerExpire,
    });

  useEffect(() => {
    resetTimerRef.current = resetTimer;
  }, [resetTimer]);

  const handleManualSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isEvaluating) return;

    const words = draftAnswer.trim().split(/\s+/).filter(Boolean);
    if (words.length < MIN_ANSWER_WORDS) {
      setValidationError(
        `Answer is too short (${words.length} word(s)). Provide at least ${MIN_ANSWER_WORDS} words or use "I Don't Know / Skip".`,
      );
      return;
    }

    processTurn(draftAnswer, "answered");
  };

  const handleSkip = () => {
    if (isEvaluating) return;
    processTurn("", "skipped");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  const wordCount = draftAnswer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            {config.role}
          </span>
          <span className="text-xs uppercase tracking-wider text-slate-400">
            {config.toughness} panel
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-slate-300">
            Round{" "}
            <span className="text-indigo-400 font-bold">{currentRound}</span> of{" "}
            {config.totalRounds}
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
              isCritical
                ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse"
                : isWarning
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-slate-950 border-slate-700 text-emerald-300"
            }`}
          >
            <Clock className="w-4 h-4" />
            {isEvaluating ? "PAUSED" : formattedTime}
          </div>

          <button
            type="button"
            onClick={() => onComplete(roundSummaries)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-red-950/70 hover:text-red-300 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            End Now
          </button>
        </div>
      </header>

      {/* Main Split Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto">
        {/* Left: Chat + Answer Box */}
        <div className="lg:col-span-8 flex flex-col border-r border-slate-800">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[60vh] lg:max-h-[calc(100vh-250px)]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "panel" && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-indigo-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600/25 border border-indigo-500/40 text-slate-100"
                      : msg.speaker === "Coach"
                        ? "bg-emerald-950/40 border border-emerald-700/40 text-emerald-100"
                        : "bg-slate-900 border border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-xs font-semibold tracking-wide uppercase text-indigo-300">
                      {msg.sender === "user"
                        ? `You (Round ${msg.round})`
                        : `${msg.speaker} • Round ${msg.round}`}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {isEvaluating && (
              <div className="text-xs text-indigo-300 animate-pulse px-2">
                Panel is evaluating your response and preparing the next turn...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleManualSubmit}
            className="p-4 border-t border-slate-800 bg-slate-900/60"
          >
            {validationError && (
              <div className="mb-2.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <textarea
              rows={4}
              value={draftAnswer}
              disabled={isEvaluating}
              onChange={(e) => {
                setDraftAnswer(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Outline your architecture, API flow, data model, and key trade-offs... (Ctrl/Cmd + Enter to submit)"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-400">
                {wordCount} words • Current draft auto-submits when the timer
                expires
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={handleSkip}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />I Don&apos;t Know /
                  Skip
                </button>

                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Answer
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Live Rubric & Round History */}
        <aside className="lg:col-span-4 p-4 md:p-6 bg-slate-900/40 space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Live Panel Rubric
            </h2>
            <div className="space-y-3">
              {rubric.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-200">
                      {item.label}
                    </span>
                    <span className="font-mono text-indigo-300">
                      {item.score}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Completed Rounds ({roundSummaries.length}/{config.totalRounds})
            </h2>
            {roundSummaries.length === 0 ? (
              <p className="text-xs text-slate-500">
                Round statuses will appear here after your first submission.
              </p>
            ) : (
              <div className="space-y-2">
                {roundSummaries.map((r) => (
                  <div
                    key={r.round}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300 font-medium">
                      Round {r.round}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        r.status === "answered"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : r.status === "timed_out"
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
