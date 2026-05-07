import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { Check, X, HelpCircle, ClipboardList } from 'lucide-react';

const DailyCheckIn = () => {
  const [answered, setAnswered] = useState<string | null>(null);
  const navigate = useNavigate();

  const responses = [
    { id: 'yes', label: 'Yes', icon: Check, color: 'border-success bg-success/5 hover:bg-success/10 text-success' },
    { id: 'no', label: 'No', icon: X, color: 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive' },
    { id: 'forgot', label: 'Forgot', icon: HelpCircle, color: 'border-warm/30 bg-warm/5 hover:bg-warm/10 text-warm' },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center px-4 py-12 relative min-h-[80vh]">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-sm text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 mx-auto mb-6 rounded-md bg-primary/10 flex items-center justify-center"
          >
            <ClipboardList className="w-7 h-7 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-foreground mb-2"
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
                  className={`w-full p-4 rounded-md border font-semibold flex items-center justify-center gap-2.5 transition-all ${r.color}`}
                >
                  <r.icon className="w-4 h-4" />
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
              <p className="text-lg font-bold text-foreground mb-2">
                {answered === 'yes' ? 'Amazing!' : answered === 'no' ? "That's okay" : 'No worries'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {answered === 'yes'
                  ? 'Every small step compounds. Keep going!'
                  : answered === 'no'
                    ? 'Tomorrow is a fresh start. One day doesn\'t define your journey.'
                    : 'We\'ll remind you. The fact that you checked in matters!'}
              </p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => navigate('/breathing')} className="px-4 py-2 rounded-md border border-border bg-card text-foreground font-medium text-sm hover:border-primary/30 transition-all">
                  Breathing
                </button>
                <button onClick={() => navigate('/home')} className="gradient-primary text-primary-foreground px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-all">
                  Dashboard
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
