import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import ProgressBar from '@/components/ProgressBar';
import FloatingShapes from '@/components/FloatingShapes';

const options = [
  { id: 'yes', label: 'Say yes immediately', emoji: '✅', score: 20, desc: 'Help them right away' },
  { id: 'delay', label: 'Say "let me check"', emoji: '⏳', score: 80, desc: 'Buy time to think' },
  { id: 'no', label: 'Say no politely', emoji: '🚫', score: 60, desc: 'Protect your time' },
  { id: 'help', label: 'Ask for help instead', emoji: '🤝', score: 100, desc: 'Seek support first' },
];

const Game4Social = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { setGameResponse, scores, setScores } = useBandwidth();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    setSelected(id);
    const option = options.find(o => o.id === id)!;
    setGameResponse('game4_social', id);

    // Compute final scores
    const socialScore = option.score;
    const financialStress = Math.round(40 + Math.random() * 30); // Simulated
    setScores({
      ...scores,
      socialSupport: socialScore,
      financialStress: financialStress,
    });

    setTimeout(() => navigate('/results'), 1000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center px-4 py-8 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-md">
          <ProgressBar current={4} total={4} label="Challenge 4 of 4" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <span className="text-4xl mb-3 block">🧑‍🤝‍🧑</span>
            <h2 className="text-xl font-extrabold text-foreground mb-2">
              Social Decision
            </h2>
            <p className="text-muted-foreground text-sm">
              You're overwhelmed with work. A friend asks for urgent help. What do you do?
            </p>
          </motion.div>

          <div className="space-y-3">
            {options.map((opt, i) => (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={() => handleSelect(opt.id)}
                disabled={!!selected}
                className={`
                  w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all duration-200
                  ${selected === opt.id
                    ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                    : selected
                      ? 'border-border bg-card opacity-50'
                      : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                  }
                `}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <p className="font-bold text-foreground text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Game4Social;
