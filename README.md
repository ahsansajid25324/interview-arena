# Mock Interview & System Design Arena

A full-stack mock technical interview and system design practice platform built with **React**, **TypeScript**, and **Tailwind CSS** on the frontend, designed to orchestrate a multi-agent evaluation panel (**Architect**, **Devil's Advocate**, and **Debrief Coach**) powered by **FastAPI** and **LangGraph**.

## Features

- **Configurable Interview Lobby (`SetupLobby`)**:
  - Choose target tracks (*Full-Stack Developer*, *Frontend Engineer*, *Backend / API Engineer*, *AI / LLM Engineer*, *System Design*).
  - Specify custom tech stack / focus areas.
  - Select panel toughness (*Friendly Mentor*, *Standard Panel*, *Tough Big-Tech*).
  - Configure round counts (`3`, `5`, or `7` rounds) and per-question timers (`90s`, `120s`, or `180s`).
- **Timed Interview Arena (`InterviewArena`)**:
  - Per-question countdown timer with warning and critical states, automatically pausing during evaluation.
  - Auto-submits partial drafts on timeout or marks unanswered prompts as skipped.
  - Enforces minimum answer length validation and supports skipping (`I Don't Know / Skip`) and `Ctrl/Cmd + Enter` submission.
  - Live panel rubric tracking (*Architecture & Clarity*, *Trade-offs & Scale*, *Edge Cases & Failure*, *Data & API Modeling*) alongside completed round status.
- **Debrief Scorecard (`DebriefScorecard`)**:
  - Computes an overall readiness score, highlights strengths and areas for improvement, and provides a round-by-round breakdown with coaching tips.
- **Pluggable Service Layer (`mockInterviewService.ts`)**:
  - Currently runs on a deterministic mock interview simulator so frontend flows and edge cases can be tested independently before wiring up real FastAPI and LangGraph endpoints.

## Project Structure

```text
src/
├── types/
│   └── interview.ts               # Domain types for config, messages, rubrics, and reports
├── services/
│   └── mockInterviewService.ts    # Mock LangGraph simulator (to be replaced with FastAPI API client)
├── features/
│   └── arena/
│       ├── components/
│       │   ├── SetupLobby.tsx         # Session configuration screen
│       │   ├── InterviewArena.tsx     # Active split-screen interview workspace
│       │   └── DebriefScorecard.tsx   # Post-session evaluation & review screen
│       └── hooks/
│           └── useCountdownTimer.ts   # Per-question timer hook with expiration handling
├── App.tsx
└── main.tsx