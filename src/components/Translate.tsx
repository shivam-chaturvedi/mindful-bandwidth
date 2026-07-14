import { useState, useEffect } from 'react';
import { useBandwidth } from '@/context/BandwidthContext';

interface TranslateProps {
  children: string;
}

async function translateOne(text: string, from: string, to: string): Promise<string> {
  const url = new URL('/translate_api/translate_a/single', window.location.origin);
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', from);
  url.searchParams.set('tl', to);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Translate error ${response.status}`);
  }

  const data = await response.json();
  const translated = Array.isArray(data?.[0])
    ? data[0].map((part: unknown[]) => part?.[0] || '').join('')
    : text;

  return translated || text;
}

async function requestTranslations(text: string | string[], from: string, to: string) {
  if (Array.isArray(text)) {
    const translations = await Promise.all(text.map((item) => translateOne(item, from, to)));
    return { translations };
  }

  const translation = await translateOne(text, from, to);
  return { translation };
}

// In-memory queues for batching translation requests per language
const batchQueues: Record<string, { text: string; resolve: (val: string) => void }[]> = {};
const batchTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};

async function processBatch(texts: string[], from: string, lang: string): Promise<string[]> {
  if (texts.length === 0) return [];
  if (texts.length === 1) {
    try {
      const res = await requestTranslations(texts[0], from, lang);
      return [res.translation || texts[0]];
    } catch {
      return [texts[0]];
    }
  }

  try {
    const res = await requestTranslations(texts, from, lang);
    if (Array.isArray(res.translations) && res.translations.length === texts.length) {
      return res.translations;
    }
    return texts;
  } catch (err) {
    console.error('Batch translation failed', err);
    return texts;
  }
}

export async function getTranslation(text: string, lang: string, from = 'en'): Promise<string> {
  const cacheKey = `trans_${from}_${lang}_${text}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {
    /* ignore */
  }

  return new Promise((resolve) => {
    const queueKey = `${from}:${lang}`;

    if (!batchQueues[queueKey]) {
      batchQueues[queueKey] = [];
    }

    batchQueues[queueKey].push({ text, resolve });

    if (batchTimeouts[queueKey]) {
      clearTimeout(batchTimeouts[queueKey]);
    }

    batchTimeouts[queueKey] = setTimeout(async () => {
      const queue = batchQueues[queueKey];
      delete batchQueues[queueKey];
      delete batchTimeouts[queueKey];

      if (!queue || queue.length === 0) return;

      const textsToTranslate = queue.map((q) => q.text);
      const results = await processBatch(textsToTranslate, from, lang);

      queue.forEach((item, idx) => {
        const translated = results[idx] || item.text;
        try {
          localStorage.setItem(`trans_${from}_${lang}_${item.text}`, translated);
        } catch {
          /* ignore */
        }
        item.resolve(translated);
      });
    }, 50);
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
      setTranslatedText(children);
      getTranslation(children, language).then((result) => {
        if (active) setTranslatedText(result);
      });
      return () => {
        active = false;
      };
    }

    setTranslatedText(children);
  }, [children, language]);

  return <>{translatedText}</>;
};

export default Translate;
