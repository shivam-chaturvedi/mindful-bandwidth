import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { Check, X, HelpCircle } from 'lucide-react';

const DailyCheckIn = () => {
  const [answered, setAnswered] = useState<string | null>(null);
  const navigate = useNavigate();

  const responses = [
    { id: 'yes', label: 'Yes', emoji: '✅', icon: Check, color: 'border-success bg-success/5 hover:bg-success/10' },
    { id: 'no', label: 'No', emoji: '❌', icon: X, color: 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10' },
    { id: 'forgot', label: 'Forgot', emoji: '😅', icon: HelpCircle, color: 'border-warm/30 bg-warm/5 hover:bg-warm/10' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-sm text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-sunshine flex items-center justify-center"
          >
            <span className="text-3xl">📋</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-extrabold text-foreground mb-2"
          >
            Daily Check-in
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm mb-8"
          >
            Did you follow your plan today?
          </motion.p>

          {!answered ? (
            <div className="space-y-3">
              {responses.map((r, i) => (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  onClick={() => setAnswered(r.id)}
                  className={`w-full p-4 rounded-xl border-2 font-bold text-foreground flex items-center justify-center gap-3 transition-all ${r.color}`}
                >
                  <span className="text-xl">{r.emoji}</span>
                  {r.label}
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-6"
            >
              <p className="text-lg font-extrabold text-foreground mb-2">
                {answered === 'yes' ? '🎉 Amazing!' : answered === 'no' ? '💪 That\'s okay!' : '🔔 No worries!'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {answered === 'yes'
                  ? 'Every small step compounds. Keep going!'
                  : answered === 'no'
                    ? 'Tomorrow is a fresh start. One day doesn\'t define your journey.'
                    : 'We\'ll remind you. The fact that you checked in matters!'}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/breathing')} className="px-5 py-2.5 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm transition-all hover:border-primary/30">
                  🫁 Breathe
                </button>
                <button onClick={() => navigate('/community')} className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
                  Community
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default DailyCheckIn;
