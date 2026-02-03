import { useCallback, useEffect, useState } from 'react';
import type { AccountType, AllocationItem, AllocationPlan, InvestmentType } from '@/types';

const STORAGE_KEY = 'investtrack_allocation_plan';

const defaultPlan: AllocationPlan = {
  monthlyAmount: 500,
  peaPercent: 80,
  accounts: {
    pea: { items: [] },
    cto: { items: [] },
  },
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)));
const clampAmount = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

const normalizeItems = (items: unknown): AllocationItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Partial<AllocationItem>;
      const id = typeof record.id === 'string' ? record.id : crypto.randomUUID();
      const name = typeof record.name === 'string' ? record.name : '';
      const type = record.type === 'etf' ? 'etf' : 'action';
      const percent = clampPercent(typeof record.percent === 'number' ? record.percent : 0);
      const isConfirmed = typeof record.isConfirmed === 'boolean' ? record.isConfirmed : false;
      return { id, name, type, percent, isConfirmed } satisfies AllocationItem;
    })
    .filter((item): item is AllocationItem => Boolean(item));
};

const normalizePlan = (value: unknown): AllocationPlan => {
  if (!value || typeof value !== 'object') return defaultPlan;
  const record = value as Partial<AllocationPlan>;
  return {
    monthlyAmount: clampAmount(
      typeof record.monthlyAmount === 'number' ? record.monthlyAmount : defaultPlan.monthlyAmount
    ),
    peaPercent: clampPercent(
      typeof record.peaPercent === 'number' ? record.peaPercent : defaultPlan.peaPercent
    ),
    accounts: {
      pea: { items: normalizeItems(record.accounts?.pea?.items) },
      cto: { items: normalizeItems(record.accounts?.cto?.items) },
    },
  };
};

export function useAllocationPlan() {
  const [plan, setPlan] = useState<AllocationPlan>(defaultPlan);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPlan(normalizePlan(parsed));
      } catch (error) {
        console.error('Failed to parse allocation plan:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    }
  }, [plan, isLoaded]);

  const setMonthlyAmount = useCallback((amount: number) => {
    setPlan((prev) => ({ ...prev, monthlyAmount: clampAmount(amount) }));
  }, []);

  const setPeaPercent = useCallback((percent: number) => {
    setPlan((prev) => ({ ...prev, peaPercent: clampPercent(percent) }));
  }, []);

  const addItem = useCallback((account: AccountType, type: InvestmentType) => {
    const newItem: AllocationItem = {
      id: crypto.randomUUID(),
      name: '',
      type,
      percent: 0,
      isConfirmed: false,
    };

    setPlan((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [account]: {
          items: [newItem, ...prev.accounts[account].items],
        },
      },
    }));

    return newItem;
  }, []);

  const updateItem = useCallback(
    (account: AccountType, itemId: string, updates: Partial<AllocationItem>) => {
      setPlan((prev) => {
        const items = prev.accounts[account].items;
        const sumOther = items.reduce((sum, item) => (item.id === itemId ? sum : sum + item.percent), 0);
        const maxPercent = Math.max(0, 100 - sumOther);

        const nextItems = items.map((item) => {
          if (item.id !== itemId) return item;
          const rawPercent =
            typeof updates.percent === 'number' && Number.isFinite(updates.percent)
              ? updates.percent
              : 0;
          const nextPercent =
            updates.percent === undefined
              ? item.percent
              : Math.min(maxPercent, Math.max(0, Math.round(rawPercent)));
          return {
            ...item,
            ...updates,
            percent: nextPercent,
          };
        });

        return {
          ...prev,
          accounts: {
            ...prev.accounts,
            [account]: { items: nextItems },
          },
        };
      });
    },
    []
  );

  const setGroupPercent = useCallback((account: AccountType, type: InvestmentType, percent: number) => {
    setPlan((prev) => {
      const items = prev.accounts[account].items;
      const groupItems = items.filter((item) => item.type === type);
      if (groupItems.length === 0) return prev;

      const otherTotal = items.reduce((sum, item) => (item.type === type ? sum : sum + item.percent), 0);
      const maxPercent = Math.max(0, 100 - otherTotal);
      const targetPercent = Math.min(maxPercent, Math.max(0, Math.round(percent)));

      const currentTotal = groupItems.reduce((sum, item) => sum + item.percent, 0);
      let nextItems = items;

      if (currentTotal <= 0) {
        const base = Math.floor(targetPercent / groupItems.length);
        let remainder = targetPercent - base * groupItems.length;
        nextItems = items.map((item) => {
          if (item.type !== type) return item;
          const extra = remainder > 0 ? 1 : 0;
          remainder = Math.max(0, remainder - extra);
          return { ...item, percent: base + extra };
        });
      } else {
        const raw = groupItems.map((item) => ({
          id: item.id,
          value: (item.percent * targetPercent) / currentTotal,
        }));
        const floors = raw.map((entry) => Math.floor(entry.value));
        let remainder = targetPercent - floors.reduce((sum, value) => sum + value, 0);
        const order = raw
          .map((entry, index) => ({ index, frac: entry.value - floors[index] }))
          .sort((a, b) => b.frac - a.frac);

        const percentMap = new Map<string, number>();
        raw.forEach((entry, index) => {
          percentMap.set(entry.id, floors[index]);
        });

        for (const entry of order) {
          if (remainder <= 0) break;
          const id = raw[entry.index].id;
          percentMap.set(id, (percentMap.get(id) ?? 0) + 1);
          remainder -= 1;
        }

        nextItems = items.map((item) =>
          item.type === type ? { ...item, percent: percentMap.get(item.id) ?? item.percent } : item
        );
      }

      return {
        ...prev,
        accounts: {
          ...prev.accounts,
          [account]: { items: nextItems },
        },
      };
    });
  }, []);

  const removeItem = useCallback((account: AccountType, itemId: string) => {
    setPlan((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [account]: {
          items: prev.accounts[account].items.filter((item) => item.id !== itemId),
        },
      },
    }));
  }, []);

  return {
    plan,
    isLoaded,
    setMonthlyAmount,
    setPeaPercent,
    addItem,
    updateItem,
    removeItem,
    setGroupPercent,
  };
}
