import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameScores, defaultScores } from '@/lib/gameState';

interface BandwidthContextType {
  onboardingSelections: string[];
  setOnboardingSelections: (s: string[]) => void;
  scores: GameScores;
  setScores: (s: GameScores) => void;
  gameResponses: Record<string, any>;
  setGameResponse: (key: string, value: any) => void;
  commitmentIntervention: string | null;
  setCommitmentIntervention: (s: string | null) => void;
  language: string;
  setLanguage: (lang: string) => void;
  showLangModal: boolean;
  setShowLangModal: (b: boolean) => void;
}

const BandwidthContext = createContext<BandwidthContextType | undefined>(undefined);

export const BandwidthProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingSelections, setOnboardingSelections] = useState<string[]>([]);
  const [scores, setScores] = useState<GameScores>(defaultScores);
  const [gameResponses, setGameResponses] = useState<Record<string, any>>({});
  const [commitmentIntervention, setCommitmentIntervention] = useState<string | null>(null);
  
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('ai_coach_language') || '';
  });
  const [showLangModal, setShowLangModal] = useState<boolean>(() => {
    return !localStorage.getItem('ai_coach_language');
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('ai_coach_language', lang);
  };

  const setGameResponse = (key: string, value: any) => {
    setGameResponses(prev => ({ ...prev, [key]: value }));
  };

  return (
    <BandwidthContext.Provider value={{
      onboardingSelections, setOnboardingSelections,
      scores, setScores,
      gameResponses, setGameResponse,
      commitmentIntervention, setCommitmentIntervention,
      language: language || 'en', // Default to English if unset, but keep state empty to trigger modal
      setLanguage,
      showLangModal,
      setShowLangModal,
    }}>
      {children}
    </BandwidthContext.Provider>
  );
};

export const useBandwidth = () => {
  const ctx = useContext(BandwidthContext);
  if (!ctx) throw new Error('useBandwidth must be used within BandwidthProvider');
  return ctx;
};
