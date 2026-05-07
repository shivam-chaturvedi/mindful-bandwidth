import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import ProgressBar from '@/components/ProgressBar';
import FloatingShapes from '@/components/FloatingShapes';
import { ArrowRight, AlertTriangle } from 'lucide-react';

const mathProblems = [
  { q: '17 + 28 = ?', a: 45 },
  { q: '63 - 19 = ?', a: 44 },
  { q: '8 × 7 = ?', a: 56 },
  { q: '96 ÷ 8 = ?', a: 12 },
];

const Game3Stress = () => {
  const [phase, setPhase] = useState<'calm' | 'stress' | 'done'>('calm');
  const [currentProblem, setCurrentProblem] = useState(0);
  const [answer, setAnswer] = useState('');
  const [calmResults, setCalmResults] = useState<boolean[]>([]);
  const [stressResults, setStressResults] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(6);
  const [showStressOverlay, setShowStressOverlay] = useState(false);
  const { setGameResponse, scores, setScores } = useBandwidth();
  const navigate = useNavigate();

  const submitAnswer = useCallback(() => {
    const correct = parseInt(answer) === mathProblems[currentProblem].a;
    if (phase === 'calm') {
      const newResults = [...calmResults, correct];
      setCalmResults(newResults);
      if (currentProblem >= 1) {
        // Switch to stress phase
        setShowStressOverlay(true);
        setTimeout(() => {
          setShowStressOverlay(false);
          setPhase('stress');
          setCurrentProblem(2);
          setTimeLeft(4); // Less time under stress
        }, 2000);
      } else {
        setCurrentProblem(prev => prev + 1);
        setTimeLeft(6);
      }
    } else {
      const newResults = [...stressResults, correct];
      setStressResults(newResults);
      if (currentProblem >= 3) {
        const calmScore = calmResults.filter(Boolean).length;
        const stressScore = newResults.filter(Boolean).length;
        const drop = Math.max(0, calmScore - stressScore);
        const stressRegScore = Math.round((1 - drop / 2) * 100);
        setGameResponse('game3_stress', { calmResults, stressResults: newResults });
        setScores({ ...scores, stressRegulation: stressRegScore });
        setPhase('done');
        setTimeout(() => navigate('/game/4'), 1500);
      } else {
        setCurrentProblem(prev => prev + 1);
        setTimeLeft(4);
      }
    }
    setAnswer('');
  }, [answer, currentProblem, phase, calmResults, stressResults, scores, setGameResponse, setScores, navigate]);

  useEffect(() => {
    if (phase === 'done' || showStressOverlay) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitAnswer();
          return phase === 'calm' ? 6 : 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentProblem, phase, showStressOverlay, submitAnswer]);

  return (
    <PageTransition>
      <div className={`min-h-screen flex flex-col items-center px-4 py-8 relative transition-colors duration-500 ${
        phase === 'stress' ? 'bg-destructive/5' : ''
      }`}>
        <FloatingShapes />

        {/* Stress overlay */}
        <AnimatePresence>
          {showStressOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-destructive/20 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="glass-card-elevated p-8 text-center max-w-sm mx-4"
              >
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-extrabold text-foreground mb-2">
                  Unexpected bad news!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your plans just changed. Now solve these quickly with less time...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 w-full max-w-md">
          <ProgressBar current={3} total={4} label="Challenge 3 of 4" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {phase === 'stress' ? 'Under Pressure!' : 'Stress Simulation'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {phase === 'stress' ? 'Solve quickly — time is shorter now!' : 'Solve these at your own pace'}
            </p>
          </motion.div>

          {/* Timer */}
          <div className="flex justify-center mb-6">
            <div className={`
              w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl
              ${timeLeft <= 2 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted text-foreground'}
            `}>
              {timeLeft}
            </div>
          </div>

          {phase !== 'done' && !showStressOverlay && (
            <motion.div
              key={currentProblem}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center mb-6"
            >
              <p className="text-2xl font-extrabold text-foreground mb-6">
                {mathProblems[currentProblem].q}
              </p>
              <input
                type="number"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                className="w-32 mx-auto text-center text-2xl font-bold p-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                autoFocus
                placeholder="?"
              />
              <button
                onClick={submitAnswer}
                className="block mx-auto mt-4 gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                Submit
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Game3Stress;
