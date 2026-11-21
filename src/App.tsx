import { useState } from 'react';
import type {
  DebriefReport,
  InterviewConfig,
  RoundSummary,
  RubricItem,
  SpeakerRole,
} from './types/interview';
import {
  buildDebriefReport,
  getInitialRubric,
  startInterviewSession,
} from './services/mockInterviewService';
import { SetupLobby } from './features/arena/components/SetupLobby';
import { InterviewArena } from './features/arena/components/InterviewArena';
import { DebriefScorecard } from './features/arena/components/DebriefScorecard';

type Screen = 'setup' | 'arena' | 'debrief';

export function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [isStarting, setIsStarting] = useState(false);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [firstSpeaker, setFirstSpeaker] = useState<SpeakerRole>('Architect');
  const [firstQuestion, setFirstQuestion] = useState('');
  const [rubric, setRubric] = useState<RubricItem[]>(getInitialRubric());
  const [report, setReport] = useState<DebriefReport | null>(null);

  const handleStart = async (selectedConfig: InterviewConfig) => {
    setIsStarting(true);
    const session = await startInterviewSession(selectedConfig);
    setConfig(selectedConfig);
    setFirstSpeaker(session.firstSpeaker);
    setFirstQuestion(session.firstQuestion);
    setRubric(getInitialRubric());
    setIsStarting(false);
    setScreen('arena');
  };

  const handleComplete = (rounds: RoundSummary[]) => {
    const generated = buildDebriefReport(rounds, rubric);
    setReport(generated);
    setScreen('debrief');
  };

  const handleRestart = () => {
    setScreen('setup');
    setConfig(null);
    setReport(null);
  };

  if (screen === 'arena' && config) {
    return (
      <InterviewArena
        config={config}
        initialSpeaker={firstSpeaker}
        initialQuestion={firstQuestion}
        rubric={rubric}
        onRubricChange={setRubric}
        onComplete={handleComplete}
      />
    );
  }

  if (screen === 'debrief' && report) {
    return <DebriefScorecard report={report} onRestart={handleRestart} />;
  }

  return <SetupLobby onStart={handleStart} isLoading={isStarting} />;
}

export default App;