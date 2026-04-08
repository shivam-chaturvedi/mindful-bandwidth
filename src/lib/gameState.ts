import { create } from 'zustand';

// We'll use React context instead of zustand to avoid adding dependencies
export interface GameScores {
  planning: number;
  impulseControl: number;
  stressRegulation: number;
  socialSupport: number;
  financialStress: number;
}

export interface GameState {
  onboardingSelections: string[];
  scores: GameScores;
  currentGame: number;
  gameResponses: Record<string, any>;
}

export const defaultScores: GameScores = {
  planning: 0,
  impulseControl: 0,
  stressRegulation: 0,
  socialSupport: 0,
  financialStress: 0,
};

export const defaultGameState: GameState = {
  onboardingSelections: [],
  scores: defaultScores,
  currentGame: 0,
  gameResponses: {},
};
