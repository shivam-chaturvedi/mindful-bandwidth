import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import ProgressBar from '@/components/ProgressBar';
import FloatingShapes from '@/components/FloatingShapes';
import { GripVertical, ArrowRight, FileText, Users as UsersIcon, Sparkles, BookOpen, Coffee } from 'lucide-react';

const tasks = [
  { id: 'assignment', label: 'Assignment due tomorrow', icon: FileText, urgency: 'high' },
  { id: 'family', label: 'Family responsibility', icon: UsersIcon, urgency: 'medium' },
  { id: 'social', label: 'Social plan with friends', icon: Sparkles, urgency: 'low' },
  { id: 'exam', label: 'Exam prep (next week)', icon: BookOpen, urgency: 'medium' },
  { id: 'personal', label: 'Personal time / rest', icon: Coffee, urgency: 'low' },
];

const Game1Priority = () => {
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
    setGameResponse('game1_priority', order);
    // Score planning based on how well they prioritize urgent vs important
    const examIdx = order.indexOf('exam');
    const personalIdx = order.indexOf('personal');
    const planningScore = Math.max(0, 100 - (examIdx > 2 ? 30 : 0) - (personalIdx === 0 ? 20 : 0));
    setScores({ ...scores, planning: planningScore });
    navigate('/game/2');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center px-4 py-8 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-md">
          <ProgressBar current={1} total={4} label="Challenge 1 of 4" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <span className="text-4xl mb-3 block">⏰</span>
            <h2 className="text-xl font-extrabold text-foreground mb-2">
              Time Pressure Challenge
            </h2>
            <p className="text-muted-foreground text-sm">
              You have 5 things to do today. Drag to rank them — what do you tackle first?
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
                  <span className="text-sm font-semibold text-foreground flex-1">{task.label}</span>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="gradient-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 inline-flex items-center gap-2"
            >
              Next Challenge
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Game1Priority;
