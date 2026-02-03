export type InvestmentType = 'action' | 'etf';
export type AccountType = 'pea' | 'cto';

export interface Investment {
  id: string;
  name: string;
  isin?: string;
  amount: number;
  type: InvestmentType;
  account: AccountType;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PortfolioStats {
  totalPEA: number;
  totalCTO: number;
  totalActions: number;
  totalETFs: number;
  investmentsByMonth: { month: string; amount: number; pea: number; cto: number }[];
  investmentsByType: { type: string; amount: number }[];
}

export interface CalculatorState {
  amount: string;
  percentage: string;
}

export interface AllocationItem {
  id: string;
  name: string;
  type: InvestmentType;
  percent: number;
  isConfirmed?: boolean;
}

export interface AllocationAccount {
  items: AllocationItem[];
  groupPercents: {
    action: number;
    etf: number;
  };
}

export interface AllocationPlan {
  monthlyAmount: number;
  peaPercent: number;
  accounts: {
    pea: AllocationAccount;
    cto: AllocationAccount;
  };
}
