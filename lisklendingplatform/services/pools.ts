import { api } from './api';
import type { PoolType } from '@/types/platform';

export const poolsService = {
  // Get all lending pools
  getAllPools: async (): Promise<PoolType[]> => {
    const response = await api.get<PoolType[]>('/api/pools');
    if (!response.success) {
      console.error('Failed to fetch pools:', response.message);
      return [];
    }
    return response.data || [];
  },

  // Get a specific pool by ID
  getPoolById: async (id: string): Promise<PoolType | null> => {
    const response = await api.get<PoolType>(`/api/pools/${id}`);
    if (!response.success) {
      console.error(`Failed to fetch pool ${id}:`, response.message);
      return null;
    }
    return response.data || null;
  },

  // Get proposals for a specific pool
  getPoolProposals: async (id: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/api/pools/${id}/proposals`);
    if (!response.success) {
      console.error(`Failed to fetch proposals for pool ${id}:`, response.message);
      return [];
    }
    return response.data || [];
  }
};