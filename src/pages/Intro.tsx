import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingShapes from '@/components/FloatingShapes';
import PageTransition from '@/components/PageTransition';
import { Play } from 'lucide-react';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-md text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl gradient-calm flex items-center justify-center shadow-lg"
          >
            <span className="text-4xl">🧠</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 leading-tight"
          >
            Your brain works differently under pressure
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-muted-foreground text-base mb-10 leading-relaxed"
          >
            Let's understand how yours works through a series of quick, 
            interactive experiences. No right or wrong answers — just honest choices.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/game/1')}
            className="gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 inline-flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start 5-minute experience
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-muted-foreground mt-4"
          >
            Takes about 5 minutes · 4 interactive challenges
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Intro;
