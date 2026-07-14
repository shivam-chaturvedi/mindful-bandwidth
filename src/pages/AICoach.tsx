import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { calculateQuizScores } from '@/lib/quizData';
import { getRecommendedSolutions, Solution } from '@/lib/solutions';
import { getTranslation } from '@/components/Translate';
import { invokeCoachFunction } from '@/lib/supabase';
import { ArrowRight, Bot, User, Send, Sparkles, Languages, BookmarkPlus, Check } from 'lucide-react';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string; // Original English text
  translatedText?: Record<string, string>; // Translated versions
  options?: string[]; // Original English options
  translatedOptions?: Record<string, string[]>; // Translated versions of options
  solutionCards?: Solution[];
}

const CURRENT_PLAN_STORAGE_KEY = 'current_plan_id';
const PINNED_SOLUTIONS_STORAGE_KEY = 'pinned_solutions';
const COACH_FIRST_USE_COMPLETED_KEY = 'ai_coach_first_use_completed';

type CoachContent = {
  role: 'model' | 'user';
  parts: { text: string }[];
};

type CoachMode = 'initial' | 'followup' | 'closing' | 'open_chat';

async function callCoachModel<T>(
  mode: CoachMode,
  contents: CoachContent[],
  systemInstructionText: string
): Promise<T> {
  return invokeCoachFunction<T>({
    mode,
    contents,
    systemInstructionText,
  });
}

const domainLabels: Record<string, string> = {
  stress: 'Stress Regulation',
  selfControl: 'Self-Control',
  timeManagement: 'Time Management',
  financialThreat: 'Financial Security',
  socialConnectedness: 'Social Connection',
};

async function translateText(text: string, to: string, from = 'auto'): Promise<string> {
  if (!text || !text.trim()) return text;
  try {
    return await getTranslation(text, to, from);
  } catch (e) {
    console.error('Translation failed:', e);
    return text;
  }
}

async function translateOptions(opts: string[], to: string, from = 'auto'): Promise<string[]> {
  if (!opts || opts.length === 0) return [];
  try {
    const results = await Promise.all(opts.map((opt) => getTranslation(opt, to, from)));
    if (Array.isArray(results)) {
      return results;
    }
    return opts;
  } catch (e) {
    console.error('Options translation failed:', e);
    return opts;
  }
}

function buildCoachContents(history: Message[]): CoachContent[] {
  const contents: CoachContent[] = [];
  
  history.forEach((msg) => {
    const role = msg.role === 'ai' ? 'model' : 'user';
    const text = msg.text;
    
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += '\n\n' + text;
    } else {
      contents.push({
        role,
        parts: [{ text }]
      });
    }
  });

  return contents;
}

const AICoach = () => {
  const { gameResponses } = useBandwidth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState(0);
  const [typing, setTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const { language } = useBandwidth();
  const [errorMsg, setErrorMsg] = useState('');
  const [translating, setTranslating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionVersionRef = useRef(0);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [hasCompletedFirstCoachSession, setHasCompletedFirstCoachSession] = useState(false);

  const [userName, setUserName] = useState('');
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_name');
      if (stored) setUserName(stored);
    } catch {
      /* ignore localStorage access issues */
    }
  }, []);

  useEffect(() => {
    try {
      setCurrentPlanId(localStorage.getItem(CURRENT_PLAN_STORAGE_KEY));
    } catch {
      /* ignore localStorage access issues */
    }
  }, []);

  useEffect(() => {
    try {
      setHasCompletedFirstCoachSession(localStorage.getItem(COACH_FIRST_USE_COMPLETED_KEY) === 'true');
    } catch {
      /* ignore localStorage access issues */
    }
  }, []);

  const quizScores = (() => {
    let answers = gameResponses.quizAnswers || {};
    if (!answers || Object.keys(answers).length === 0) {
      try {
        const stored = localStorage.getItem('quizAnswers');
        if (stored) answers = JSON.parse(stored);
      } catch {
        /* ignore */
      }
    }
    return calculateQuizScores(answers);
  })();

  const sorted = Object.entries(quizScores).sort(([, a], [, b]) => a - b);
  const weakestDomain = sorted[0]?.[0] || 'stress';

  // Build a context string from scores
  const scoresContext = JSON.stringify(quizScores);

  const buildMockFirstQuestion = (): Message[] => {
    if (hasCompletedFirstCoachSession) {
      return [
        {
          id: 'intro',
          role: 'ai',
          text: `Hi ${userName ? `${userName}, ` : ''}I'm here to listen and help you think things through at your pace.`
        },
        {
          id: 'q1',
          role: 'ai',
          text: `What's on your mind today?`
        }
      ];
    }

    return [
      {
        id: 'intro',
        role: 'ai',
        text: `Hi ${userName ? `${userName}, ` : ''}I looked over your assessment and your lowest score right now is **${domainLabels[weakestDomain]}** at **${quizScores[weakestDomain] || 0}/100**. That gives us a useful starting point, but I want to hear how this is actually showing up for you.`
      },
      {
        id: 'q1',
        role: 'ai',
        text: `Does that seem like the area putting the most pressure on you right now, or is something else feeling heavier?`
      }
    ];
  };

  const buildMockFollowUp = (targetPhase: number): Message | null => {
    if (targetPhase === 2) {
      return {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: `Thank you for sharing that. What part of this feels the heaviest for you right now?`
      };
    }
    if (targetPhase === 3) {
      return {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: `What have you already tried, and what feels realistic for you to commit to this week?`
      };
    }
    return null;
  };

  const buildMockClosing = (): Message => {
    let shown: string[] = [];
    try {
      const storedShown = localStorage.getItem('ai_coach_shown_solutions');
      if (storedShown) shown = JSON.parse(storedShown);
    } catch {
      /* ignore localStorage access issues */
    }

    const solutions = getRecommendedSolutions(quizScores, undefined, shown);

    try {
      const nextShown = Array.from(new Set([...shown, ...solutions.map(s => s.id)]));
      localStorage.setItem('ai_coach_shown_solutions', JSON.stringify(nextShown));
    } catch {
      /* ignore localStorage access issues */
    }

    return {
      id: 'solutions',
      role: 'ai',
      text: `Thank you for sharing all of that. I pulled together a few practical plans that fit what you've described and that you can pin if one feels like the right next step for you.`,
      solutionCards: solutions
    };
  };

  const buildMockOpenChat = (): Message => ({
    id: `ai-${Date.now()}`,
    role: 'ai',
    text: `That makes sense. Let's stay with that and look for one small step that would make this feel more manageable for you this week.`
  });

  const aiGenerateFirstQuestion = async (): Promise<Message[] | null> => {
    const weak = sorted[0];
    const systemPrompt = hasCompletedFirstCoachSession
      ? `You are an empathetic cognitive bandwidth coach using the Cognitive Scarcity Index for Youth (CSI-Y) framework.
The user's name is ${userName || 'Participant'}. Address them by name in your intro greeting.
The user has already used this coach before.
The user has assessment scores available as background context: ${scoresContext}.

You must reply ONLY in JSON with this exact shape:
{"intro":"<1-2 sentence warm intro that invites the user to lead the conversation>","question":"<exactly one short open-ended question that asks what is on their mind today>","options":null}

Do not lead with scores, weakest domains, or a scripted assessment recap unless the user asks. Do not include markdown code block fences (like \`\`\`json) in your response, just the raw JSON.`
      : `You are an empathetic cognitive bandwidth coach using the Cognitive Scarcity Index for Youth (CSI-Y) framework.
The user's name is ${userName || 'Participant'}. Address them by name in your intro greeting.
The user just completed an assessment with these scores (0-100, higher = better): ${scoresContext}.
Their weakest area is "${domainLabels[weak[0]]}" at ${weak[1]}/100.

You must reply ONLY in JSON with this exact shape:
{"intro":"<1-2 sentence warm intro that briefly mentions their lowest score and frames it as a starting point, not a fixed diagnosis>","question":"<one short question asking whether this is actually the biggest source of stress right now, or whether something else feels heavier>","options":null}

Do not lead with multiple suggestions or preset answer choices. Do not include markdown code block fences (like \`\`\`json) in your response, just the raw JSON.`;

    try {
      const json = await callCoachModel<{ intro: string; question: string }>(
        'initial',
        [{ role: 'user', parts: [{ text: 'Start session.' }] }],
        systemPrompt
      );
      return [
        { id: 'intro', role: 'ai', text: json.intro },
        { id: 'q1', role: 'ai', text: json.question },
      ];
    } catch (e) {
      console.error('Coach model first question failed', e);
      setErrorMsg(e instanceof Error ? e.message : 'Live coaching is temporarily unavailable, so we switched to the built-in coach flow.');
      return buildMockFirstQuestion();
    }
  };

  const aiGenerateFollowUp = async (history: Message[]): Promise<Message | null> => {
    const contents = buildCoachContents(history);
    const systemPrompt = `You are an empathetic cognitive bandwidth coach using the Cognitive Scarcity Index for Youth (CSI-Y) framework.
Scores: ${scoresContext}

Ask one open-ended follow-up question about the specific issue the user just described.
The most recent user message has highest priority and may correct earlier assumptions.
If the user says a previously mentioned stress category is not the issue, acknowledge that and move away from it immediately.
Do not keep anchoring to the weakest score unless the user's own words support it.
Do not introduce other stress domains unless the user explicitly links them.

Reply ONLY in JSON in this exact shape:
{"question":"<single thoughtful follow-up question, may use **bold**>","options":null}

Do not include markdown code block fences (like \`\`\`json) in your response, just the raw JSON.`;

    try {
      const json = await callCoachModel<{ question: string }>('followup', contents, systemPrompt);
      return {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: json.question,
      };
    } catch (e) {
      console.error('Coach model follow-up failed', e);
      setErrorMsg(e instanceof Error ? e.message : 'Live coaching is temporarily unavailable, so we switched to the built-in coach flow.');
      return buildMockFollowUp(2);
    }
  };

  const aiGenerateClosing = async (history: Message[]): Promise<Message | null> => {
    const contents = buildCoachContents(history);
    const solutions = getRecommendedSolutions(quizScores);

    const systemPrompt = `You are an empathetic cognitive bandwidth coach using the Cognitive Scarcity Index for Youth (CSI-Y) framework.
Scores: ${scoresContext}

This is the end of the initial conversation. Provide a warm, supportive closing summary that synthesizes what the user actually shared. If you mention score data, keep it brief and only as background. Do not force unrelated domains into the summary.
Treat the user's latest messages as the source of truth. If they corrected an earlier assumption, reflect that correction.

Reply ONLY in JSON in this exact shape:
{"summary":"<2-4 sentence empathetic synthesis summarizing their situation. Use **bold** sparingly.>"}

Do not include markdown code block fences (like \`\`\`json) in your response, just the raw JSON.`;

    try {
      const json = await callCoachModel<{ summary: string }>('closing', contents, systemPrompt);
      const summary = json?.summary || `Based on our conversation, here are evidence-based interventions tailored to you.`;
      return { id: 'solutions', role: 'ai', text: summary, solutionCards: solutions };
    } catch (e) {
      console.error('Coach model closing failed', e);
      setErrorMsg(e instanceof Error ? e.message : 'Live coaching is temporarily unavailable, so we switched to the built-in coach flow.');
      return buildMockClosing();
    }
  };

  const aiGenerateOpenChat = async (history: Message[]): Promise<Message | null> => {
    const contents = buildCoachContents(history);
    const systemPrompt = `You are an empathetic cognitive bandwidth coach using the Cognitive Scarcity Index for Youth (CSI-Y) framework.
Scores: ${scoresContext}

The user has completed the assessment and we are in an open coaching session. Respond to the user's last message with supportive, practical advice based on their profile.
Keep your response short (2-3 sentences). Stay with the issue the user raised. Do not force other stress domains into the answer unless the user explicitly links them.
The most recent user message overrides prior assumptions and may explicitly reject a previously mentioned stress domain.
If the user corrects you, acknowledge the correction directly and continue with the corrected context.

Reply ONLY in JSON in this exact shape:
{"message":"<your response text, may use **bold**>","options":null}`;

    try {
      const json = await callCoachModel<{ message: string }>('open_chat', contents, systemPrompt);
      return {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: json.message,
      };
    } catch (e) {
      console.error("Coach model open chat failed", e);
      setErrorMsg(e instanceof Error ? e.message : 'Live coaching is temporarily unavailable, so we switched to the built-in coach flow.');
      return buildMockOpenChat();
    }
  };

  const applyInitialMessages = async (
    initial: Message[],
    targetLanguage: string,
    sessionVersion: number
  ) => {
    const translatedMessages = [...initial];

    if (targetLanguage === 'hi') {
      for (const msg of translatedMessages) {
        msg.translatedText = { hi: await translateText(msg.text, 'hi') };
        if (msg.options) {
          msg.translatedOptions = { hi: await translateOptions(msg.options, 'hi') };
        }
      }
    }

    if (sessionVersionRef.current !== sessionVersion) {
      return;
    }

    setMessages(translatedMessages);
    setPhase(0);
    setTyping(false);
  };

  const startFreshSession = async (targetLanguage: string) => {
    const sessionVersion = ++sessionVersionRef.current;
    setMessages([]);
    setPhase(0);
    setUserInput('');
    setErrorMsg('');
    setTyping(true);

    const initial = await aiGenerateFirstQuestion();
    if (!initial) {
      if (sessionVersionRef.current === sessionVersion) {
        setTyping(false);
      }
      return;
    }

    await applyInitialMessages(initial, targetLanguage, sessionVersion);
  };

  // Load session from local storage or start new, and listen for reset events
  useEffect(() => {
    const handleResetEvent = () => {
      resetSession();
    };
    window.addEventListener('reset-ai-coach', handleResetEvent);

    const storedMessages = localStorage.getItem('ai_coach_messages');
    const storedPhase = localStorage.getItem('ai_coach_phase');
    const storedLanguage = localStorage.getItem('ai_coach_language');

    if (storedMessages && storedPhase) {
      const parsedMsgs = JSON.parse(storedMessages);
      setMessages(parsedMsgs);
      setPhase(parseInt(storedPhase, 10));
    } else {
      startFreshSession(storedLanguage || 'en');
    }

    return () => {
      window.removeEventListener('reset-ai-coach', handleResetEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save session when messages or phase change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_coach_messages', JSON.stringify(messages));
      localStorage.setItem('ai_coach_phase', phase.toString());
    }
  }, [messages, phase]);

  const ensureTranslations = async (msgs: Message[], targetLang: string) => {
    if (targetLang === 'en') return;
    setTranslating(true);
    
    let updated = false;
    const newMsgs = await Promise.all(msgs.map(async (msg) => {
      const updatedMsg = { ...msg };
      
      if (updatedMsg.text && (!updatedMsg.translatedText || !updatedMsg.translatedText[targetLang])) {
        const trans = await translateText(updatedMsg.text, targetLang);
        updatedMsg.translatedText = {
          ...updatedMsg.translatedText,
          [targetLang]: trans
        };
        updated = true;
      }
      
      if (updatedMsg.options && (!updatedMsg.translatedOptions || !updatedMsg.translatedOptions[targetLang])) {
        const transOpts = await translateOptions(updatedMsg.options, targetLang);
        updatedMsg.translatedOptions = {
          ...updatedMsg.translatedOptions,
          [targetLang]: transOpts
        };
        updated = true;
      }
      
      return updatedMsg;
    }));
    
    if (updated) {
      setMessages(newMsgs);
      localStorage.setItem('ai_coach_messages', JSON.stringify(newMsgs));
    }
    setTranslating(false);
  };

  useEffect(() => {
    if (messages.length > 0 && language !== 'en') {
      ensureTranslations(messages, language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const advance = async (newMessages: Message[]) => {
    const sessionVersion = sessionVersionRef.current;
    const userTurns = newMessages.filter((msg) => msg.role === 'user').length;
    const hasShownPlans = newMessages.some((msg) => Boolean(msg.solutionCards?.length));
    setTyping(true);
    setErrorMsg('');
    let nextMsg: Message | null = null;

    if (!hasCompletedFirstCoachSession && !hasShownPlans && userTurns >= 1) {
      nextMsg = await aiGenerateClosing(newMessages);
      if (nextMsg) {
        if (language === 'hi') {
          const transText = await translateText(nextMsg.text, 'hi');
          nextMsg.translatedText = { hi: transText };
        }
        if (sessionVersionRef.current !== sessionVersion) return;
        setMessages(prev => [...prev, nextMsg!]);
        setPhase(userTurns);
        try {
          localStorage.setItem(COACH_FIRST_USE_COMPLETED_KEY, 'true');
          setHasCompletedFirstCoachSession(true);
        } catch {
          /* ignore localStorage access issues */
        }
      }
    } else if (!hasShownPlans && userTurns >= 2) {
      nextMsg = await aiGenerateClosing(newMessages);
      if (nextMsg) {
        if (language === 'hi') {
          const transText = await translateText(nextMsg.text, 'hi');
          nextMsg.translatedText = { hi: transText };
        }
        if (sessionVersionRef.current !== sessionVersion) return;
        setMessages(prev => [...prev, nextMsg!]);
        setPhase(userTurns);
      }
    } else if (hasShownPlans) {
      nextMsg = await aiGenerateOpenChat(newMessages);
      if (nextMsg) {
        if (language === 'hi') {
          const transText = await translateText(nextMsg.text, 'hi');
          nextMsg.translatedText = { hi: transText };
        }
        if (sessionVersionRef.current !== sessionVersion) return;
        setMessages(prev => [...prev, nextMsg!]);
        setPhase(userTurns);
      }
    } else {
      nextMsg = await aiGenerateFollowUp(newMessages);
      if (nextMsg) {
        if (language === 'hi') {
          const transText = await translateText(nextMsg.text, 'hi');
          nextMsg.translatedText = { hi: transText };
        }
        if (sessionVersionRef.current !== sessionVersion) return;
        setMessages(prev => [...prev, nextMsg!]);
        setPhase(userTurns);
      }
    }

    if (sessionVersionRef.current === sessionVersion) {
      setTyping(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!userInput.trim() || typing) return;
    setTyping(true);
    const originalText = userInput;
    let englishText = originalText;
    let translatedText: Record<string, string> | undefined = undefined;

    if (language === 'hi') {
      englishText = await translateText(originalText, 'en', 'hi');
      translatedText = { hi: originalText };
    }

    const userMsg: Message = { 
      id: `user-${Date.now()}`, 
      role: 'user', 
      text: englishText,
      translatedText
    };
    
    const next = [...messages, userMsg];
    setMessages(next);
    setUserInput('');
    await advance(next);
  };

  const resetSession = async () => {
    localStorage.removeItem('ai_coach_messages');
    localStorage.removeItem('ai_coach_phase');
    await startFreshSession(language);
  };

  const pinPlan = (solution: Solution) => {
    try {
      localStorage.setItem(CURRENT_PLAN_STORAGE_KEY, solution.id);
      localStorage.setItem(PINNED_SOLUTIONS_STORAGE_KEY, JSON.stringify([solution.id]));
      setCurrentPlanId(solution.id);
    } catch {
      /* ignore localStorage access issues */
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const showTextInput = messages.length > 0;

  const getMessageText = (msg: Message) => {
    if (language === 'hi' && msg.translatedText?.hi) {
      return msg.translatedText.hi;
    }
    return msg.text;
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col relative bg-background">
        <FloatingShapes />


        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
          <div className="max-w-lg mx-auto space-y-4">
            
            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-4 mb-4">
                <p className="font-semibold mb-1">Live Coaching Issue</p>
                <p className="text-xs leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {translating && (
              <div className="text-center py-2 mb-2">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 animate-pulse">
                  <Languages className="w-3.5 h-3.5" />
                  Translating chat history...
                </p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5 ${
                       msg.role === 'ai' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {msg.role === 'ai' ? <Bot className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className={`px-4 py-3 rounded-md text-sm leading-relaxed ${
                        msg.role === 'ai'
                          ? 'bg-card border border-border text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {getMessageText(msg).split('\n').map((line, i) => (
                          <p key={i} className={i > 0 ? 'mt-2' : ''}>
                            {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                              part.startsWith('**') && part.endsWith('**')
                                ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
                                : part
                            )}
                          </p>
                        ))}
                      </div>

                      {/* Solution cards */}
                      {msg.solutionCards && (
                        <div className="mt-3 space-y-2">
                          {msg.solutionCards.map((sol) => (
                            <div key={sol.id} className="bg-card border border-border rounded-md p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{sol.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{sol.source}</p>
                                </div>
                                <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-sm">{sol.duration}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">{sol.description}</p>
                              <div className="space-y-1.5">
                                {sol.steps.map((step, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-sm bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-muted-foreground">{i + 1}</span>
                                    <p className="text-xs text-foreground">{step}</p>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => pinPlan(sol)}
                                className={`mt-4 w-full py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                                  currentPlanId === sol.id
                                    ? 'bg-success/10 text-success border border-success/20'
                                    : 'border border-border bg-background text-foreground hover:border-primary/30'
                                }`}
                              >
                                {currentPlanId === sol.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Plan Pinned to Dashboard
                                  </>
                                ) : (
                                  <>
                                    <BookmarkPlus className="w-3.5 h-3.5" />
                                    Pin This Plan
                                  </>
                                )}
                              </button>
                            </div>
                          ))}

                          {/* CTA after solutions */}
                          <div className="pt-2 flex gap-2">
                            <button
                              onClick={() => navigate('/home')}
                              className="flex-1 gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2"
                            >
                              Go to Homepage
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => navigate('/interventions')}
                              className="px-4 py-2.5 rounded-md border border-border bg-card text-foreground font-medium text-sm hover:border-primary/30 transition-all"
                            >
                              Commit to a Plan
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2.5"
              >
                <div className="w-7 h-7 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="px-4 py-3 rounded-md bg-card border border-border">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '200ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input area */}
        {showTextInput && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 border-t border-border bg-card/85 backdrop-blur-sm px-4 py-3"
          >
            <div className="max-w-lg mx-auto flex gap-2">
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder={language === 'hi' ? "अपने विचार साझा करें..." : "Share your thoughts..."}
                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                autoFocus
                disabled={typing}
              />
              <button
                onClick={handleTextSubmit}
                disabled={!userInput.trim() || typing}
                className="w-9 h-9 rounded-md gradient-primary flex items-center justify-center disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Plan Ready */}
        {messages.some((msg) => Boolean(msg.solutionCards?.length)) && !typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 border-t border-border bg-card/85 backdrop-blur-sm px-4 py-3"
          >
            <div className="max-w-lg mx-auto text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {language === 'hi' ? "आपका व्यक्तिगत कार्य योजना ऊपर तैयार है" : "Your personalized action plan is ready above"}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default AICoach;
