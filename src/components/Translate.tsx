import { useState, useEffect } from 'react';
import { useBandwidth } from '@/context/BandwidthContext';
import translate from 'google-translate-api-x';

interface TranslateProps {
  children: string;
}

export const Translate = ({ children }: TranslateProps) => {
  const { language } = useBandwidth();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    if (!children || typeof children !== 'string' || !children.trim()) {
      setTranslatedText(children);
      return;
    }

    if (language === 'hi') {
      let isCurrent = true;
      const cacheKey = `trans_hi_${children}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        setTranslatedText(cached);
        return;
      }

      const run = async () => {
        try {
          const res = await translate(children, { from: 'en', to: 'hi', client: 'gtx' });
          if (res?.text) {
            localStorage.setItem(cacheKey, res.text);
            if (isCurrent) {
              setTranslatedText(res.text);
            }
          }
        } catch (e) {
          console.error('Dynamic translation failed for:', children, e);
          // Keep original English as fallback on error
          if (isCurrent) {
            setTranslatedText(children);
          }
        }
      };

      run();
      return () => {
        isCurrent = false;
      };
    } else {
      setTranslatedText(children);
    }
  }, [children, language]);

  return <>{translatedText}</>;
};

export default Translate;
