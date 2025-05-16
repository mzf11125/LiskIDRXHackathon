import axios from "axios"
import { handleApiError } from "./api-error-handler"

// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Authentication API
export const authAPI = {
  // Request a message to sign
  requestMessage: async (walletAddress: string) => {
    try {
      const response = await api.post("/auth/request-message", { wallet_address: walletAddress })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to request authentication message"))
    }
  },

  // Verify signed message
  verifySignature: async (walletAddress: string, message: string, signature: string) => {
    try {
      const response = await api.post("/auth/verify", {
        wallet_address: walletAddress,
        message,
        signature,
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to verify signature"))
    }
  },
}

// Proposals API
export const proposalsAPI = {
  // Get all proposals
  getAll: async () => {
    try {
      const response = await api.get("/proposals")
      return response.data
    } catch (error) {
      handleApiError(error, "Failed to fetch proposals")
      return { proposals: [] }
    }
  },

  // Get proposal by ID
  getById: async (id: string) => {
    try {
      const response = await api.get(`/proposals/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to fetch proposal details"))
    }
  },

  // Get my proposals
  getMyProposals: async () => {
    try {
      const response = await api.get("/proposals/me")
      return response.data.proposals
    } catch (error) {
      handleApiError(error, "Failed to fetch your proposals")
      return []
    }
  },

  // Create a new proposal
  create: async (proposalData: any) => {
    try {
      const response = await api.post("/proposals/", proposalData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to create proposal"))
    }
  },
}

// Wallet API
export const walletAPI = {
  // Get wallet analysis
  getAnalysis: async (walletAddress: string) => {
    try {
      const response = await api.get(`/wallets/${walletAddress}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to fetch wallet analysis"))
    }
  },
}

// Profile API
export const profileAPI = {
  // Get my profile
  getMyProfile: async () => {
    try {
      const response = await api.get("/profiles/me")
      return response.data
    } catch (error) {
      // Don't show toast for profile not found as this is expected for new users
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log("Profile not found, user may be new")
        return null
      }
      handleApiError(error, "Failed to fetch profile")
      return null
    }
  },

  // Update my profile
  updateProfile: async (profileData: any) => {
    try {
      const response = await api.put("/profiles/me", profileData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to update profile"))
    }
  },
}

export default api
