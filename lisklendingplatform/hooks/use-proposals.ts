"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "./use-toast"
import { api } from "@/services"
import { useWallet } from "@/components/wallet-provider"

export type ProposalStatus = "pending" | "active" | "passed" | "rejected" | "executed"

export type Proposal = {
  id: string
  title: string
  description: string
  proposer: string
  status: ProposalStatus
  votesFor: number
  votesAgainst: number
  startDate: string
  endDate: string
  executionDate?: string
}

export type NewProposal = {
  title: string
  description: string
  poolId: string
}

export function useProposals(poolId?: string) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null)
  const [myProposals, setMyProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  
  const fetchProposals = useCallback(async (id?: string) => {
    setIsLoading(true)
    try {
      const targetPoolId = id || poolId
      if (!targetPoolId) {
        return []
      }
      
      const response = await api.get<Proposal[]>(`/api/pools/${targetPoolId}/proposals`)
      
      if (response.success && response.data) {
        setProposals(response.data)
        return response.data
      }
      
      return []
    } catch (error) {
      console.error(`Failed to fetch proposals:`, error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [poolId])
  
  const fetchProposalById = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const response = await api.get<Proposal>(`/api/proposals/${id}`)
      
      if (response.success && response.data) {
        setCurrentProposal(response.data)
        return response.data
      }
      
      return null
    } catch (error) {
      console.error(`Failed to fetch proposal ${id}:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load proposal details. Please try again.",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])
  
  const fetchMyProposals = useCallback(async () => {
    if (!isConnected || !address) {
      setMyProposals([]);
      return [];
    }
    
    setIsLoading(true);
    try {
      const response = await api.get<any[]>(`/api/proposals/user/${address}`);
      
      if (response.success && response.data) {
        setMyProposals(response.data);
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch user proposals:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);
  
  const createProposal = useCallback(async (data: NewProposal) => {
    if (!isConnected || !address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet to create a proposal.",
      })
      return null
    }
    
    setIsLoading(true)
    try {
      const proposalData = {
        ...data,
        proposer: address
      }
      
      const response = await api.post<typeof proposalData, Proposal>('/api/proposals', proposalData)
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Proposal created successfully",
        })
        
        // Refresh proposals list
        fetchProposals()
        
        return response.data
      } else {
        throw new Error(response.message || "Failed to create proposal")
      }
    } catch (error) {
      console.error("Failed to create proposal:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create proposal",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected, toast, fetchProposals])
  
  const voteOnProposal = useCallback(async (proposalId: string, voteFor: boolean) => {
    if (!isConnected || !address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet to vote.",
      })
      return false
    }
    
    setIsLoading(true)
    try {
      const voteData = {
        proposalId,
        voter: address,
        voteFor
      }
      
      const response = await api.post<typeof voteData, any>('/api/proposals/vote', voteData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Vote submitted successfully",
        })
        
        // Refresh proposal data
        fetchProposalById(proposalId)
        fetchProposals()
        
        return true
      } else {
        throw new Error(response.message || "Failed to submit vote")
      }
    } catch (error) {
      console.error("Failed to submit vote:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit vote",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected, toast, fetchProposals, fetchProposalById])
  
  // Auto-fetch proposals when poolId changes
  useEffect(() => {
    if (poolId) {
      fetchProposals()
    }
  }, [poolId, fetchProposals])
  
  return {
    proposals,
    currentProposal,
    myProposals,
    isLoading,
    fetchProposals,
    fetchProposalById,
    fetchMyProposals,
    createProposal,
    voteOnProposal,
  }
}
