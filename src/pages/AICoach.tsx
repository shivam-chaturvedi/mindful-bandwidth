import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { calculateQuizScores, quizCategories } from '@/lib/quizData';
import { getRecommendedSolutions, Solution } from '@/lib/solutions';
import { ArrowRight, Bot, User, Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  options?: string[];
  solutionCards?: Solution[];
}

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const _env = import.meta.env as unknown as { GEMINI_API_KEY?: string; VITE_GEMINI_API_KEY?: string };
const GEMINI_API_KEY = _env.GEMINI_API_KEY || _env.VITE_GEMINI_API_KEY || '';

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok || res.status >= 400) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

function tryParseJson<T = unknown>(text: string): T | null {
  try { return JSON.parse(text) as T; } catch { /* ignore */ }
  // try to extract {...}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]) as T; } catch { /* ignore */ } }
  return null;
}

// Hardcoded fallback conversation
function generateConversation(scores: Record<string, number>): Message[] {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => a - b);
  const weakest = sorted[0];
  const secondWeakest = sorted[1];

  const domainLabels: Record<string, string> = {
    stress: 'stress management',
    selfControl: 'self-control & impulse regulation',
    timeManagement: 'time management & planning',
    financialThreat: 'financial pressure',
    socialConnectedness: 'social connection',
  };

  const weakLabel = domainLabels[weakest[0]] || weakest[0];
  const secondLabel = domainLabels[secondWeakest[0]] || secondWeakest[0];

  const followUps: Message[] = [
    {
      id: 'intro',
      role: 'ai',
      text: `Based on your assessment, I can see that **${weakLabel}** is the area where stress is impacting your thinking the most. Your score was ${weakest[1]} out of 100.\n\nThis doesn't mean something is wrong — it means this is where scarcity is taxing your cognitive bandwidth the most right now.`,
    },
    {
      id: 'q1',
      role: 'ai',
      text: `Let me understand this better. When it comes to **${weakLabel}**, what feels most true for you right now?`,
      options: getOptionsForDomain(weakest[0]),
    },
  ];

  return followUps;
}

function getOptionsForDomain(domain: string): string[] {
  const options: Record<string, string[]> = {
    stress: [
      'I feel overwhelmed most days',
      'Stress comes in waves — some days are fine',
      'I know I\'m stressed but I push through',
      'I don\'t have good ways to cope',
    ],
    selfControl: [
      'I often act on impulse and regret it later',
      'I struggle to stick with plans',
      'Distractions pull me away from important work',
      'I choose short-term comfort over long-term goals',
    ],
    timeManagement: [
      'I never have enough time for everything',
      'I procrastinate even when I know the deadline',
      'I\'m busy all day but don\'t feel productive',
      'I don\'t know how to prioritize effectively',
    ],
    financialThreat: [
      'Money worries keep me up at night',
      'I avoid thinking about finances entirely',
      'I make spending decisions I later regret',
      'Financial stress affects my focus on other things',
    ],
    socialConnectedness: [
      'I feel isolated even around people',
      'I take on too much to please others',
      'I don\'t have people I can really talk to',
      'I struggle to ask for help when I need it',
    ],
  };
  return options[domain] || options.stress;
}

function getFollowUp2(domain: string): Message {
  const questions: Record<string, string> = {
    stress: 'When you\'re under pressure, what usually happens to your decision-making? Do you notice yourself making different choices than you normally would?',
    selfControl: 'Think about the last time you gave in to an impulse. What was the situation, and what do you think triggered it?',
    timeManagement: 'When you have multiple things to do, how do you decide what to work on first? Do you have a system, or does it feel random?',
    financialThreat: 'How often do financial concerns pop into your mind when you\'re trying to focus on something else — like studying or working?',
    socialConnectedness: 'When you\'re going through a tough time, do you tend to reach out to others or handle it alone? What stops you from asking for help?',
  };
  return {
    id: 'q2',
    role: 'ai',
    text: questions[domain] || questions.stress,
  };
}

function getFollowUp3(domain: string, scores: Record<string, number>): Message {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => a - b);
  const secondWeakest = sorted[1];
  const domainLabels: Record<string, string> = {
    stress: 'stress',
    selfControl: 'self-control',
    timeManagement: 'time management',
    financialThreat: 'financial pressure',
    socialConnectedness: 'social connection',
  };
  const secondLabel = domainLabels[secondWeakest[0]] || secondWeakest[0];

  return {
    id: 'q3',
    role: 'ai',
    text: `Thank you for sharing that. I also noticed your **${secondLabel}** score (${secondWeakest[1]}/100) suggests some strain there too.\n\nResearch shows these domains are interconnected — stress in one area often spills over into others. This is called the **"bandwidth tax"** (Mullainathan & Shafir, 2013).\n\nDo you feel like these two areas are connected for you?`,
    options: [
      'Yes, they definitely feed into each other',
      'Maybe — I haven\'t thought about it that way',
      'Not really — they feel separate',
      'I\'m not sure',
    ],
  };
}

function getSolutionMessage(scores: Record<string, number>): Message {
  const solutions = getRecommendedSolutions(scores);
  return {
    id: 'solutions',
    role: 'ai',
    text: `Based on our conversation and your assessment results, I've identified **${solutions.length} evidence-based interventions** from the Cognitive Scarcity Toolkit (CSI-Y) that can help.\n\nThese are designed to be practical and take minimal time — because when bandwidth is low, the last thing you need is a complex program.`,
    solutionCards: solutions,
  };
}

const AICoach = () => {
  const { gameResponses } = useBandwidth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState(0);
  const [typing, setTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const quizScores = (() => {
    let answers = gameResponses.quizAnswers || {};
    if (!answers || Object.keys(answers).length === 0) {
      try {
        const stored = localStorage.getItem('quizAnswers');
        if (stored) answers = JSON.parse(stored);
      } catch { /* ignore */ }
    }
    return calculateQuizScores(answers);
  })();

  const sorted = Object.entries(quizScores).sort(([, a], [, b]) => a - b);
  const weakestDomain = sorted[0]?.[0] || 'stress';
  const domainLabels: Record<string, string> = {
    stress: 'stress management',
    selfControl: 'self-control & impulse regulation',
    timeManagement: 'time management & planning',
    financialThreat: 'financial pressure',
    socialConnectedness: 'social connection',
  };

  // Build a context string from scores
  const scoresContext = JSON.stringify(quizScores);

  // Ask Gemini for a follow-up question with options
  async function aiGenerateFirstQuestion(): Promise<Message[] | null> {
    if (!GEMINI_API_KEY) return null;
    const weak = sorted[0];
    const prompt = `You are an empathetic cognitive bandwidth coach using the Cognitive Scarcity Index for Youth (CSI-Y) framework. The user just completed an assessment with these scores (0-100, higher = better): ${scoresContext}. Their weakest area is "${domainLabels[weak[0]]}" at ${weak[1]}/100.

Reply ONLY in JSON with this exact shape:
{"intro":"<2-3 sentence empathetic intro that names their weakest domain and score, uses **bold** for emphasis>","question":"<one specific follow-up question to better understand them>","options":["opt1","opt2","opt3","opt4"]}

    Make options first-person statements (e.g., "I feel...") relevant to ${domainLabels[weak[0]]}. No markdown fences. Pure JSON.`;
    try {
      const text = await callGemini(GEMINI_API_KEY, prompt);
      const json = tryParseJson<{ intro: string; question: string; options: string[] }>(text);
      if (!json?.intro || !json?.question || !Array.isArray(json?.options)) return null;
      return [
        { id: 'intro', role: 'ai', text: json.intro },
        { id: 'q1', role: 'ai', text: json.question, options: json.options.slice(0, 4) },
      ];
    } catch (e) {
      console.warn('Gemini failed, falling back', e);
      return null;
    }
  }

  async function aiGenerateFollowUp(history: Message[]): Promise<Message | null> {
    if (!GEMINI_API_KEY) return null;
    const transcript = history.map(m => `${m.role === 'ai' ? 'Coach' : 'User'}: ${m.text}`).join('\n');
    const prompt = `Continue this CSI-Y coaching conversation. Scores: ${scoresContext}.
Transcript so far:
${transcript}

Generate the next follow-up. Reply ONLY in JSON:
{"question":"<single thoughtful follow-up question, may use **bold**>","options":["opt1","opt2","opt3","opt4"] OR null}

If the question should be open-ended, set options to null. Pure JSON, no markdown.`;
    try {
      const text = await callGemini(GEMINI_API_KEY, prompt);
      const json = tryParseJson<{ question: string; options: string[] | null }>(text);
      if (!json?.question) return null;
      return {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: json.question,
        options: Array.isArray(json.options) ? json.options.slice(0, 4) : undefined,
      };
    } catch {
      return null;
    }
  }

  async function aiGenerateClosing(history: Message[]): Promise<Message | null> {
    if (!GEMINI_API_KEY) return null;
    const solutions = getRecommendedSolutions(quizScores);
    const transcript = history.map(m => `${m.role === 'ai' ? 'Coach' : 'User'}: ${m.text}`).join('\n');
    const prompt = `Wrap up this CSI-Y coaching session. Scores: ${scoresContext}.
Transcript:
${transcript}

Reply ONLY in JSON:
{"summary":"<2-4 sentence empathetic synthesis referencing what the user shared. Use **bold** sparingly.>"}
No markdown fences.`;
    try {
      const text = await callGemini(GEMINI_API_KEY, prompt);
      const json = tryParseJson<{ summary: string }>(text);
      const summary = json?.summary || `Based on our conversation, here are evidence-based interventions tailored to you.`;
      return { id: 'solutions', role: 'ai', text: summary, solutionCards: solutions };
    } catch {
      return null;
    }
  }

  // Initialize conversation (Gemini-first, fallback to hardcoded)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTyping(true);
      let initial = await aiGenerateFirstQuestion();
      if (!initial) initial = generateConversation(quizScores);
      if (cancelled) return;
      setMessages([initial[0]]);
      await new Promise(r => setTimeout(r, 700));
      if (cancelled) return;
      setMessages([initial[0], initial[1]]);
      setTyping(false);
      setPhase(1);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const advance = async (newMessages: Message[]) => {
    setTyping(true);
    if (phase === 1) {
      const next = (await aiGenerateFollowUp(newMessages)) || getFollowUp2(weakestDomain);
      setMessages(prev => [...prev, next]);
      setTyping(false);
      setPhase(2);
    } else if (phase === 2) {
      const next = (await aiGenerateFollowUp(newMessages)) || getFollowUp3(weakestDomain, quizScores);
      setMessages(prev => [...prev, next]);
      setTyping(false);
      setPhase(3);
    } else if (phase === 3) {
      const next = (await aiGenerateClosing(newMessages)) || getSolutionMessage(quizScores);
      setMessages(prev => [...prev, next]);
      setTyping(false);
      setPhase(4);
    }
  };

  const handleOptionClick = (option: string) => {
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', text: option };
    const next = [...messages, userMsg];
    setMessages(next);
    advance(next);
  };

  const handleTextSubmit = () => {
    if (!userInput.trim()) return;
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', text: userInput };
    const next = [...messages, userMsg];
    setMessages(next);
    setUserInput('');
    advance(next);
  };

  const currentMessage = messages[messages.length - 1];
  const showTextInput = (phase === 2 || phase === 3) && currentMessage?.role === 'ai' && !currentMessage?.options;
  const showOptions = currentMessage?.role === 'ai' && currentMessage?.options;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col relative">
        <FloatingShapes />

        {/* Header */}
        <div className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm gradient-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Coach</p>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
          <div className="max-w-lg mx-auto space-y-4">
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
                        {msg.text.split('\n').map((line, i) => (
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
                            </div>
                          ))}

                          {/* CTA after solutions */}
                          <div className="pt-2 flex gap-2">
                            <button
                              onClick={() => navigate('/game/1')}
                              className="flex-1 gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2"
                            >
                              Start Decision Challenges
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

                      {/* Options */}
                      {msg.options && msg.id === currentMessage?.id && (
                        <div className="mt-2 space-y-1.5">
                          {msg.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleOptionClick(opt)}
                              className="w-full text-left px-3 py-2 rounded-md border border-border bg-card text-sm text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                            >
                              {opt}
                            </button>
                          ))}
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
            className="relative z-10 border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3"
          >
            <div className="max-w-lg mx-auto flex gap-2">
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Share your thoughts..."
                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                autoFocus
              />
              <button
                onClick={handleTextSubmit}
                disabled={!userInput.trim()}
                className="w-9 h-9 rounded-md gradient-primary flex items-center justify-center disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Skip to results */}
        {phase === 4 && !typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3"
          >
            <div className="max-w-lg mx-auto text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Your personalized action plan is ready above
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default AICoach;
