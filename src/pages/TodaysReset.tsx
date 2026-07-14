import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import Translate from '@/components/Translate';
import { calculateQuizScores } from '@/lib/quizData';
import {
  Sparkles, Clock, Play, Wind, Brain, Eye, ListTodo, HelpCircle,
  X, CheckCircle2, ChevronRight, ThumbsUp, ThumbsDown, RotateCcw
} from 'lucide-react';

interface ResetActivity {
  id: string;
  title: string;
  duration: string;
  reason: string;
  factor: string;
}

const RESET_ACTIVITIES: ResetActivity[] = [
  {
    id: 'task-prioritization',
    title: 'Task Prioritisation',
    duration: '3 min',
    reason: 'Your planning ability factor is currently low. High time pressure taxes executive function; filtering down to one critical task reduces cognitive load.',
    factor: 'timeManagement'
  },
  {
    id: 'decision-breakdown',
    title: 'Decision Breakdown',
    duration: '3 min',
    reason: 'Your impulse control factor is low. Breaking decisions down into smaller, low-friction steps helps bypass decision fatigue.',
    factor: 'selfControl'
  },
  {
    id: 'thought-dump',
    title: 'Thought Dump',
    duration: '2 min',
    reason: 'Your stress regulation is low. Journaling or dumping intrusive thoughts on paper externalizes mental load and reduces anxiety.',
    factor: 'stress'
  },
  {
    id: 'focus-planning',
    title: 'Focus Planning',
    duration: '5-60 min',
    reason: 'Your time management is low. Committing to a short, structured window helps lower the barrier to starting.',
    factor: 'timeManagement'
  },
  {
    id: 'perceived-control',
    title: 'Perceived Control',
    duration: '3 min',
    reason: 'Your social or external stressors are high. Separating what you can control from what you cannot rebuilds agency.',
    factor: 'socialConnectedness'
  }
];

export default function TodaysReset() {
  const navigate = useNavigate();
  const { gameResponses } = useBandwidth();
  
  // State for active modal / tool
  const [activeQuickRelief, setActiveQuickRelief] = useState<string | null>(null);
  
  // Recommendation state
  const [currentReset, setCurrentReset] = useState<ResetActivity | null>(null);
  const [isResetActive, setIsResetActive] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [ratingCompleted, setRatingCompleted] = useState(false);

  // Load scores and select recommendation
  const quizScores = useMemo(() => {
    let answers = gameResponses.quizAnswers || {};
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      try {
        const stored = localStorage.getItem('quizAnswers');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') answers = parsed;
        }
      } catch { /* ignore */ }
    }
    return calculateQuizScores(answers);
  }, [gameResponses]);

  useEffect(() => {
    // 1. Find the lowest factor
    const sorted = Object.entries(quizScores).sort(([, a], [, b]) => a - b);
    const lowestFactor = sorted[0]?.[0] || 'stress';

    // 2. Load last completed reset ID to prevent repetition
    const lastResetId = localStorage.getItem('last_completed_reset_id');
    
    // 3. Filter candidates
    let candidates = RESET_ACTIVITIES.filter(act => act.factor === lowestFactor);
    if (candidates.length === 0) candidates = [...RESET_ACTIVITIES];

    // Filter out the last one if we have options
    if (candidates.length > 1 && lastResetId) {
      candidates = candidates.filter(c => c.id !== lastResetId);
    }

    // Pick one
    const selected = candidates[Math.floor(Math.random() * candidates.length)] || RESET_ACTIVITIES[0];
    
    // Enhance reason based on latest check-in
    const latestCheckin = localStorage.getItem('latest_check_in');
    let enhancedReason = selected.reason;
    if (latestCheckin === 'no') {
      enhancedReason = `Since you mentioned you couldn't follow your plan today, a ${selected.title.toLowerCase()} reset will help you re-center and ease task paralysis.`;
    } else if (latestCheckin === 'forgot') {
      enhancedReason = `Since you forgot your plan today, this quick ${selected.title.toLowerCase()} exercise will help restore your focus and planning bandwidth.`;
    }

    setCurrentReset({
      ...selected,
      reason: enhancedReason
    });
  }, [quizScores]);

  const handleCompleteRecommendation = (didHelp: boolean) => {
    if (currentReset) {
      try {
        localStorage.setItem('last_completed_reset_id', currentReset.id);
        const history = JSON.parse(localStorage.getItem('reset_completed_history') || '[]');
        history.push({
          id: currentReset.id,
          title: currentReset.title,
          timestamp: Date.now(),
          didHelp
        });
        localStorage.setItem('reset_completed_history', JSON.stringify(history));
      } catch {}
    }
    setRatingCompleted(true);
  };

  const resetFlow = () => {
    setIsResetActive(false);
    setResetCompleted(false);
    setRatingCompleted(false);
  };

  return (
    <PageTransition>
      <div className="px-4 py-8 max-w-lg mx-auto relative min-h-screen">
        <FloatingShapes />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider rounded-sm mb-3">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <Translate>Daily Refresh</Translate>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            <Translate>Today's Reset</Translate>
          </h1>
          <p className="text-muted-foreground text-sm">
            <Translate>One personalized activity and on-demand micro-resets to clear cognitive clutter.</Translate>
          </p>
        </motion.div>

        {/* Recommended Reset Area */}
        <AnimatePresence mode="wait">
          {!isResetActive && !resetCompleted && currentReset && (
            <motion.div
              key="rec-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 mb-8 border-primary/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl -mr-6 -mt-6" />
              <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> <Translate>Personalised Recommendation</Translate>
              </p>
              <h2 className="text-lg font-bold text-foreground mb-2 flex items-center justify-between">
                <Translate>{currentReset.title}</Translate>
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {currentReset.duration}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                <Translate>{currentReset.reason}</Translate>
              </p>
              <button
                onClick={() => setIsResetActive(true)}
                className="w-full gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-md transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <Translate>Start Reset</Translate>
              </button>
            </motion.div>
          )}

          {isResetActive && currentReset && (
            <motion.div
              key="active-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="glass-card p-6 mb-8"
            >
              <ActiveResetFlow
                activityId={currentReset.id}
                title={currentReset.title}
                onComplete={() => {
                  setIsResetActive(false);
                  setResetCompleted(true);
                }}
                onCancel={resetFlow}
              />
            </motion.div>
          )}

          {resetCompleted && !ratingCompleted && (
            <motion.div
              key="rating-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-6 mb-8 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">
                <Translate>Reset Completed!</Translate>
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                <Translate>You have successfully completed this exercise. Taking short, intentional breaks rebuilds working memory capacity.</Translate>
              </p>
              <div className="border-t border-border/60 pt-4">
                <p className="text-xs font-semibold text-foreground mb-3">
                  <Translate>Did this reset help you?</Translate>
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleCompleteRecommendation(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-success/5 hover:border-success/30 transition-all"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-success" />
                    <Translate>Yes</Translate>
                  </button>
                  <button
                    onClick={() => handleCompleteRecommendation(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-destructive/5 hover:border-destructive/30 transition-all"
                  >
                    <ThumbsDown className="w-3.5 h-3.5 text-destructive" />
                    <Translate>No</Translate>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {resetCompleted && ratingCompleted && (
            <motion.div
              key="done-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 mb-8 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">
                <Translate>Thanks for your feedback!</Translate>
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                <Translate>We'll refine your future recommendations based on what works best for you.</Translate>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/home')}
                  className="flex-1 gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm transition-all"
                >
                  <Translate>Go to Dashboard</Translate>
                </button>
                <button
                  onClick={resetFlow}
                  className="px-4 py-2.5 rounded-md border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <Translate>Try Another</Translate>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Relief Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-primary" />
            <Translate>Quick Relief</Translate>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveQuickRelief('breathing')}
              className="group text-left p-4 rounded-md border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mb-3 text-primary group-hover:bg-primary/15 transition-colors">
                <Wind className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-0.5">
                  <Translate>60-Sec Breathing</Translate>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <Translate>Guided breathing cycle</Translate>
                </p>
              </div>
            </button>

            <button
              onClick={() => setActiveQuickRelief('grounding')}
              className="group text-left p-4 rounded-md border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center mb-3 text-purple-500 group-hover:bg-purple-500/15 transition-colors">
                <Eye className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-0.5">
                  <Translate>Grounding Exercise</Translate>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <Translate>5-4-3-2-1 sensory connection</Translate>
                </p>
              </div>
            </button>

            <button
              onClick={() => setActiveQuickRelief('thoughtdump')}
              className="group text-left p-4 rounded-md border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center mb-3 text-yellow-500 group-hover:bg-yellow-500/15 transition-colors">
                <Brain className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-0.5">
                  <Translate>2-Min Thought Dump</Translate>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <Translate>Write and release stress</Translate>
                </p>
              </div>
            </button>

            <button
              onClick={() => setActiveQuickRelief('focustimer')}
              className="group text-left p-4 rounded-md border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-md bg-success/10 flex items-center justify-center mb-3 text-success group-hover:bg-success/15 transition-colors">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-0.5">
                  <Translate>Custom Focus Timer</Translate>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <Translate>Choose any block from 5 to 60 minutes</Translate>
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Relief Modals */}
        <AnimatePresence>
          {activeQuickRelief && (
            <QuickReliefModal
              type={activeQuickRelief}
              onClose={() => setActiveQuickRelief(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE RESET FLOW: rotating individual exercises
// ─────────────────────────────────────────────────────────────────────────────
interface ActiveResetProps {
  activityId: string;
  title: string;
  onComplete: () => void;
  onCancel: () => void;
}

function ActiveResetFlow({ activityId, title, onComplete, onCancel }: ActiveResetProps) {
  const focusDurationOptions = Array.from({ length: 12 }, (_, index) => (index + 1) * 5);
  const [step, setStep] = useState(0);

  // 1. Task Prioritisation State
  const [tasks, setTasks] = useState(['', '', '']);
  const [selectedTaskIdx, setSelectedTaskIdx] = useState<number | null>(null);

  // 2. Decision Breakdown State
  const [decision, setDecision] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);

  // 3. Thought Dump State
  const [dumpText, setDumpText] = useState('');
  const [dumpTimeLeft, setDumpTimeLeft] = useState(120);
  const [isDumpDissolving, setIsDumpDissolving] = useState(false);

  // 4. Focus Planning State
  const [focusGoal, setFocusGoal] = useState('');
  const [focusDurationMinutes, setFocusDurationMinutes] = useState(5);
  const [focusTimeLeft, setFocusTimeLeft] = useState(300);
  const [isFocusTimerActive, setIsFocusTimerActive] = useState(false);

  // 5. Perceived Control State
  const concerns = [
    { text: "Other people's opinions", key: 'opinions' },
    { text: "How I spend my next 10 minutes", key: 'my-actions' },
    { text: "Past mistakes I made", key: 'past' }
  ];
  const [controlSelections, setControlSelections] = useState<Record<string, 'control' | 'no-control'>>({});

  // Countdown for thought dump
  useEffect(() => {
    if (activityId === 'thought-dump' && step === 1 && dumpTimeLeft > 0 && !isDumpDissolving) {
      const t = setTimeout(() => setDumpTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [activityId, step, dumpTimeLeft, isDumpDissolving]);

  useEffect(() => {
    if (!isDumpDissolving) return;
    const t = setTimeout(() => {
      setDumpText('');
      onComplete();
    }, 2000);
    return () => clearTimeout(t);
  }, [isDumpDissolving, onComplete]);

  // Countdown for focus planning
  useEffect(() => {
    if (activityId === 'focus-planning' && step === 2 && isFocusTimerActive && focusTimeLeft > 0) {
      const t = setTimeout(() => setFocusTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    } else if (focusTimeLeft === 0) {
      setIsFocusTimerActive(false);
    }
  }, [activityId, step, isFocusTimerActive, focusTimeLeft]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleThoughtRelease = () => {
    if (!dumpText.trim() || isDumpDissolving) return;
    setIsDumpDissolving(true);
  };
  const startFocusTimer = () => {
    setFocusTimeLeft(focusDurationMinutes * 60);
    setIsFocusTimerActive(true);
    handleNext();
  };

  // Formatting helpers
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Render Exercise UI
  switch (activityId) {
    case 'task-prioritization':
      if (step === 0) {
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><ListTodo className="w-4 h-4" /><Translate>Step 1: Write Current Tasks</Translate></h3>
            <p className="text-xs text-muted-foreground"><Translate>Write down three tasks currently competing for your attention.</Translate></p>
            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <input
                  key={idx}
                  value={task}
                  onChange={(e) => {
                    const next = [...tasks];
                    next[idx] = e.target.value;
                    setTasks(next);
                  }}
                  placeholder={`Task ${idx + 1}...`}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:border-primary/50"
                />
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={onCancel} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Cancel</Translate></button>
              <button
                onClick={handleNext}
                disabled={tasks.some(t => !t.trim())}
                className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs disabled:opacity-50"
              >
                <Translate>Next Step</Translate>
              </button>
            </div>
          </div>
        );
      }
      if (step === 1) {
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><ListTodo className="w-4 h-4" /><Translate>Step 2: Choose The ONE Task</Translate></h3>
            <p className="text-xs text-muted-foreground"><Translate>Select the single most critical task that you MUST tackle today. Let go of everything else for now.</Translate></p>
            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTaskIdx(idx)}
                  className={`w-full text-left p-3 rounded-md text-xs border transition-all ${
                    selectedTaskIdx === idx
                      ? 'border-primary bg-primary/5 font-semibold text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/20'
                  }`}
                >
                  {task}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => setStep(0)} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Back</Translate></button>
              <button
                onClick={handleNext}
                disabled={selectedTaskIdx === null}
                className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs disabled:opacity-50"
              >
                <Translate>Prioritize Task</Translate>
              </button>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2 animate-bounce" />
          <h3 className="text-base font-bold text-foreground"><Translate>Your Focus is Anchored</Translate></h3>
          <p className="text-xs text-muted-foreground px-4">
            <Translate>We have archived the other tasks. For the next hour, your sole objective is:</Translate>
          </p>
          <div className="p-4 rounded-md border border-primary/20 bg-primary/5 max-w-sm mx-auto font-bold text-foreground text-sm shadow-sm">
            {tasks[selectedTaskIdx || 0]}
          </div>
          <p className="text-[10px] text-muted-foreground italic"><Translate>Take a deep breath. You've got this.</Translate></p>
          <button onClick={onComplete} className="w-full gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-xs mt-4"><Translate>Complete Reset</Translate></button>
        </div>
      );

    case 'decision-breakdown':
      if (step === 0) {
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /><Translate>Step 1: Define Decision</Translate></h3>
            <p className="text-xs text-muted-foreground"><Translate>Name one decision you're struggling to make right now (e.g., studying vs gaming, starting a paper).</Translate></p>
            <input
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="I'm struggling to decide..."
              className="w-full text-xs bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:border-primary/50"
            />
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={onCancel} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Cancel</Translate></button>
              <button
                onClick={handleNext}
                disabled={!decision.trim()}
                className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs disabled:opacity-50"
              >
                <Translate>Next Step</Translate>
              </button>
            </div>
          </div>
        );
      }
      if (step === 1) {
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /><Translate>Step 2: Write 2 Tiny Options</Translate></h3>
            <p className="text-xs text-muted-foreground"><Translate>Break down the choice into two simple, low-friction starter actions you can complete in 5 minutes.</Translate></p>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <input
                  key={idx}
                  value={opt}
                  onChange={(e) => {
                    const next = [...options];
                    next[idx] = e.target.value;
                    setOptions(next);
                  }}
                  placeholder={`Starter Option ${idx + 1} (e.g. Write 1 sentence)...`}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:border-primary/50"
                />
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => setStep(0)} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Back</Translate></button>
              <button
                onClick={handleNext}
                disabled={options.some(o => !o.trim())}
                className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs disabled:opacity-50"
              >
                <Translate>Break Down</Translate>
              </button>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-4 text-center">
          <h3 className="text-sm font-bold text-foreground"><Translate>Choose Your Low-Friction Entry</Translate></h3>
          <p className="text-xs text-muted-foreground px-4"><Translate>Commit to doing just one. Tap the easiest choice to proceed:</Translate></p>
          <div className="space-y-2 max-w-sm mx-auto">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOptionIdx(idx)}
                className={`w-full text-center p-3 rounded-md text-xs border transition-all ${
                  selectedOptionIdx === idx
                    ? 'border-primary bg-primary/5 font-bold text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/20'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            onClick={onComplete}
            disabled={selectedOptionIdx === null}
            className="w-full gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-xs mt-4 disabled:opacity-50"
          >
            <Translate>I Commit to This Action</Translate>
          </button>
        </div>
      );

    case 'thought-dump':
      if (step === 0) {
        return (
          <div className="space-y-4 text-center py-2">
            <Brain className="w-12 h-12 text-primary mx-auto mb-2 animate-pulse" />
            <h3 className="text-sm font-bold text-foreground"><Translate>Thought Dump Reset</Translate></h3>
            <p className="text-xs text-muted-foreground px-4">
              <Translate>We will give you 2 minutes to write everything that is running in your head. When finished, you will dissolve and release these thoughts.</Translate>
            </p>
            <div className="flex gap-2 pt-4 border-t border-border">
              <button onClick={onCancel} className="flex-1 px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Cancel</Translate></button>
              <button onClick={handleNext} className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs"><Translate>Begin Dump</Translate></button>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground"><Translate>Dumping Your Mind...</Translate></h3>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-sm">{formatTime(dumpTimeLeft)}</span>
          </div>
          <textarea
            value={dumpText}
            onChange={(e) => setDumpText(e.target.value)}
            disabled={isDumpDissolving}
            placeholder="Type anything... fears, checklist items, random worries. No formatting, no editing. Just write."
            className={`w-full h-32 text-xs bg-background border border-border p-3 rounded-md focus:outline-none focus:border-primary/50 resize-none transition-all duration-[2000ms] ${
              isDumpDissolving ? 'opacity-0 scale-95 select-none blur-sm pointer-events-none' : ''
            }`}
          />
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Cancel</Translate></button>
            <button
              onClick={handleThoughtRelease}
              disabled={!dumpText.trim() || isDumpDissolving}
              className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs disabled:opacity-50"
            >
              {isDumpDissolving ? <Translate>Releasing...</Translate> : <Translate>Release Thoughts</Translate>}
            </button>
          </div>
        </div>
      );

    case 'focus-planning':
      if (step === 0) {
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Clock className="w-4 h-4" /><Translate>Step 1: Set Focus Goal</Translate></h3>
            <p className="text-xs text-muted-foreground"><Translate>Choose one task and the amount of uninterrupted time you want to protect for it.</Translate></p>
            <input
              value={focusGoal}
              onChange={(e) => setFocusGoal(e.target.value)}
              placeholder="My focus goal..."
              className="w-full text-xs bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:border-primary/50"
            />
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Translate>Focus Window</Translate>
              </label>
              <select
                value={focusDurationMinutes}
                onChange={(e) => setFocusDurationMinutes(Number(e.target.value))}
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:border-primary/50"
              >
                {focusDurationOptions.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={onCancel} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Cancel</Translate></button>
              <button
                onClick={handleNext}
                disabled={!focusGoal.trim()}
                className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs disabled:opacity-50"
              >
                <Translate>Next Step</Translate>
              </button>
            </div>
          </div>
        );
      }
      if (step === 1) {
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Clock className="w-4 h-4" /><Translate>Step 2: Prepare Environment</Translate></h3>
            <p className="text-xs text-muted-foreground"><Translate>Before starting your focus block, eliminate these distractions:</Translate></p>
            <ul className="text-xs space-y-1.5 text-muted-foreground list-disc pl-4">
              <li><Translate>Turn off notifications or place your phone out of reach.</Translate></li>
              <li><Translate>Close unrelated browser tabs.</Translate></li>
              <li><Translate>Take a deep breath and sit comfortably.</Translate></li>
            </ul>
            <div className="rounded-md border border-success/20 bg-success/5 px-3 py-2 text-xs text-foreground">
              <Translate>Your selected focus window:</Translate> <span className="font-semibold">{focusDurationMinutes} <Translate>minutes</Translate></span>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => setStep(0)} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Back</Translate></button>
              <button onClick={startFocusTimer} className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs"><Translate>Start Timer</Translate></button>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-4 text-center">
          <h3 className="text-sm font-bold text-foreground flex items-center justify-center gap-1.5"><Clock className="w-4 h-4 text-primary" /><Translate>Focus Block Active</Translate></h3>
          <p className="text-xs text-muted-foreground"><Translate>Focus solely on:</Translate></p>
          <p className="text-sm font-bold text-foreground">{focusGoal}</p>
          <p className="text-[11px] text-muted-foreground"><Translate>Protected window:</Translate> {focusDurationMinutes} <Translate>minutes</Translate></p>
          
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center mx-auto my-4 animate-spin-slow">
            <span className="text-lg font-mono font-bold text-foreground animate-none">{formatTime(focusTimeLeft)}</span>
          </div>

          <div className="flex gap-2 max-w-xs mx-auto">
            <button
              onClick={() => setIsFocusTimerActive(!isFocusTimerActive)}
              className="flex-1 px-3 py-1.5 border border-border bg-card rounded-md text-xs font-semibold text-foreground hover:bg-muted transition-all"
            >
              {isFocusTimerActive ? <Translate>Pause</Translate> : <Translate>Start</Translate>}
            </button>
            <button
              onClick={onComplete}
              className="flex-1 gradient-primary text-primary-foreground py-1.5 rounded-md font-semibold text-xs"
            >
              <Translate>Done</Translate>
            </button>
          </div>
        </div>
      );

    case 'perceived-control':
      if (step === 0) {
        return (
          <div className="space-y-4 text-center py-2">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground"><Translate>Control Filter Reset</Translate></h3>
            <p className="text-xs text-muted-foreground px-4">
              <Translate>Anxiety builds when we focus on items outside our influence. This exercise helps categorize worries so you can protect your mental energy.</Translate>
            </p>
            <div className="flex gap-2 pt-4 border-t border-border">
              <button onClick={onCancel} className="flex-1 px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Cancel</Translate></button>
              <button onClick={handleNext} className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs"><Translate>Start Sort</Translate></button>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground"><Translate>Categorize Concerns</Translate></h3>
          <p className="text-xs text-muted-foreground"><Translate>Sort these concerns into "In My Control" or "Outside My Control":</Translate></p>
          <div className="space-y-3">
            {concerns.map((con) => {
              const selection = controlSelections[con.key];
              return (
                <div key={con.key} className="p-3 border border-border rounded-md bg-card space-y-2">
                  <p className="text-xs font-semibold text-foreground"><Translate>{con.text}</Translate></p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setControlSelections(prev => ({ ...prev, [con.key]: 'control' }))}
                      className={`flex-1 py-1 rounded-sm text-[10px] border transition-all ${
                        selection === 'control'
                          ? 'bg-success/10 border-success/30 text-success font-semibold'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      <Translate>In My Control</Translate>
                    </button>
                    <button
                      onClick={() => setControlSelections(prev => ({ ...prev, [con.key]: 'no-control' }))}
                      className={`flex-1 py-1 rounded-sm text-[10px] border transition-all ${
                        selection === 'no-control'
                          ? 'bg-destructive/10 border-destructive/30 text-destructive font-semibold'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      <Translate>Outside Control</Translate>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={onComplete}
            disabled={concerns.some(c => !controlSelections[c.key])}
            className="w-full gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-xs mt-4 disabled:opacity-50"
          >
            <Translate>Complete exercise</Translate>
          </button>
        </div>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK RELIEF MODAL UTILITY
// ─────────────────────────────────────────────────────────────────────────────
interface QuickReliefProps {
  type: string;
  onClose: () => void;
}

function QuickReliefModal({ type, onClose }: QuickReliefProps) {
  const focusDurationOptions = Array.from({ length: 12 }, (_, index) => (index + 1) * 5);
  const [step, setStep] = useState(0);

  // 1. Breathing state
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathsLeft, setBreathsLeft] = useState(8);
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState(false);

  // 2. Grounding state
  const groundingSteps = [
    { label: "List 5 things you can SEE around you", count: 5, placeholder: "e.g., Lamp, Desk, Book..." },
    { label: "List 4 things you can TOUCH/FEEL", count: 4, placeholder: "e.g., Cool chair, Warm tea..." },
    { label: "List 3 things you can HEAR right now", count: 3, placeholder: "e.g., Traffic, Fan hum, Birds..." },
    { label: "List 2 things you can SMELL", count: 2, placeholder: "e.g., Coffee, Soap, Fresh air..." },
    { label: "List 1 thing you can TASTE", count: 1, placeholder: "e.g., Mint, Toothpaste, Water..." }
  ];
  const [groundingInputs, setGroundingInputs] = useState<string[][]>(Array(5).fill([]).map((_, i) => Array(groundingSteps[i].count).fill('')));

  // 3. Thought dump state
  const [dumpText, setDumpText] = useState('');
  const [dumpSeconds, setDumpSeconds] = useState(120);
  const [isDumpDissolving, setIsDumpDissolving] = useState(false);

  // 4. Focus Timer state
  const [focusDurationMinutes, setFocusDurationMinutes] = useState(5);
  const [focusSeconds, setFocusSeconds] = useState(300);
  const [isFocusActive, setIsFocusActive] = useState(false);

  // Timer loop for breathing
  useEffect(() => {
    if (type === 'breathing' && isBreathingRunning && breathsLeft > 0) {
      const t = setTimeout(() => {
        if (breathSeconds > 1) {
          setBreathSeconds(prev => prev - 1);
        } else {
          // Phase transitions
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            setBreathSeconds(4);
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            setBreathSeconds(4);
          } else if (breathPhase === 'Exhale') {
            setBreathPhase('Rest');
            setBreathSeconds(4);
          } else {
            setBreathPhase('Inhale');
            setBreathSeconds(4);
            setBreathsLeft(prev => prev - 1);
          }
        }
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [type, isBreathingRunning, breathPhase, breathSeconds, breathsLeft]);

  // Timer loop for thought dump
  useEffect(() => {
    if (type === 'thoughtdump' && step === 1 && dumpSeconds > 0 && !isDumpDissolving) {
      const t = setTimeout(() => setDumpSeconds(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [type, step, dumpSeconds, isDumpDissolving]);

  useEffect(() => {
    if (type !== 'thoughtdump' || !isDumpDissolving) return;
    const t = setTimeout(() => {
      setDumpText('');
      setStep(2);
      setIsDumpDissolving(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [type, isDumpDissolving]);

  // Timer loop for focus timer
  useEffect(() => {
    if (type === 'focustimer' && isFocusActive && focusSeconds > 0) {
      const t = setTimeout(() => setFocusSeconds(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    } else if (focusSeconds === 0) {
      setIsFocusActive(false);
    }
  }, [type, isFocusActive, focusSeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getBreathingLabel = () => {
    switch (breathPhase) {
      case 'Inhale': return 'Breathe In';
      case 'Hold': return 'Hold Breath';
      case 'Exhale': return 'Breathe Out';
      case 'Rest': return 'Pause empty';
    }
  };

  // Render correct modal content
  const renderModalContent = () => {
    switch (type) {
      case 'breathing':
        if (breathsLeft === 0) {
          return (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-success mx-auto" />
              <h3 className="text-lg font-bold text-foreground"><Translate>Breathing Completed</Translate></h3>
              <p className="text-xs text-muted-foreground px-4">
                <Translate>Slowing down your respiration stabilizes heart rate variability and clears adrenaline spikes. You're ready to proceed.</Translate>
              </p>
              <button onClick={onClose} className="w-full gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-xs"><Translate>Close</Translate></button>
            </div>
          );
        }
        return (
          <div className="text-center py-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-foreground"><Translate>60-Second Box Breathing</Translate></h3>
              <p className="text-[10px] text-muted-foreground">{breathsLeft} <Translate>breath cycles remaining</Translate></p>
            </div>

            {/* Breathing Animation Circle */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <motion.div
                animate={{
                  scale: isBreathingRunning
                    ? breathPhase === 'Inhale' ? 1.4 : breathPhase === 'Hold' ? 1.4 : breathPhase === 'Exhale' ? 1.0 : 1.0
                    : 1.0
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className={`absolute inset-0 rounded-full border-4 ${
                  breathPhase === 'Inhale' ? 'border-primary bg-primary/5' :
                  breathPhase === 'Hold' ? 'border-purple-500 bg-purple-500/5' :
                  breathPhase === 'Exhale' ? 'border-success bg-success/5' : 'border-border bg-card'
                }`}
              />
              <div className="z-10 flex flex-col items-center">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  <Translate>{getBreathingLabel()}</Translate>
                </span>
                <span className="text-2xl font-bold text-foreground font-mono mt-1">{breathSeconds}</span>
              </div>
            </div>

            <div className="flex gap-2 max-w-xs mx-auto">
              <button
                onClick={() => setIsBreathingRunning(!isBreathingRunning)}
                className="flex-1 gradient-primary text-primary-foreground py-2 rounded-md font-semibold text-xs"
              >
                {isBreathingRunning ? <Translate>Pause</Translate> : <Translate>Start Breathing</Translate>}
              </button>
              <button onClick={onClose} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Close</Translate></button>
            </div>
          </div>
        );

      case 'grounding': {
        if (step >= groundingSteps.length) {
          return (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-purple-500 mx-auto" />
              <h3 className="text-lg font-bold text-foreground"><Translate>Grounding Completed</Translate></h3>
              <p className="text-xs text-muted-foreground px-4">
                <Translate>Sensory grounding anchors your mind in the physical present, interrupting stress-induced cognitive tunneling.</Translate>
              </p>
              <button onClick={onClose} className="w-full gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-xs"><Translate>Close</Translate></button>
            </div>
          );
        }
        
        const currentStepData = groundingSteps[step];
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Eye className="w-4 h-4 text-purple-500" /><Translate>5-4-3-2-1 Grounding</Translate></h3>
              <p className="text-[10px] text-muted-foreground"><Translate>Step</Translate> {step + 1} <Translate>of</Translate> 5</p>
            </div>
            
            <p className="text-xs font-semibold text-foreground leading-relaxed">
              <Translate>{currentStepData.label}</Translate>:
            </p>

            <div className="space-y-2">
              {groundingInputs[step].map((val, idx) => (
                <input
                  key={idx}
                  value={val}
                  onChange={(e) => {
                    const next = [...groundingInputs];
                    next[step][idx] = e.target.value;
                    setGroundingInputs(next);
                  }}
                  placeholder={`${currentStepData.placeholder.split(', ')[idx] || 'Item...'} (${idx + 1}/${currentStepData.count})`}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:border-purple-500/50"
                />
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => step > 0 && setStep(prev => prev - 1)}
                disabled={step === 0}
                className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground disabled:opacity-30"
              >
                <Translate>Back</Translate>
              </button>
              <button
                onClick={() => setStep(prev => prev + 1)}
                disabled={groundingInputs[step].some(v => !v.trim())}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-semibold text-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1"
              >
                <Translate>Next Step</Translate> <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      case 'thoughtdump':
        if (step === 0) {
          return (
            <div className="text-center py-4 space-y-4">
              <Brain className="w-14 h-14 text-yellow-500 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-foreground"><Translate>2-Minute Thought Dump</Translate></h3>
              <p className="text-xs text-muted-foreground px-4">
                <Translate>We will give you 2 minutes to write out any mental noise. Once done, we will dissolve and fade the writing to clear it from your mind.</Translate>
              </p>
              <div className="flex gap-2 pt-2">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Cancel</Translate></button>
                <button onClick={() => setStep(1)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-md font-semibold text-xs"><Translate>Begin Dump</Translate></button>
              </div>
            </div>
          );
        }
        if (step === 2) {
          return (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-yellow-500 mx-auto" />
              <h3 className="text-lg font-bold text-foreground"><Translate>Thoughts Released</Translate></h3>
              <p className="text-xs text-muted-foreground px-4">
                <Translate>Externalizing those thoughts reduces cognitive load. You can close this slate and return with a clearer mind.</Translate>
              </p>
              <button onClick={onClose} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-md font-semibold text-xs">
                <Translate>Close</Translate>
              </button>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground"><Translate>Thought Dump Slate</Translate></h3>
              <span className="text-xs font-mono font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded-sm">{formatTime(dumpSeconds)}</span>
            </div>
            <textarea
              value={dumpText}
              onChange={(e) => setDumpText(e.target.value)}
              disabled={isDumpDissolving}
              placeholder="Dump whatever worries or tasks are buzzing in your head. Write continuously..."
              className={`w-full h-36 text-xs bg-background border border-border p-3 rounded-md focus:outline-none focus:border-yellow-500/50 resize-none transition-all duration-[2000ms] ${
                isDumpDissolving ? 'opacity-0 scale-95 blur-sm select-none pointer-events-none' : ''
              }`}
            />
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Close</Translate></button>
              <button
                onClick={() => setIsDumpDissolving(true)}
                disabled={!dumpText.trim() || isDumpDissolving}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md font-semibold text-xs disabled:opacity-50"
              >
                {isDumpDissolving ? <Translate>Releasing...</Translate> : <Translate>Release Thoughts</Translate>}
              </button>
            </div>
          </div>
        );
      
      case 'focustimer':
        if (step === 0) {
          return (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-bold text-foreground flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-success" />
                  <Translate>Custom Focus Window</Translate>
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  <Translate>Choose how long you want to protect this focus block.</Translate>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Translate>Focus Window</Translate>
                </label>
                <select
                  value={focusDurationMinutes}
                  onChange={(e) => setFocusDurationMinutes(Number(e.target.value))}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-md focus:outline-none focus:border-success/50"
                >
                  {focusDurationOptions.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes} minutes
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground">
                  <Translate>Close</Translate>
                </button>
                <button
                  onClick={() => {
                    setFocusSeconds(focusDurationMinutes * 60);
                    setIsFocusActive(true);
                    setStep(1);
                  }}
                  className="flex-1 bg-success hover:bg-success-dark text-white py-2 rounded-md font-semibold text-xs transition-all"
                >
                  <Translate>Start Timer</Translate>
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="text-center py-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center justify-center gap-1.5"><Clock className="w-4 h-4 text-success" /><Translate>Custom Focus Window</Translate></h3>
              <p className="text-[10px] text-muted-foreground">{focusDurationMinutes} <Translate>minute protected block</Translate></p>
            </div>

            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-4 border-success/20 border-t-success ${isFocusActive ? 'animate-spin-slow' : ''}`} />
              <span className="text-2xl font-mono font-bold text-foreground">{formatTime(focusSeconds)}</span>
            </div>

            <div className="flex gap-2 max-w-xs mx-auto">
              <button
                onClick={() => setIsFocusActive(!isFocusActive)}
                className="flex-1 bg-success hover:bg-success-dark text-white py-2 rounded-md font-semibold text-xs transition-all"
              >
                {isFocusActive ? <Translate>Pause</Translate> : <Translate>Start Timer</Translate>}
              </button>
              <button
                onClick={() => {
                  setIsFocusActive(false);
                  setStep(0);
                }}
                className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"
              >
                <Translate>Change</Translate>
              </button>
              <button onClick={onClose} className="px-4 py-2 border border-border rounded-md text-xs font-semibold text-muted-foreground"><Translate>Done</Translate></button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-card border border-border rounded-lg p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {renderModalContent()}
      </motion.div>
    </div>
  );
}
