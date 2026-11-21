import React, { useState } from 'react';
import {
  Play,
  ShieldAlert,
  Clock,
  Layers,
  Sparkles,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import type {
  InterviewConfig,
  RoleTrack,
  ToughnessMode,
} from '../../../types/interview';

interface SetupLobbyProps {
  onStart: (config: InterviewConfig) => void;
  isLoading: boolean;
}

const ROLES: RoleTrack[] = [
  'Full-Stack Developer',
  'Frontend Engineer',
  'Backend / API Engineer',
  'AI / LLM Engineer',
  'System Design',
];

const TOUGHNESS_OPTIONS: {
  value: ToughnessMode;
  title: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    value: 'friendly' as ToughnessMode,
    title: 'Friendly Mentor',
    subtitle: 'Supportive hints aur guided follow-ups',
    badge: 'Guided',
  },
  {
    value: 'standard' as ToughnessMode,
    title: 'Standard Panel',
    subtitle: 'Balanced real-world engineering bar',
    badge: 'Balanced',
  },
  {
    value: 'tough' as ToughnessMode,
    title: 'Tough Big-Tech',
    subtitle: 'Strict Devil’s Advocate edge-case grilling',
    badge: 'Hardcore',
  },
];

const ROUND_OPTIONS: (3 | 5 | 7)[] = [3, 5, 7];
const TIME_OPTIONS: (90 | 120 | 180)[] = [90, 120, 180];

const formatSeconds = (sec: number): string => {
  if (sec === 90) return '1.5 Min';
  if (sec === 120) return '2 Min';
  if (sec === 180) return '3 Min';
  return `${sec}s`;
};

export const SetupLobby: React.FC<SetupLobbyProps> = ({
  onStart,
  isLoading,
}) => {
  const [role, setRole] = useState<RoleTrack>('Full-Stack Developer');
  const [techFocus, setTechFocus] = useState<string>(
    'React, Node.js / FastAPI, PostgreSQL, Redis'
  );
  const [toughness, setToughness] = useState<ToughnessMode>(
    'tough' as ToughnessMode
  );
  const [totalRounds, setTotalRounds] = useState<3 | 5 | 7>(5);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState<90 | 120 | 180>(
    120
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      role,
      techFocus: techFocus.trim(),
      toughness,
      totalRounds,
      secondsPerQuestion,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-md shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Mock Interview &amp; System Design Arena
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Multi-agent technical panel — Architect, Devil&apos;s Advocate
                  &amp; Debrief Coach
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 sm:self-center">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Ready for Session
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-8">
          {/* 1. Role Selection */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">
                1. Interview Role Select Karein
              </label>
              <span className="text-xs text-slate-400">Required</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {ROLES.map((item) => {
                const isSelected = role === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-sm shadow-indigo-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Tech Stack Focus */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <label
                htmlFor="tech-focus"
                className="text-sm font-semibold text-slate-200"
              >
                2. Tech Stack / Focus Area{' '}
                <span className="font-normal text-slate-400">(Optional)</span>
              </label>
            </div>
            <input
              id="tech-focus"
              type="text"
              value={techFocus}
              onChange={(e) => setTechFocus(e.target.value)}
              placeholder="e.g. Next.js, TypeScript, Kafka, PostgreSQL, Docker"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </section>

          {/* 3. Panel Toughness Mode */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                3. Panel Toughness Mode
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {TOUGHNESS_OPTIONS.map((mode) => {
                const active = toughness === mode.value;
                return (
                  <button
                    key={mode.title}
                    type="button"
                    onClick={() => setToughness(mode.value)}
                    className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/40'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white">
                          {mode.title}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            active
                              ? 'bg-indigo-500/25 text-indigo-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {mode.badge}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">
                        {mode.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4 & 5. Rounds and Time Per Question */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 4. Number of Rounds */}
            <section className="rounded-xl border border-slate-800/90 bg-slate-950/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-200">
                  4. Number of Rounds
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {ROUND_OPTIONS.map((rounds) => {
                  const selected = totalRounds === rounds;
                  return (
                    <button
                      key={rounds}
                      type="button"
                      onClick={() => setTotalRounds(rounds)}
                      className={`rounded-lg border py-2.5 text-sm font-medium transition ${
                        selected
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {rounds} Rounds
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 5. Time Per Question */}
            <section className="rounded-xl border border-slate-800/90 bg-slate-950/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-200">
                  5. Time Per Question
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {TIME_OPTIONS.map((sec) => {
                  const selected = secondsPerQuestion === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSecondsPerQuestion(sec)}
                      className={`rounded-lg border py-2.5 text-sm font-medium transition ${
                        selected
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {formatSeconds(sec)}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Footer CTA */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              Selected:{' '}
              <span className="font-medium text-slate-200">{role}</span> ·{' '}
              <span className="font-medium text-slate-200">
                {totalRounds} Rounds
              </span>{' '}
              ·{' '}
              <span className="font-medium text-slate-200">
                {formatSeconds(secondsPerQuestion)}/q
              </span>
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" />
              {isLoading ? 'Preparing Arena...' : 'Start Interview Arena'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};