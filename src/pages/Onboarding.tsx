import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import FloatingShapes from '@/components/FloatingShapes';
import PageTransition from '@/components/PageTransition';
import { Brain, Target, Clock, Zap, Shield, Sparkles } from 'lucide-react';

const options = [
  { id: 'stress', label: 'Reduce stress', icon: Brain, color: 'bg-sky' },
  { id: 'control', label: 'Feel more in control', icon: Target, color: 'bg-mint' },
  { id: 'procrastinate', label: 'Stop procrastinating', icon: Clock, color: 'bg-sunshine' },
  { id: 'decisions', label: 'Make better decisions', icon: Zap, color: 'bg-blush' },
  { id: 'pressure', label: 'Handle pressure better', icon: Shield, color: 'bg-lavender/40' },
  { id: 'other', label: 'Something else', icon: Sparkles, color: 'bg-peach/30' },
];

const Onboarding = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const { setOnboardingSelections } = useBandwidth();
  const navigate = useNavigate();

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleContinue = () => {
    setOnboardingSelections(selected);
    navigate('/intro');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
              What's on your mind?
            </h1>
            <p className="text-muted-foreground text-base">
              Select everything that resonates with you
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {options.map((opt, i) => {
              const Icon = opt.icon;
              const isSelected = selected.includes(opt.id);
              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  onClick={() => toggle(opt.id)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${isSelected
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                    }
                  `}
                >
                  <div className={`w-10 h-10 rounded-lg ${opt.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-foreground/70" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <button
              onClick={handleContinue}
              disabled={selected.length === 0}
              className={`
                px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200
                ${selected.length > 0
                  ? 'gradient-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }
              `}
            >
              Continue
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Onboarding;
