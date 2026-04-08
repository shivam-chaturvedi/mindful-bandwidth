import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { allQuestions, shuffleQuestions, getScaleOptions, quizCategories } from '@/lib/quizData';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const Quiz = () => {
  const [shuffled] = useState(() => shuffleQuestions(allQuestions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1);
  const { setGameResponse } = useBandwidth();
  const navigate = useNavigate();

  const question = shuffled[currentIndex];
  const options = useMemo(() => getScaleOptions(question), [question]);
  const progress = Math.round(((Object.keys(answers).length) / shuffled.length) * 100);
  const answered = answers[question.id] !== undefined;

  const categoryInfo = quizCategories.find(c => c.key === question.category);

  // Count answered per category
  const categoryProgress = useMemo(() => {
    const counts: Record<string, number> = {};
    quizCategories.forEach(c => { counts[c.key] = 0; });
    Object.keys(answers).forEach(id => {
      const q = allQuestions.find(qq => qq.id === id);
      if (q) counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, [answers]);

  const handleAnswer = useCallback((value: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIndex < shuffled.length - 1) {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  }, [question.id, currentIndex, shuffled.length]);

  const goBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goNext = () => {
    if (currentIndex < shuffled.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    setGameResponse('quizAnswers', answers);
    navigate('/quiz-results');
  };

  const allAnswered = Object.keys(answers).length === shuffled.length;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col px-4 py-6 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col flex-1">
          {/* Top bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground">
                {Object.keys(answers).length} / {shuffled.length} answered
              </span>
              <span className="text-xs font-bold text-primary">
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {quizCategories.map(cat => {
              const total = cat.questionCount;
              const done = categoryProgress[cat.key] || 0;
              const complete = done === total;
              return (
                <div
                  key={cat.key}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    complete
                      ? 'bg-primary/20 text-primary'
                      : question.category === cat.key
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{done}/{total}</span>
                </div>
              );
            })}
          </div>

          {/* Question card */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={question.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.25 }}
                className="glass-card p-6"
              >
                {/* Category badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{question.emoji}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                  >
                    {categoryInfo?.label || question.categoryLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    Q{currentIndex + 1}
                  </span>
                </div>

                {/* Question text */}
                <p className="text-base font-bold text-foreground leading-relaxed mb-6">
                  {question.text}
                </p>

                {/* Answer options */}
                <div className="space-y-2">
                  {options.map(opt => {
                    const selected = answers[question.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                          selected
                            ? 'border-primary bg-primary/10 text-primary scale-[1.02]'
                            : 'border-border bg-card text-foreground hover:border-primary/30 hover:bg-accent/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pb-4">
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm disabled:opacity-30 hover:border-primary/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {allAnswered ? (
              <button
                onClick={handleFinish}
                className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all inline-flex items-center gap-2"
              >
                See My Results
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={currentIndex === shuffled.length - 1}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm disabled:opacity-30 hover:border-primary/30 transition-all"
              >
                Skip
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Quiz;
