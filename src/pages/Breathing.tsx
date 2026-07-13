import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { Wind, CheckCircle2 } from 'lucide-react';

const PHASES = ['Breathe in', 'Hold', 'Breathe out', 'Hold'] as const;
const DURATIONS = [4, 4, 4, 4]; // seconds per phase
const TOTAL_BREATHS = 3;

const Breathing = () => {
  const [started, setStarted] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [breathCount, setBreatheCount] = useState(0);
  const [timer, setTimer] = useState(DURATIONS[0]);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!started || done) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          const nextPhase = (phaseIdx + 1) % 4;
          if (nextPhase === 0) {
            const newCount = breathCount + 1;
            if (newCount >= TOTAL_BREATHS) {
              setDone(true);
              return 0;
            }
            setBreatheCount(newCount);
          }
          setPhaseIdx(nextPhase);
          return DURATIONS[nextPhase];
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, phaseIdx, breathCount, done]);

  const scale = phaseIdx === 0 ? 1.3 : phaseIdx === 2 ? 0.9 : phaseIdx === 1 ? 1.3 : 0.9;

  return (
    <PageTransition>
      <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden py-12"
        style={{ background: 'linear-gradient(180deg, hsl(200 85% 92%) 0%, hsl(210 33% 98%) 100%)' }}
      >
        {/* Floating clouds */}
        <motion.div
          className="absolute top-16 left-8 w-32 h-16 bg-card/60 rounded-full blur-sm"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-32 right-12 w-24 h-12 bg-card/50 rounded-full blur-sm"
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 left-16 w-28 h-14 bg-card/40 rounded-full blur-sm"
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 text-center px-4">
          {!started && !done ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Wind className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">Reset & Breathe</h1>
              <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
                Take a moment to calm your mind. {TOTAL_BREATHS} deep breaths.
              </p>
              <button
                onClick={() => setStarted(true)}
                className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all"
              >
                Begin
              </button>
            </motion.div>
          ) : done ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="w-14 h-14 rounded-md bg-success/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Well done</h2>
              <p className="text-muted-foreground text-sm mb-8">You've completed your breathing session.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => navigate('/home')} className="w-full gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all">
                  <Translate>Go to Dashboard</Translate>
                </button>
              </div>
            </motion.div>
          ) : (
            <div>
              {/* Breathing circle */}
              <motion.div
                animate={{ scale }}
                transition={{ duration: DURATIONS[phaseIdx], ease: "easeInOut" }}
                className="w-48 h-48 rounded-full mx-auto mb-8 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(200 70% 55% / 0.3), hsl(260 50% 70% / 0.3))' }}
              >
                <div className="w-32 h-32 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={phaseIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-lg font-bold text-foreground"
                    >
                      {PHASES[phaseIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>

              <p className="text-sm text-muted-foreground font-medium">
                {TOTAL_BREATHS - breathCount} breath{TOTAL_BREATHS - breathCount !== 1 ? 's' : ''} left
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: TOTAL_BREATHS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i < breathCount ? 'bg-primary' : i === breathCount ? 'bg-primary/50' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Breathing;
