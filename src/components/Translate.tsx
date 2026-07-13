import { useState, useEffect } from 'react';
import { useBandwidth } from '@/context/BandwidthContext';
import translate from 'google-translate-api-x';

interface TranslateProps {
  children: string;
}

// In-memory queues for batching translation requests per language
const batchQueues: Record<string, { text: string; resolve: (val: string) => void }[]> = {};
const batchTimeouts: Record<string, any> = {};

// Performs the batch translation request by joining texts with a delimiter
async function processBatch(texts: string[], lang: string): Promise<string[]> {
  if (texts.length === 0) return [];
  if (texts.length === 1) {
    try {
      const res = await translate(texts[0], { from: 'en', to: lang, client: 'gtx' });
      return [res?.text || texts[0]];
    } catch {
      return [texts[0]];
    }
  }

  const delimiter = ' \n---\n ';
  const combined = texts.join(delimiter);

  try {
    const res = await translate(combined, { from: 'en', to: lang, client: 'gtx' });
    const translatedCombined = res?.text || combined;
    
    // Split using a regex that matches the delimiter with any surrounding whitespace variations
    const results = translatedCombined.split(/\s*\n---\n\s*/);

    if (results.length === texts.length) {
      return results.map(r => r.trim());
    } else {
      console.warn(`Translation batch length mismatch: expected ${texts.length}, got ${results.length}. Falling back to individual requests.`);
      return Promise.all(texts.map(async (t) => {
        try {
          const r = await translate(t, { from: 'en', to: lang, client: 'gtx' });
          return r?.text || t;
        } catch {
          return t;
        }
      }));
    }
  } catch (err) {
    console.error('Batch translation failed', err);
    return texts;
  }
}

export async function getTranslation(text: string, lang: string): Promise<string> {
  const cacheKey = `trans_${lang}_${text}`;

  // 1. Check localStorage cache first (instant, no network)
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch { /* ignore */ }

  // 2. Queue translation for batching
  return new Promise((resolve) => {
    if (!batchQueues[lang]) {
      batchQueues[lang] = [];
    }

    batchQueues[lang].push({ text, resolve });

    if (batchTimeouts[lang]) {
      clearTimeout(batchTimeouts[lang]);
    }

    batchTimeouts[lang] = setTimeout(async () => {
      const queue = batchQueues[lang];
      delete batchQueues[lang];
      delete batchTimeouts[lang];

      if (!queue || queue.length === 0) return;

      const textsToTranslate = queue.map(q => q.text);
      const results = await processBatch(textsToTranslate, lang);

      queue.forEach((item, idx) => {
        const translated = results[idx] || item.text;
        try {
          localStorage.setItem(`trans_${lang}_${item.text}`, translated);
        } catch { /* ignore */ }
        item.resolve(translated);
      });
    }, 50); // 50ms debounce window to group all renders
  });
}

export const Translate = ({ children }: TranslateProps) => {
  const { language } = useBandwidth();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    if (!children || typeof children !== 'string' || !children.trim()) {
      setTranslatedText(children);
      return;
    }

    if (language !== 'en') {
      let active = true;
      // Show original immediately, then swap when translation arrives
      setTranslatedText(children);
      getTranslation(children, language).then((result) => {
        if (active) setTranslatedText(result);
      });
      return () => { active = false; };
    } else {
      setTranslatedText(children);
    }
  }, [children, language]);

  return <>{translatedText}</>;
};

export default Translate;
