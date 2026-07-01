import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { calculateQuizScores } from '@/lib/quizData';
import { getRecommendedSolutions, Solution } from '@/lib/solutions';
import { ArrowRight, Bot, User, Send, Sparkles, ArrowLeft, RefreshCw, Languages } from 'lucide-react';
import translate from 'google-translate-api-x';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string; // Original English text
  translatedText?: Record<string, string>; // Translated versions
  options?: string[]; // Original English options
  translatedOptions?: Record<string, string[]>; // Translated versions of options
  solutionCards?: Solution[];
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const _env = import.meta.env as unknown as { GEMINI_API_KEY?: string; VITE_GEMINI_API_KEY?: string };
const GEMINI_API_KEY = _env.VITE_GEMINI_API_KEY || _env.GEMINI_API_KEY || '';

async function callGemini(apiKey: string, contents: any[], systemInstructionText: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      generationConfig: { 
        temperature: 0.7, 
        responseMimeType: 'application/json' 
      },
    }),
  });
  if (!res.ok || res.status >= 400) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

function tryParseJson<T = unknown>(text: string): T | null {
  try { return JSON.parse(text) as T; } catch { /* ignore */ }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]) as T; } catch { /* ignore */ } }
  return null;
}

const domainLabels: Record<string, string> = {
  stress: 'stress management',
  selfControl: 'self-control & impulse regulation',
  timeManagement: 'time management & planning',
  financialThreat: 'financial pressure',
  socialConnectedness: 'social connection',
};

async function translateText(text: string, to: string, from = 'auto'): Promise<string> {
  if (!text || !text.trim()) return text;
  try {
    const res = await translate(text, { from, to, client: 'gtx' });
    return res.text;
  } catch (e) {
    console.error('Translation failed:', e);
    return text;
  }
}

async function translateOptions(opts: string[], to: string, from = 'auto'): Promise<string[]> {
  if (!opts || opts.length === 0) return [];
  try {
    const res = await translate(opts, { from, to, client: 'gtx' });
    if (Array.isArray(res)) {
      return res.map(r => r.text);
    }
    return opts;
  } catch (e) {
    console.error('Options translation failed:', e);
    return opts;
  }
}

function buildGeminiContents(history: Message[]): any[] {
  const contents: any[] = [];
  
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

  // Build a context string from scores
  const scoresContext = JSON.stringify(quizScores);

  // Ask Gemini for a follow-up question with options
  const aiGenerateFirstQuestion = async (): Promise<Message[] | null> => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      setErrorMsg('Please configure your Gemini API Key in the .env file (VITE_GEMINI_API_KEY) to start chatting with the Coach.');
      return null;
    }
    const weak = sorted[0];
    const systemPrompt = `You are an empathetic cognitive bandwidth coach using the Cognitive Scarcity Index for Youth (CSI-Y) framework.
The user just completed an assessment with these scores (0-100, higher = better): ${scoresContext}.
Their weakest area is "${domainLabels[weak[0]]}" at ${weak[1]}/100.

You must reply ONLY in JSON with this exact shape:
{"intro":"<2-3 sentence empathetic intro that names their weakest domain and score, uses **bold** for emphasis>","question":"<one specific follow-up question to better understand them>","options":["opt1","opt2","opt3","opt4"]}

Make options first-person statements (e.g., "I feel...") relevant to ${domainLabels[weak[0]]}. Do not include markdown code block fences (like \`\`\`json) in your response, just the raw JSON.`;

    try {
      const text = await callGemini(GEMINI_API_KEY, [{ role: 'user', parts: [{ text: 'Start session.' }] }], systemPrompt);
      const json = tryParseJson<{ intro: string; question: string; options: string[] }>(text);
      if (!json?.intro || !json?.question || !Array.isArray(json?.options)) {
        throw new Error('Invalid JSON response structure');
      }
      return [
        { id: 'intro', role: 'ai', text: json.intro },
        { id: 'q1', role: 'ai', text: json.question, options: json.options.slice(0, 4) },
      ];
    } catch (e) {
      console.error('Gemini first question failed', e);
      setErrorMsg('Failed to communicate with Gemini. Please verify your API key and connection details in the .env file.');
      return null;
    }
  };

  const aiGenerateFollowUp = async (history: Message[]): Promise<Message | null> => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') return null;
    const contents = buildGeminiContents(history);
    const targetPhase = phase + 1;
    let phaseInstruction = '';

    if (targetPhase === 2) {
      phaseInstruction = `This is Phase 2 of the conversation. Ask a follow-up question to explore how their weakest domain ("${domainLabels[weakestDomain]}") affects their decision-making or daily life. Generate an open-ended question (set options to null in the response).`;
    } else if (targetPhase === 3) {
      const secondWeakest = sorted[1]?.[0] || 'stress';
      const secondWeakLabel = domainLabels[secondWeakest] || secondWeakest;
      phaseInstruction = `This is Phase 3 of the conversation. Ask a question to see if their weakest domain is connected to their second weakest domain ("${secondWeakLabel}" at ${sorted[1]?.[1]}/100). Provide 3-4 options for the user.`;
    }

    const systemPrompt = `You are an empathetic cognitive bandwidth coach using the Cognitive Scarcity Index for Youth (CSI-Y) framework.
Scores: ${scoresContext}

${phaseInstruction}

Reply ONLY in JSON in this exact shape:
{"question":"<single thoughtful follow-up question, may use **bold**>","options":["opt1","opt2","opt3","opt4"] or null}

If the question should be open-ended, set options to null. Do not include markdown code block fences (like \`\`\`json) in your response, just the raw JSON.`;

    try {
      const text = await callGemini(GEMINI_API_KEY, contents, systemPrompt);
      const json = tryParseJson<{ question: string; options: string[] | null }>(text);
      if (!json?.question) throw new Error('Invalid JSON response structure');
      return {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: json.question,
        options: Array.isArray(json.options) ? json.options.slice(0, 4) : undefined,
      };
    } catch (e) {
      console.error('Gemini follow-up failed', e);
      setErrorMsg('Failed to communicate with Gemini. Please verify your API key and connection details in the .env file.');
      return null;
    }
  };

  const aiGenerateClosing = async (history: Message[]): Promise<Message | null> => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') return null;
    const contents = buildGeminiContents(history);
    const solutions = getRecommendedSolutions(quizScores);
    
    const systemPrompt = `You are an empathetic cognitive bandwidth coach using the Cognitive Scarcity Index for Youth (CSI-Y) framework.
Scores: ${scoresContext}

This is the end of the conversation. Provide a warm, supportive closing summary that synthesizes what they shared and how their bandwidth is taxed.

Reply ONLY in JSON in this exact shape:
{"summary":"<2-4 sentence empathetic synthesis summarizing their situation. Use **bold** sparingly.>"}

Do not include markdown code block fences (like \`\`\`json) in your response, just the raw JSON.`;

    try {
      const text = await callGemini(GEMINI_API_KEY, contents, systemPrompt);
      const json = tryParseJson<{ summary: string }>(text);
      const summary = json?.summary || `Based on our conversation, here are evidence-based interventions tailored to you.`;
      return { id: 'solutions', role: 'ai', text: summary, solutionCards: solutions };
    } catch (e) {
      console.error('Gemini closing failed', e);
      setErrorMsg('Failed to communicate with Gemini. Please verify your API key and connection details in the .env file.');
      return null;
    }
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
      const initSession = async () => {
        setTyping(true);
        setErrorMsg('');
        const initial = await aiGenerateFirstQuestion();
        if (initial) {
          const introMsg = initial[0];
          const q1Msg = initial[1];

          const currentLang = storedLanguage || 'en';
          if (currentLang === 'hi') {
            const transIntro = await translateText(introMsg.text, 'hi');
            introMsg.translatedText = { hi: transIntro };

            const transQ1 = await translateText(q1Msg.text, 'hi');
            q1Msg.translatedText = { hi: transQ1 };

            if (q1Msg.options) {
              const transOpts = await translateOptions(q1Msg.options, 'hi');
              q1Msg.translatedOptions = { hi: transOpts };
            }
          }

          setMessages([introMsg]);
          await new Promise(r => setTimeout(r, 600));
          setMessages([introMsg, q1Msg]);
          setPhase(1);
        }
        setTyping(false);
      };
      initSession();
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
    setTyping(true);
    setErrorMsg('');
    let nextMsg: Message | null = null;
    
    if (phase === 1) {
      nextMsg = await aiGenerateFollowUp(newMessages);
      if (nextMsg) {
        if (language === 'hi') {
          const transText = await translateText(nextMsg.text, 'hi');
          nextMsg.translatedText = { hi: transText };
          if (nextMsg.options) {
            const transOpts = await translateOptions(nextMsg.options, 'hi');
            nextMsg.translatedOptions = { hi: transOpts };
          }
        }
        setMessages(prev => [...prev, nextMsg!]);
        setPhase(2);
      }
    } else if (phase === 2) {
      nextMsg = await aiGenerateFollowUp(newMessages);
      if (nextMsg) {
        if (language === 'hi') {
          const transText = await translateText(nextMsg.text, 'hi');
          nextMsg.translatedText = { hi: transText };
          if (nextMsg.options) {
            const transOpts = await translateOptions(nextMsg.options, 'hi');
            nextMsg.translatedOptions = { hi: transOpts };
          }
        }
        setMessages(prev => [...prev, nextMsg!]);
        setPhase(3);
      }
    } else if (phase === 3) {
      nextMsg = await aiGenerateClosing(newMessages);
      if (nextMsg) {
        if (language === 'hi') {
          const transText = await translateText(nextMsg.text, 'hi');
          nextMsg.translatedText = { hi: transText };
        }
        setMessages(prev => [...prev, nextMsg!]);
        setPhase(4);
      }
    }
    setTyping(false);
  };

  const handleOptionClick = (optText: string, index: number) => {
    const activeMsg = messages[messages.length - 1];
    let englishText = optText;
    let translatedText: Record<string, string> | undefined = undefined;

    if (language === 'hi') {
      if (activeMsg && activeMsg.options && activeMsg.options[index]) {
        englishText = activeMsg.options[index];
      }
      translatedText = { hi: optText };
    }

    const userMsg: Message = { 
      id: `user-${Date.now()}`, 
      role: 'user', 
      text: englishText,
      translatedText
    };
    
    const next = [...messages, userMsg];
    setMessages(next);
    advance(next);
  };

  const handleTextSubmit = async () => {
    if (!userInput.trim()) return;
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
    setMessages([]);
    setPhase(0);
    setErrorMsg('');
    setTyping(true);
    
    const initial = await aiGenerateFirstQuestion();
    if (initial) {
      const introMsg = initial[0];
      const q1Msg = initial[1];

      if (language === 'hi') {
        const transIntro = await translateText(introMsg.text, 'hi');
        introMsg.translatedText = { hi: transIntro };

        const transQ1 = await translateText(q1Msg.text, 'hi');
        q1Msg.translatedText = { hi: transQ1 };

        if (q1Msg.options) {
          const transOpts = await translateOptions(q1Msg.options, 'hi');
          q1Msg.translatedOptions = { hi: transOpts };
        }
      }

      setMessages([introMsg]);
      await new Promise(r => setTimeout(r, 600));
      setMessages([introMsg, q1Msg]);
      setPhase(1);
    }
    setTyping(false);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const currentMessage = messages[messages.length - 1];
  const showTextInput = (phase === 2 || phase === 3) && currentMessage?.role === 'ai' && !currentMessage?.options;

  const getMessageText = (msg: Message) => {
    if (language === 'hi' && msg.translatedText?.hi) {
      return msg.translatedText.hi;
    }
    return msg.text;
  };

  const getMessageOptions = (msg: Message) => {
    if (language === 'hi' && msg.translatedOptions?.hi) {
      return msg.translatedOptions.hi;
    }
    return msg.options;
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
                <p className="font-semibold mb-1">Configuration Required</p>
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

                      {/* Options */}
                      {msg.options && msg.id === currentMessage?.id && (
                        <div className="mt-2 space-y-1.5">
                          {getMessageOptions(msg)?.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleOptionClick(opt, i)}
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

        {/* Skip to results */}
        {phase === 4 && !typing && (
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
