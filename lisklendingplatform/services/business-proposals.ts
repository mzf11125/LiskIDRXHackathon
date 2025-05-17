import { api } from './api';
import type { BusinessProposal } from '@/types/business-proposal';

export const businessProposalsService = {
  // Get all active business proposals
  getActiveProposals: async (): Promise<BusinessProposal[]> => {
    const response = await api.get<BusinessProposal[]>('/api/proposals/active');
    if (!response.success) {
      console.error('Failed to fetch active proposals:', response.message);
      return [];
    }
    return response.data || [];
  },

  // Get a specific business proposal by ID
  getProposalById: async (id: string): Promise<BusinessProposal | null> => {
    const response = await api.get<BusinessProposal>(`/api/proposals/${id}`);
    if (!response.success) {
      console.error(`Failed to fetch proposal ${id}:`, response.message);
      return null;
    }
    return response.data || null;
  },

  // Get business proposals by token
  getProposalsByToken: async (token: string): Promise<BusinessProposal[]> => {
    const response = await api.get<BusinessProposal[]>(`/api/proposals/token/${token}`);
    if (!response.success) {
      console.error(`Failed to fetch proposals for token ${token}:`, response.message);
      return [];
    }
    return response.data || [];
  },

  // Create a new business proposal
  createProposal: async (proposalData: Partial<BusinessProposal>): Promise<BusinessProposal | null> => {
    const response = await api.post<Partial<BusinessProposal>, BusinessProposal>('/api/proposals', proposalData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create proposal');
    }
    return response.data || null;
  }
};