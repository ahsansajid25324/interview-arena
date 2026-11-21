import React from "react";
import { Award, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import type { DebriefReport } from "../../../types/interview";

interface DebriefScorecardProps {
  report: DebriefReport;
  onRestart: () => void;
}

export const DebriefScorecard: React.FC<DebriefScorecardProps> = ({
  report,
  onRestart,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Score Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Debrief Coach Scorecard
              </p>
              <h1 className="text-2xl font-bold mt-0.5">
                {report.readinessLabel}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-indigo-400">
              {report.overallScore}{" "}
              <span className="text-base text-slate-400">/ 10</span>
            </div>
            <button
              type="button"
              onClick={onRestart}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Interview Session
            </button>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-emerald-300 flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4" />
              Strong Points
            </h2>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              {report.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4" />
              Areas To Improve
            </h2>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              {report.weakAreas.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Round-by-Round Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-100">
            Round-by-Round Review
          </h2>
          {report.rounds.map((r) => (
            <div
              key={r.round}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-300">
                  Round {r.round}
                </span>
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {r.status}
                </span>
              </div>
              <p className="text-slate-200 font-medium">{r.question}</p>
              <p className="text-slate-400 text-xs">
                <strong className="text-slate-300">Your Answer:</strong>{" "}
                {r.userAnswer}
              </p>
              <p className="text-emerald-300/90 text-xs">
                <strong>Panel Note:</strong> {r.panelFeedback}
              </p>
              <p className="text-indigo-300/80 text-xs">
                <strong>Coach Tip:</strong> {r.idealHint}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
