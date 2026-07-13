import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import ProgressBar from '@/components/ProgressBar';
import FloatingShapes from '@/components/FloatingShapes';
import Translate from '@/components/Translate';
import { calculateQuizScores } from '@/lib/quizData';
import {
  GripVertical, ArrowRight, FileText, Users as UsersIcon, Sparkles, BookOpen, Coffee,
  Wallet, ShoppingCart, PiggyBank, Receipt, CreditCard,
  Mail, MessageCircle, Phone, Calendar, Heart,
  Brain, Activity, Moon, Apple, Dumbbell as DumbbellIcon,
  Clock,
} from 'lucide-react';

type Challenge = {
  id: string;
  domain: 'timeManagement' | 'financialThreat' | 'socialConnectedness' | 'stress' | 'selfControl';
  title: string;
  prompt: string;
  tasks: { id: string; label: string; icon: any }[];
};

const challenges: Challenge[] = [
  {
    id: 'time',
    domain: 'timeManagement',
    title: 'Time Pressure Challenge',
    prompt: 'You have 5 things to do today. Drag to rank them — what do you tackle first?',
    tasks: [
      { id: 'assignment', label: 'Assignment due tomorrow', icon: FileText },
      { id: 'family', label: 'Family responsibility', icon: UsersIcon },
      { id: 'social', label: 'Social plan with friends', icon: Sparkles },
      { id: 'exam', label: 'Exam prep (next week)', icon: BookOpen },
      { id: 'personal', label: 'Personal time / rest', icon: Coffee },
    ],
  },
  {
    id: 'finance',
    domain: 'financialThreat',
    title: 'Money Priorities Challenge',
    prompt: 'You just received ₹5,000. Drag to rank how you would allocate it first.',
    tasks: [
      { id: 'bills', label: 'Pay overdue bills', icon: Receipt },
      { id: 'save', label: 'Move to savings', icon: PiggyBank },
      { id: 'food', label: 'Buy groceries for the week', icon: ShoppingCart },
      { id: 'card', label: 'Reduce credit card balance', icon: CreditCard },
      { id: 'fun', label: 'Treat yourself', icon: Wallet },
    ],
  },
  {
    id: 'social',
    domain: 'socialConnectedness',
    title: 'Connection Challenge',
    prompt: 'You have one free hour. Rank these social actions by impact for you.',
    tasks: [
      { id: 'call', label: 'Call a family member', icon: Phone },
      { id: 'msg', label: 'Message a friend you miss', icon: MessageCircle },
      { id: 'plan', label: 'Plan a meet-up next week', icon: Calendar },
      { id: 'thanks', label: 'Send a thank-you note', icon: Mail },
      { id: 'self', label: 'Do something kind for yourself', icon: Heart },
    ],
  },
  {
    id: 'stress',
    domain: 'stress',
    title: 'Stress Reset Challenge',
    prompt: 'Stress is rising. Rank these reset actions by what would help you most right now.',
    tasks: [
      { id: 'breath', label: '4-7-8 breathing for 2 minutes', icon: Activity },
      { id: 'walk', label: 'Step outside for a walk', icon: DumbbellIcon },
      { id: 'sleep', label: 'A 20-minute power nap', icon: Moon },
      { id: 'snack', label: 'Eat something nourishing', icon: Apple },
      { id: 'brain', label: 'Brain dump on paper', icon: Brain },
    ],
  },
  {
    id: 'impulse',
    domain: 'selfControl',
    title: 'Impulse Pause Challenge',
    prompt: 'You feel an urge to act. Rank the steps that best help you slow down.',
    tasks: [
      { id: 'wait', label: 'Wait 10 minutes before acting', icon: Clock },
      { id: 'list', label: 'List pros and cons', icon: FileText },
      { id: 'future', label: 'Ask: would future-me thank me?', icon: Brain },
      { id: 'ask', label: 'Talk it through with someone', icon: MessageCircle },
      { id: 'breath2', label: 'Take 5 deep breaths', icon: Activity },
    ],
  },
];

function pickChallenge(): Challenge {
  let scores: Record<string, number> | null = null;
  try {
    const stored = localStorage.getItem('quizScores');
    if (stored) scores = JSON.parse(stored);
  } catch {}
  if (!scores) {
    try {
      const ans = localStorage.getItem('quizAnswers');
      if (ans) scores = calculateQuizScores(JSON.parse(ans));
    } catch {}
  }

  let lastId = '';
  try { lastId = localStorage.getItem('lastChallengeId') || ''; } catch {}

  let pool = challenges;
  if (scores) {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => a - b).map(([k]) => k);
    const ordered: Challenge[] = [];
    for (const dom of sorted) {
      const match = challenges.filter(c => c.domain === dom);
      ordered.push(...match);
    }
    if (ordered.length) pool = ordered;
  }

  const filtered = pool.filter(c => c.id !== lastId);
  const candidate = (filtered[0] || pool[0]);
  try { localStorage.setItem('lastChallengeId', candidate.id); } catch {}
  return candidate;
}

const Game1Priority = () => {
  const challenge = useMemo(() => pickChallenge(), []);
  const tasks = challenge.tasks;
  const [order, setOrder] = useState(tasks.map(t => t.id));
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const { setGameResponse, scores, setScores } = useBandwidth();
  const navigate = useNavigate();

  const moveItem = (fromIdx: number, toIdx: number) => {
    const newOrder = [...order];
    const [item] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, item);
    setOrder(newOrder);
  };

  const handleNext = () => {
    setGameResponse(`practice_${challenge.id}`, order);
    const planningScore = 70;
    setScores({ ...scores, planning: planningScore });
    navigate('/game/2');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center px-4 py-8 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-md">
          <ProgressBar current={1} total={4} label="Practice Challenge" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-2">
              <Translate>{challenge.title}</Translate>
            </h2>
            <p className="text-muted-foreground text-sm">
              <Translate>{challenge.prompt}</Translate>
            </p>
          </motion.div>

          <div className="space-y-2 mb-8">
            {order.map((id, idx) => {
              const task = tasks.find(t => t.id === id)!;
              const TaskIcon = task.icon;
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  draggable
                  onDragStart={() => setDraggedIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedIdx !== null) moveItem(draggedIdx, idx);
                    setDraggedIdx(null);
                  }}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 bg-card cursor-grab active:cursor-grabbing
                    transition-all duration-150
                    ${draggedIdx === idx ? 'border-primary shadow-lg scale-[1.02]' : 'border-border hover:border-primary/30'}
                  `}
                >
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="text-xs font-bold w-5 text-center">{idx + 1}</span>
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <TaskIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground flex-1">
                    <Translate>{task.label}</Translate>
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="gradient-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 inline-flex items-center gap-2"
            >
              <Translate>Next Challenge</Translate>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Game1Priority;
