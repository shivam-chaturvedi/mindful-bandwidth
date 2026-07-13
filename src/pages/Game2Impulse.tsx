import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import ProgressBar from '@/components/ProgressBar';
import FloatingShapes from '@/components/FloatingShapes';
import Translate from '@/components/Translate';
import { ArrowRight, Coins, Clock } from 'lucide-react';

const choices = [
  { now: '₹500 today', later: '₹900 next week', nowVal: 500, laterVal: 900 },
  { now: '₹200 right now', later: '₹450 in 3 days', nowVal: 200, laterVal: 450 },
  { now: '₹1,000 today', later: '₹1,800 in 2 weeks', nowVal: 1000, laterVal: 1800 },
];

const Game2Impulse = () => {
  const [currentChoice, setCurrentChoice] = useState(0);
  const [answers, setAnswers] = useState<('now' | 'later')[]>([]);
  const [timeLeft, setTimeLeft] = useState(8);
  const [showResult, setShowResult] = useState(false);
  const { setGameResponse, scores, setScores } = useBandwidth();
  const navigate = useNavigate();

  const handleChoice = useCallback((choice: 'now' | 'later') => {
    const newAnswers = [...answers, choice];
    setAnswers(newAnswers);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      if (currentChoice < choices.length - 1) {
        setCurrentChoice(prev => prev + 1);
        setTimeLeft(8);
      } else {
        const impulseScore = newAnswers.filter(a => a === 'later').length;
        const score = Math.round((impulseScore / choices.length) * 100);
        setGameResponse('game2_impulse', newAnswers);
        setScores({ ...scores, impulseControl: score });
        navigate('/game/3');
      }
    }, 800);
  }, [answers, currentChoice, navigate, scores, setGameResponse, setScores]);

  useEffect(() => {
    if (showResult) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleChoice('now');
          return 8;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentChoice, showResult, handleChoice]);

  const choice = choices[currentChoice];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center px-4 py-8 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-md">
          <ProgressBar current={2} total={4} label="Challenge 2 of 4" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              <Translate>Instant vs Future</Translate>
            </h2>
            <p className="text-muted-foreground text-sm">
              <Translate>Choose what you'd prefer. The timer adds pressure!</Translate>
            </p>
          </motion.div>

          {/* Timer */}
          <div className="flex justify-center mb-6">
            <div className={`
              w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl
              ${timeLeft <= 3 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted text-foreground'}
            `}>
              {timeLeft}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentChoice}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <button
                onClick={() => handleChoice('now')}
                disabled={showResult}
                className="p-6 rounded-xl border-2 border-warm/30 bg-sunshine/30 hover:border-warm hover:shadow-lg transition-all duration-200 text-center group"
              >
                <Coins className="w-8 h-8 mx-auto mb-3 text-warm group-hover:scale-110 transition-transform" />
                <p className="font-extrabold text-foreground text-lg">{choice.now}</p>
                <p className="text-xs text-muted-foreground mt-1"><Translate>Get it now</Translate></p>
              </button>

              <button
                onClick={() => handleChoice('later')}
                disabled={showResult}
                className="p-6 rounded-xl border-2 border-primary/30 bg-sky/30 hover:border-primary hover:shadow-lg transition-all duration-200 text-center group"
              >
                <Clock className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-extrabold text-foreground text-lg">{choice.later}</p>
                <p className="text-xs text-muted-foreground mt-1"><Translate>Wait for more</Translate></p>
              </button>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2">
            {choices.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i < currentChoice ? 'bg-primary' : i === currentChoice ? 'bg-primary/50' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Game2Impulse;
