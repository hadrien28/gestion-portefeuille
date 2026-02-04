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

const clampAmount = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

const normalizeGoals = (value: unknown): InvestmentGoals => {
  if (!value || typeof value !== 'object') return defaultGoals;
  const record = value as Partial<InvestmentGoals>;
  return {
    monthlyTarget: clampAmount(
      typeof record.monthlyTarget === 'number' ? record.monthlyTarget : defaultGoals.monthlyTarget
    ),
    yearlyTarget: clampAmount(
      typeof record.yearlyTarget === 'number' ? record.yearlyTarget : defaultGoals.yearlyTarget
    ),
    peaTarget: clampAmount(typeof record.peaTarget === 'number' ? record.peaTarget : defaultGoals.peaTarget),
    ctoTarget: clampAmount(typeof record.ctoTarget === 'number' ? record.ctoTarget : defaultGoals.ctoTarget),
  };
};

export function useGoals() {
  const [goals, setGoals] = useState<InvestmentGoals>(defaultGoals);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(GOALS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setGoals(normalizeGoals(parsed));
      } catch (error) {
        console.error('Failed to parse goals:', error);
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
    setGoals(prev => normalizeGoals({ ...prev, ...newGoals }));
  }, []);

  const resetGoals = useCallback(() => {
    setGoals(defaultGoals);
  }, []);

  const exportToJSON = useCallback(() => {
    const dataStr = JSON.stringify(goals, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investtrack_goals_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [goals]);

  const importFromJSON = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setGoals(normalizeGoals(parsed));
      return true;
    } catch (error) {
      console.error('Failed to import goals:', error);
      return false;
    }
  }, []);

  return {
    goals,
    isLoaded,
    updateGoal,
    updateGoals,
    resetGoals,
    exportToJSON,
    importFromJSON,
  };
}
