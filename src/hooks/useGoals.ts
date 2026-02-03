import { useState, useEffect, useCallback } from 'react';

const GOALS_KEY = 'investtrack_goals';

export interface InvestmentGoals {
  monthlyTarget: number;
  yearlyTarget: number;
  peaTarget: number;
  ctoTarget: number;
}

const defaultGoals: InvestmentGoals = {
  monthlyTarget: 500,
  yearlyTarget: 6000,
  peaTarget: 50000,
  ctoTarget: 25000,
};

export function useGoals() {
  const [goals, setGoals] = useState<InvestmentGoals>(defaultGoals);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(GOALS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setGoals({ ...defaultGoals, ...parsed });
      } catch (e) {
        console.error('Failed to parse goals:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    }
  }, [goals, isLoaded]);

  const updateGoal = useCallback((key: keyof InvestmentGoals, value: number) => {
    setGoals(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateGoals = useCallback((newGoals: Partial<InvestmentGoals>) => {
    setGoals(prev => ({ ...prev, ...newGoals }));
  }, []);

  const resetGoals = useCallback(() => {
    setGoals(defaultGoals);
  }, []);

  return {
    goals,
    isLoaded,
    updateGoal,
    updateGoals,
    resetGoals,
  };
}
