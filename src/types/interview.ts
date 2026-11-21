export type RoleTrack =
  | 'Full-Stack Developer'
  | 'Frontend Engineer'
  | 'Backend / API Engineer'
  | 'AI / LLM Engineer'
  | 'System Design';

export type ToughnessMode = 'friendly' | 'standard' | 'tough';

export type SpeakerRole = 'Architect' | "Devil's Advocate" | 'Coach';

export type AnswerStatus = 'answered' | 'timed_out' | 'skipped';

export interface InterviewConfig {
  role: RoleTrack;
  techFocus: string;
  toughness: ToughnessMode;
  totalRounds: 3 | 5 | 7;
  secondsPerQuestion: 90 | 120 | 180;
}

export interface PanelMessage {
  id: string;
  round: number;
  sender: 'panel' | 'user';
  speaker?: SpeakerRole;
  content: string;
  status?: AnswerStatus;
  timestamp: string;
}

export interface RubricItem {
  id: string;
  label: string;
  score: number; // 0 to 100
  status: 'pending' | 'partial' | 'solid';
}

export interface RoundSummary {
  round: number;
  question: string;
  userAnswer: string;
  status: AnswerStatus;
  panelFeedback: string;
  idealHint: string;
}

export interface DebriefReport {
  overallScore: number;
  readinessLabel: string;
  strengths: string[];
  weakAreas: string[];
  rounds: RoundSummary[];
}