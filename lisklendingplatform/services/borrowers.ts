import { api } from './api';
import type { BorrowerType } from '@/types/platform';

export const borrowersService = {
  // Get all borrowers
  getAllBorrowers: async (): Promise<BorrowerType[]> => {
    const response = await api.get<BorrowerType[]>('/api/borrowers');
    if (!response.success) {
      console.error('Failed to fetch borrowers:', response.message);
      return [];
    }
    return response.data || [];
  },

  // Get a specific borrower by address
  getBorrowerByAddress: async (address: string): Promise<BorrowerType | null> => {
    const response = await api.get<BorrowerType>(`/api/borrowers/${address}`);
    if (!response.success) {
      console.error(`Failed to fetch borrower ${address}:`, response.message);
      return null;
    }
    return response.data || null;
  },

  // Get pools eligible for a specific borrower
  getEligiblePoolsForBorrower: async (address: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/api/borrowers/${address}/eligible-pools`);
    if (!response.success) {
      console.error(`Failed to fetch eligible pools for borrower ${address}:`, response.message);
      return [];
    }
    return response.data || [];
  },

  // Get available assets for a borrower in a specific pool
  getAvailableAssetsForBorrower: async (address: string, poolId: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/api/borrowers/${address}/pools/${poolId}/assets`);
    if (!response.success) {
      console.error(`Failed to fetch available assets for borrower ${address} in pool ${poolId}:`, response.message);
      return [];
    }
    return response.data || [];
  }
};