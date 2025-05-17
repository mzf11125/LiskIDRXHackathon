import { api } from './api';

// Types for portfolio data
export interface Investment {
  id: string;
  poolId: string;
  poolName: string;
  amount: string;
  apy: string;
  startDate: string;
  earned: string;
  token: string;
  status: 'active' | 'closed';
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'interest' | 'borrow' | 'repay';
  amount: string;
  token: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  poolId?: string;
  poolName?: string;
}

export const portfolioService = {
  // Get user investments
  getUserInvestments: async (address: string): Promise<Investment[]> => {
    const response = await api.get<Investment[]>(`/api/portfolio/${address}/investments`);
    if (!response.success) {
      console.error(`Failed to fetch investments for ${address}:`, response.message);
      return [];
    }
    return response.data || [];
  },

  // Get user transactions
  getUserTransactions: async (address: string): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(`/api/portfolio/${address}/transactions`);
    if (!response.success) {
      console.error(`Failed to fetch transactions for ${address}:`, response.message);
      return [];
    }
    return response.data || [];
  },

  // Get portfolio summary
  getPortfolioSummary: async (address: string): Promise<any> => {
    const response = await api.get<any>(`/api/portfolio/${address}/summary`);
    if (!response.success) {
      console.error(`Failed to fetch portfolio summary for ${address}:`, response.message);
      return null;
    }
    return response.data || null;
  }
};