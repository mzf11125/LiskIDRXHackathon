// Base API service for handling common operations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export const api = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async post<T, R>(endpoint: string, body: T): Promise<ApiResponse<R>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data as ApiResponse<R>;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};

// Authentication API
export const authAPI = {
  // Request a message to sign
  requestMessage: async (walletAddress: string) => {
    const response = await api.post<{ wallet_address: string }, { message: string }>('/auth/request-message', { wallet_address: walletAddress });
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  },

  // Verify signed message using Xellar Kit signature
  verifySignature: async (walletAddress: string, message: string, signature: string) => {
    const response = await api.post<{ wallet_address: string; message: string; signature: string }, { access_token: string }>('/auth/verify', {
      wallet_address: walletAddress,
      message,
      signature,
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    // If verification is successful, store the user's address for future reference
    if (response.data?.access_token) {
      localStorage.setItem('wallet_address', walletAddress);
    }

    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  // Logout/clear authentication
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('wallet_address');
  },
};

// Proposals API
export const proposalsAPI = {
  // Get all proposals
  getAll: async () => {
    const response = await api.get<{ proposals: any[] }>('/proposals');
    if (!response.success) {
      console.error(response.message);
      return { proposals: [] };
    }
    return response.data;
  },

  // Get proposal by ID
  getById: async (id: string) => {
    const response = await api.get<any>(`/proposals/${id}`);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  },

  // Get my proposals
  getMyProposals: async () => {
    const response = await api.get<{ proposals: any[] }>('/proposals/me');
    if (!response.success) {
      console.error(response.message);
      return [];
    }
    return response.data?.proposals || [];
  },

  // Create a new proposal
  create: async (proposalData: any) => {
    const response = await api.post<any, any>('/proposals/', proposalData);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  },
};

// Wallet API
export const walletAPI = {
  // Get wallet analysis
  getAnalysis: async (walletAddress: string) => {
    const response = await api.get<any>(`/wallets/${walletAddress}`);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  // Get my profile
  getMyProfile: async () => {
    const response = await api.get<any>('/profiles/me');
    if (!response.success) {
      if (response.message.includes('404')) {
        console.log('Profile not found, user may be new');
        return null;
      }
      console.error(response.message);
      return null;
    }
    return response.data;
  },

  // Update my profile
  updateProfile: async (profileData: any) => {
    const response = await api.post<any, any>('/profiles/me', profileData);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  },
};
