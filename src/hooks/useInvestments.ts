import { useState, useEffect, useCallback } from 'react';
import type { Investment, InvestmentType, AccountType } from '@/types';

const STORAGE_KEY = 'investtrack_investments';

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setInvestments(parsed);
      } catch (e) {
        console.error('Failed to parse investments:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever investments change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
    }
  }, [investments, isLoaded]);

  const addInvestment = useCallback((investment: Omit<Investment, 'id' | 'createdAt'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setInvestments(prev => [newInvestment, ...prev]);
    return newInvestment;
  }, []);

  const updateInvestment = useCallback((id: string, updates: Partial<Investment>) => {
    setInvestments(prev =>
      prev.map(inv =>
        inv.id === id
          ? { ...inv, ...updates, updatedAt: new Date().toISOString() }
          : inv
      )
    );
  }, []);

  const deleteInvestment = useCallback((id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  }, []);

  const getInvestmentById = useCallback((id: string) => {
    return investments.find(inv => inv.id === id);
  }, [investments]);

  const getInvestmentsByAccount = useCallback((account: AccountType) => {
    return investments.filter(inv => inv.account === account);
  }, [investments]);

  const getInvestmentsByType = useCallback((type: InvestmentType) => {
    return investments.filter(inv => inv.type === type);
  }, [investments]);

  const getTotalByAccount = useCallback((account: AccountType) => {
    return investments
      .filter(inv => inv.account === account)
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [investments]);

  const getTotalByType = useCallback((type: InvestmentType) => {
    return investments
      .filter(inv => inv.type === type)
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [investments]);

  const getGrandTotal = useCallback(() => {
    return investments.reduce((sum, inv) => sum + inv.amount, 0);
  }, [investments]);

  const exportToJSON = useCallback(() => {
    const dataStr = JSON.stringify(investments, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investtrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [investments]);

  const importFromJSON = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        setInvestments(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import investments:', e);
      return false;
    }
  }, []);

  const getMonthlyData = useCallback(() => {
    const monthlyMap = new Map<string, { pea: number; cto: number; total: number }>();
    
    investments.forEach(inv => {
      const month = inv.date.substring(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || { pea: 0, cto: 0, total: 0 };
      
      if (inv.account === 'pea') {
        existing.pea += inv.amount;
      } else {
        existing.cto += inv.amount;
      }
      existing.total += inv.amount;
      
      monthlyMap.set(month, existing);
    });

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        pea: data.pea,
        cto: data.cto,
        amount: data.total,
      }));
  }, [investments]);

  const getTypeDistribution = useCallback(() => {
    const actions = getTotalByType('action');
    const etfs = getTotalByType('etf');
    return [
      { type: 'Actions', amount: actions },
      { type: 'ETFs', amount: etfs },
    ];
  }, [getTotalByType]);

  const getAccountDistribution = useCallback(() => {
    const pea = getTotalByAccount('pea');
    const cto = getTotalByAccount('cto');
    return [
      { name: 'PEA', value: pea },
      { name: 'CTO', value: cto },
    ];
  }, [getTotalByAccount]);

  return {
    investments,
    isLoaded,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    getInvestmentById,
    getInvestmentsByAccount,
    getInvestmentsByType,
    getTotalByAccount,
    getTotalByType,
    getGrandTotal,
    exportToJSON,
    importFromJSON,
    getMonthlyData,
    getTypeDistribution,
    getAccountDistribution,
  };
}
