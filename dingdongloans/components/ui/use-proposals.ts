"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/components/wallet-provider"

export type ProposalData = {
  id?: string
  companyName: string
  acceptedToken: string
  shortDescription: string
  fullDescription: string
  businessPlan: string
  expectedReturn: string
  targetFunding: string
  minimumInvestment: string
  maximumInvestment: string
  deadline: Date
  website?: string
  twitter?: string
  linkedin?: string
  telegram?: string
  proposerWallet: string
  proposedAt: string
  currentFunding: string
  investorCount: number
  status: 'pending' | 'active' | 'funded' | 'expired' | 'cancelled'
  [key: string]: any
}

// Mock API for proposal management (in a real app, this would be integrated with a backend)
const proposalsAPI = {
  getMyProposals: async (address: string): Promise<ProposalData[]> => {
    try {
      const proposalsData = localStorage.getItem(`proposals_${address}`)
      return proposalsData ? JSON.parse(proposalsData) : []
    } catch (error) {
      console.error("Failed to retrieve proposals:", error)
      return []
    }
  },
  
  createProposal: async (address: string, proposalData: ProposalData): Promise<ProposalData> => {
    try {
      // Check if user already has a proposal
      const currentProposals = await proposalsAPI.getMyProposals(address)
      if (currentProposals.length > 0) {
        throw new Error("You already have an active proposal. Only one proposal per wallet is allowed.")
      }
      
      // Generate proposal with additional fields
      const newProposal = {
        ...proposalData,
        id: `proposal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        proposerWallet: address,
        proposedAt: new Date().toISOString(),
        currentFunding: "0",
        investorCount: 0,
        status: 'active' as const
      }
      
      // Save the proposal
      localStorage.setItem(`proposals_${address}`, JSON.stringify([newProposal]))
      return newProposal
    } catch (error) {
      console.error("Failed to create proposal:", error)
      throw error
    }
  },
  
  getAllProposals: async (): Promise<ProposalData[]> => {
    // In a real app, this would query the blockchain or a database
    // Here we'll just simulate it with a mock response
    return []
  }
}

export function useProposals() {
  const [proposals, setProposals] = useState<ProposalData[]>([])
  const [myProposals, setMyProposals] = useState<ProposalData[]>([])
  const [currentProposal, setCurrentProposal] = useState<ProposalData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useWallet()
  const { toast } = useToast()
  
  // Fetch all proposals
  const fetchProposals = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await proposalsAPI.getAllProposals()
      setProposals(data)
      return data
    } catch (error) {
      console.error("Failed to fetch proposals:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Fetch proposals created by the current user
  const fetchMyProposals = useCallback(async () => {
    if (!address) return []
    
    setIsLoading(true)
    try {
      const data = await proposalsAPI.getMyProposals(address)
      setMyProposals(data)
      return data
    } catch (error) {
      console.error("Failed to fetch user proposals:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [address])
  
  // Create a new proposal
  const createProposal = useCallback(async (proposalData: Omit<ProposalData, 'id' | 'proposerWallet' | 'proposedAt' | 'currentFunding' | 'investorCount' | 'status'>) => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create a proposal.",
      })
      return null
    }
    
    setIsLoading(true)
    try {
      // Check if user already has proposals
      const userProposals = await proposalsAPI.getMyProposals(address)
      if (userProposals.length > 0) {
        toast({
          variant: "destructive",
          title: "Proposal limit reached",
          description: "You already have an active proposal. Only one proposal per wallet is allowed.",
        })
        return null
      }
      
      const newProposal = await proposalsAPI.createProposal(address, proposalData as any)
      setMyProposals([...myProposals, newProposal])
      
      toast({
        title: "Proposal created",
        description: "Your business proposal has been successfully submitted",
      })
      
      return newProposal
    } catch (error: any) {
      console.error("Failed to create proposal:", error)
      
      toast({
        variant: "destructive",
        title: "Failed to create proposal",
        description: error.message || "An unexpected error occurred. Please try again.",
      })
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, myProposals, toast])
  
  // Check if user already has a proposal
  const hasExistingProposal = useCallback(async (): Promise<boolean> => {
    if (!address) return false
    
    try {
      const userProposals = await proposalsAPI.getMyProposals(address)
      return userProposals.length > 0
    } catch (error) {
      console.error("Failed to check existing proposals:", error)
      return false
    }
  }, [address])
  
  return {
    proposals,
    myProposals,
    currentProposal,
    isLoading,
    fetchProposals,
    fetchMyProposals,
    createProposal,
    hasExistingProposal
  }
}