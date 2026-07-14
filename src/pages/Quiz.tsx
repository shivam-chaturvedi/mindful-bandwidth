import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import Translate, { getTranslation } from '@/components/Translate';
import { allQuestions, shuffleQuestions, getScaleOptions, quizCategories, calculateQuizScores } from '@/lib/quizData';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { saveAssessmentScores, upsertUserProfile } from '@/lib/supabase';

const MIN_REQUIRED = 15;

const Quiz = () => {
  const [shuffled] = useState(() => shuffleQuestions(allQuestions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1);
  const { setGameResponse, language } = useBandwidth();
  const navigate = useNavigate();

  // User details state
  const [formName, setFormName] = useState(() => {
    try {
      return localStorage.getItem('user_name') || '';
    } catch {
      return '';
    }
  });
  const [formEmail, setFormEmail] = useState(() => {
    try {
      return localStorage.getItem('user_email') || '';
    } catch {
      return '';
    }
  });
  const [formSubmitted, setFormSubmitted] = useState(() => {
    try {
      return !!localStorage.getItem('user_name');
    } catch {
      return false;
    }
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      localStorage.setItem('user_name', formName.trim());
      localStorage.setItem('user_email', formEmail.trim().toLowerCase());
      await upsertUserProfile(formName.trim(), formEmail.trim());
      setFormSubmitted(true);
    } catch (err) {
      console.error('Supabase submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fetch translations for all quiz questions when language changes
  useEffect(() => {
    if (language !== 'en' && shuffled.length > 0) {
      shuffled.forEach((q) => {
        getTranslation(q.text, language).catch(() => {});
      });
    }
  }, [language, shuffled]);

  const question = shuffled.length > 0 ? shuffled[currentIndex] : null;
  const options = useMemo(() => question ? getScaleOptions(question) : [], [question]);
  const progress = shuffled.length > 0 ? Math.round(((Object.keys(answers).length) / shuffled.length) * 100) : 0;
  const answered = question ? answers[question.id] !== undefined : false;
  const categoryInfo = question ? quizCategories.find(c => c.key === question.category) : null;

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
    if (!question) return;
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);
    const isLastQuestion = currentIndex === shuffled.length - 1;
    const nowAllAnswered = Object.keys(newAnswers).length === shuffled.length;
    setTimeout(() => {
      if (nowAllAnswered || isLastQuestion) {
        // All questions answered (or answered last one) — go straight to results
        // We'll trigger finish via a flag; use the updated answers
        return;
      }
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }, 250);
  }, [question, currentIndex, shuffled.length, answers]);

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

  const handleFinish = async () => {
    setGameResponse('quizAnswers', answers);
    const scores = calculateQuizScores(answers);
    const overall = Math.round(
      (scores.stress + scores.selfControl + scores.timeManagement + scores.financialThreat + scores.socialConnectedness) / 5
    );

    try {
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
      localStorage.setItem('quizScores', JSON.stringify(scores));
      
      const storedHistory = localStorage.getItem('quiz_scores_history');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      history.push({
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now(),
        scores,
        overall
      });
      localStorage.setItem('quiz_scores_history', JSON.stringify(history));
    } catch {
      /* ignore */
    }

    try {
      const storedName = localStorage.getItem('user_name') || formName;
      const storedEmail = localStorage.getItem('user_email') || formEmail;
      if (storedName && storedEmail) {
        const userId = await upsertUserProfile(storedName, storedEmail);
        if (userId) {
          await saveAssessmentScores(userId, {
            stress: scores.stress,
            selfControl: scores.selfControl,
            timeManagement: scores.timeManagement,
            financialThreat: scores.financialThreat,
            socialConnectedness: scores.socialConnectedness,
            overall,
            rawAnswers: answers,
          });
        }
      }
    } catch (error) {
      console.error('Supabase assessment save failed:', error);
    }

    navigate('/quiz-results');
  };

  const allAnswered = Object.keys(answers).length === shuffled.length;
  const answeredCount = Object.keys(answers).length;
  const reachedMin = answeredCount >= MIN_REQUIRED;
  const isOnLastQuestion = currentIndex === shuffled.length - 1;

  // Auto-navigate to results once all answers are in
  useEffect(() => {
    if (allAnswered && answeredCount > 0) {
      // Small delay so the last selection visually registers before navigating
      const t = setTimeout(() => {
        handleFinish();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [allAnswered]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!formSubmitted) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
          <FloatingShapes />
          <div className="relative z-10 w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">
                <Translate>Tell us about yourself</Translate>
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                <Translate>Please enter your name and email to begin the assessment.</Translate>
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                    <Translate>Name</Translate>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-sm bg-background border border-border px-3.5 py-2.5 rounded-md focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                    <Translate>Email Address</Translate>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full text-sm bg-background border border-border px-3.5 py-2.5 rounded-md focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    <Translate>{formError}</Translate>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gradient-primary text-primary-foreground py-3 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Translate>Saving...</Translate> : (
                    <>
                      <Translate>Start Assessment</Translate>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!question) return <PageTransition><div className="min-h-screen flex items-center justify-center text-foreground"><Translate>Loading...</Translate></div></PageTransition>;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col px-4 py-6 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col flex-1">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              <Translate>Question</Translate> {currentIndex + 1} <Translate>of</Translate> {shuffled.length}
            </span>
            <span className="text-xs font-semibold text-primary">
              {progress}% <Translate>complete</Translate>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-sm bg-muted overflow-hidden mb-4">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Category status */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {quizCategories.map(cat => {
              const total = cat.questionCount;
              const done = categoryProgress[cat.key] || 0;
              const complete = done === total;
              const active = question.category === cat.key;
              return (
                <div
                  key={cat.key}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium border transition-all ${
                    complete
                      ? 'border-success/30 bg-success/5 text-success'
                      : active
                        ? 'border-primary/30 bg-primary/5 text-primary'
                        : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {complete && <CheckCircle2 className="w-3 h-3" />}
                  <span><Translate>{cat.label}</Translate></span>
                  <span className="opacity-60">{done}/{total}</span>
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
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-6"
              >
                {/* Category label */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">
                    <Translate>{categoryInfo?.label || question.categoryLabel}</Translate>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    #{currentIndex + 1}
                  </span>
                </div>

                {/* Question text */}
                <p className="text-base font-medium text-foreground leading-relaxed mb-6">
                  <Translate>{question.text}</Translate>
                </p>

                {/* Answer options */}
                <div className="space-y-1.5">
                  {options.map((opt, idx) => {
                    const selected = answers[question.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(opt.value)}
                        className={`w-full text-left px-4 py-2.5 rounded-md border font-medium text-sm transition-all duration-150 flex items-center gap-3 ${
                          selected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-card text-foreground hover:border-primary/40'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-sm border flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                          selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <Translate>{opt.label}</Translate>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2 mt-4 pb-4">
            <div className="flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-card text-foreground font-medium text-sm disabled:opacity-30 hover:border-primary/30 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <Translate>Back</Translate>
              </button>

              {allAnswered ? (
                <button
                  onClick={handleFinish}
                  className="gradient-primary text-primary-foreground px-6 py-2 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Translate>View Results</Translate>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={currentIndex === shuffled.length - 1 || !reachedMin}
                  title={!reachedMin ? `Answer at least ${MIN_REQUIRED} to skip` : ''}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-card text-foreground font-medium text-sm disabled:opacity-30 hover:border-primary/30 transition-all"
                >
                  <Translate>Skip</Translate>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Early finish button - require minimum 15 answered */}
            {!allAnswered && reachedMin && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleFinish}
                className="w-full py-2 rounded-md text-xs font-medium text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/30 transition-all"
              >
                <Translate>I've answered enough — show my results</Translate> ({answeredCount} <Translate>answered</Translate>)
              </motion.button>
            )}

            {!reachedMin && (
              <p className="text-[11px] text-center text-muted-foreground">
                <Translate>Answer at least</Translate> {MIN_REQUIRED} <Translate>questions to unlock results</Translate> ({answeredCount}/{MIN_REQUIRED})
              </p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Quiz;
