import type {
  AnswerStatus,
  DebriefReport,
  InterviewConfig,
  RoundSummary,
  RubricItem,
  SpeakerRole,
} from "../types/interview";

const QUESTION_BANK: Record<string, string[]> = {
  "Full-Stack Developer": [
    "You are building a multi-vendor e-commerce platform where thousands of users place orders simultaneously during flash sales. How would you handle frontend state, API concurrency, and database inventory locking?",
    "Your React application is experiencing slow initial load times and heavy API payloads. What concrete steps would you take across client-side caching, pagination, and backend query optimization?",
    "Your authentication flow relies on JWT access and refresh tokens. If a user account is compromised, how would you immediately revoke active sessions without degrading API latency?",
    "You need to process order confirmation emails, invoice PDFs, and webhook retries in the background. How would you design the queue and failure recovery architecture while keeping API responses fast?",
    "A critical bug was deployed to production, causing intermittent 500 errors on the checkout API. What is your strategy for monitoring, rollback, and zero-downtime deployments?",
    "For a real-time order tracking map and live status updates, how would you choose between WebSockets, Server-Sent Events (SSE), and polling, and what are the trade-offs?",
    "In a multi-tenant SaaS architecture, what safeguards would you enforce at the database and API layers to guarantee strict tenant data isolation?",
  ],
  default: [
    "Walk through the high-level architecture and core data flow while clearly stating your functional requirements and scale assumptions.",
    "Where are the primary single points of failure and database bottlenecks in this design, and how would you mitigate them?",
    "If traffic suddenly spikes by 10x, how would your caching, rate limiting, and graceful degradation mechanisms respond?",
    "What trade-offs are you making between data consistency and latency, and what does your disaster recovery plan look like?",
    "Which key metrics, structured logs, and alerts would you configure to observe this system in production?",
    "What security, input validation, and abuse prevention layers would you enforce at the API boundary?",
    "How would you manage schema evolution and backward-compatible API versioning across distributed services?",
  ],
};

export function getInitialRubric(): RubricItem[] {
  return [
    {
      id: "clarity",
      label: "Architecture & Clarity",
      score: 0,
      status: "pending",
    },
    {
      id: "tradeoffs",
      label: "Trade-offs & Scale",
      score: 0,
      status: "pending",
    },
    {
      id: "edge_cases",
      label: "Edge Cases & Failure",
      score: 0,
      status: "pending",
    },
    {
      id: "data_api",
      label: "Data & API Modeling",
      score: 0,
      status: "pending",
    },
  ];
}

export async function startInterviewSession(config: InterviewConfig): Promise<{
  sessionId: string;
  firstSpeaker: SpeakerRole;
  firstQuestion: string;
}> {
  await new Promise((r) => setTimeout(r, 600));
  const pool = QUESTION_BANK[config.role] || QUESTION_BANK.default;
  const focusNote = config.techFocus.trim()
    ? ` (Focus: ${config.techFocus.trim()})`
    : "";

  return {
    sessionId: `sess_${Date.now()}`,
    firstSpeaker: "Architect",
    firstQuestion: `${pool[0]}${focusNote}`,
  };
}

export async function evaluateTurnAndGetNext(params: {
  config: InterviewConfig;
  round: number;
  currentQuestion: string;
  userAnswer: string;
  status: AnswerStatus;
  currentRubric: RubricItem[];
}): Promise<{
  feedbackNote: string;
  idealHint: string;
  nextSpeaker?: SpeakerRole;
  nextQuestion?: string;
  updatedRubric: RubricItem[];
}> {
  await new Promise((r) => setTimeout(r, 850));

  const { config, round, userAnswer, status, currentRubric } = params;
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
  const pool = QUESTION_BANK[config.role] || QUESTION_BANK.default;

  let delta = 0;
  let feedbackNote: string;
  let nextSpeaker: SpeakerRole = "Architect";

  if (status === "skipped" || wordCount === 0) {
    delta = 0;
    feedbackNote =
      "Question skipped. The key expectation here was identifying concurrency bottlenecks and explicit system trade-offs. Moving to the next round.";
  } else if (status === "timed_out") {
    delta = Math.min(18, Math.max(8, Math.floor(wordCount / 2)));
    feedbackNote = `Time expired—your partial draft (${wordCount} words) was auto-submitted. Good initial direction, though architectural depth was cut short.`;
  } else if (wordCount < 20) {
    delta = 12;
    nextSpeaker =
      config.toughness === "friendly" ? "Architect" : "Devil's Advocate";
    feedbackNote =
      "Your response was a bit brief—the panel expects concrete trade-offs, data flow specifics, and failure handling.";
  } else {
    delta = 24;
    nextSpeaker =
      config.toughness === "tough" && round % 2 === 1
        ? "Devil's Advocate"
        : "Architect";
    feedbackNote =
      "Solid reasoning—you clearly outlined the core components and data flow. Next, the panel will stress-test another angle.";
  }

  const updatedRubric: RubricItem[] = currentRubric.map((item, idx) => {
    const bump =
      idx === (round - 1) % currentRubric.length
        ? delta
        : Math.floor(delta * 0.4);
    const nextScore = Math.min(100, item.score + bump);
    return {
      ...item,
      score: nextScore,
      status: nextScore >= 70 ? "solid" : nextScore > 0 ? "partial" : "pending",
    };
  });

  const isLastRound = round >= config.totalRounds;
  let nextQuestion: string | undefined;

  if (!isLastRound) {
    if (
      nextSpeaker === "Devil's Advocate" &&
      status === "answered" &&
      wordCount < 25
    ) {
      nextQuestion =
        "Hold on—if the database or message broker suddenly stalls for 5 seconds under peak load, how do you prevent cascading failures and duplicate requests?";
    } else {
      nextQuestion = pool[round % pool.length];
    }
  }

  return {
    feedbackNote,
    idealHint:
      "A strong answer explicitly defines scale constraints, justifies database and caching choices, and covers at least one failure recovery path.",
    nextSpeaker: isLastRound ? undefined : nextSpeaker,
    nextQuestion,
    updatedRubric,
  };
}

export function buildDebriefReport(
  rounds: RoundSummary[],
  rubric: RubricItem[],
): DebriefReport {
  const avgRubric =
    rubric.reduce((acc, item) => acc + item.score, 0) /
    Math.max(1, rubric.length);
  const answeredCount = rounds.filter((r) => r.status === "answered").length;
  const skippedCount = rounds.filter((r) => r.status === "skipped").length;
  const timedOutCount = rounds.filter((r) => r.status === "timed_out").length;

  const overallScore = Number(
    (
      (avgRubric / 10) * 0.8 +
      (answeredCount / Math.max(1, rounds.length)) * 2
    ).toFixed(1),
  );

  const strengths: string[] = [];
  const weakAreas: string[] = [];

  if (answeredCount > 0) {
    strengths.push(
      `Demonstrated a structured architectural approach across ${answeredCount} round(s).`,
    );
  }
  const topRubric = [...rubric].sort((a, b) => b.score - a.score)[0];
  if (topRubric && topRubric.score >= 40) {
    strengths.push(`Showed strongest clarity in ${topRubric.label}.`);
  }
  if (strengths.length === 0) {
    strengths.push(
      "Completed the session under timed pressure—structured repetition will quickly raise your score.",
    );
  }

  if (skippedCount > 0) {
    weakAreas.push(
      `${skippedCount} question(s) skipped—review core design patterns for those domains.`,
    );
  }
  if (timedOutCount > 0) {
    weakAreas.push(
      `Ran out of time on ${timedOutCount} round(s)—outline key bullet points first before expanding.`,
    );
  }
  const lowRubric = [...rubric].sort((a, b) => a.score - b.score)[0];
  if (lowRubric) {
    weakAreas.push(
      `Include explicit trade-offs and edge-case mitigations for ${lowRubric.label}.`,
    );
  }

  return {
    overallScore: Math.min(10, Math.max(1, overallScore)),
    readinessLabel:
      overallScore >= 7.5
        ? "Strong / Interview Ready"
        : overallScore >= 5
          ? "Developing / Needs Polish"
          : "Warmup Stage / Keep Practicing",
    strengths,
    weakAreas,
    rounds,
  };
}
