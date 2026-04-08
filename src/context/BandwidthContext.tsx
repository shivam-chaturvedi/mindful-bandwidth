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
}

const BandwidthContext = createContext<BandwidthContextType | undefined>(undefined);

export const BandwidthProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingSelections, setOnboardingSelections] = useState<string[]>([]);
  const [scores, setScores] = useState<GameScores>(defaultScores);
  const [gameResponses, setGameResponses] = useState<Record<string, any>>({});
  const [commitmentIntervention, setCommitmentIntervention] = useState<string | null>(null);

  const setGameResponse = (key: string, value: any) => {
    setGameResponses(prev => ({ ...prev, [key]: value }));
  };

  return (
    <BandwidthContext.Provider value={{
      onboardingSelections, setOnboardingSelections,
      scores, setScores,
      gameResponses, setGameResponse,
      commitmentIntervention, setCommitmentIntervention,
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
