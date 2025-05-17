"use client"

import { useState, useCallback } from "react"
import { proposalsAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

export type ProposalData = {
  id?: string
  company_name: string
  accepted_token: string
  total_pooled: string
  short_description: string
  full_description: string
  business_plan: string
  expected_return: string
  duration: string
  minimum_investment: string
  maximum_investment: string
  deadline: string
  target_funding: string
  website: string
  social_media?: {
    twitter?: string
    linkedin?: string
  }
  tags?: string[]
  documents?: Array<{
    title: string
    type: string
    url: string
    size: string
  }>
  status?: 'pending' | 'active' | 'funded' | 'expired'
}

export function useProposals() {
  const [proposals, setProposals] = useState<ProposalData[]>([])
  const [myProposals, setMyProposals] = useState<ProposalData[]>([])
  const [currentProposal, setCurrentProposal] = useState<ProposalData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // Fetch all proposals
  const fetchProposals = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await proposalsAPI.getAll()
      setProposals(data.proposals || [])
      return data.proposals
    } catch (error) {
      console.error("Failed to fetch proposals:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Fetch proposals created by the current user
  const fetchMyProposals = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await proposalsAPI.getMyProposals()
      setMyProposals(data || [])
      return data
    } catch (error) {
      console.error("Failed to fetch user proposals:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Fetch a specific proposal by ID
  const fetchProposalById = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const proposal = await proposalsAPI.getById(id)
      setCurrentProposal(proposal)
      return proposal
    } catch (error: any) {
      console.error(`Failed to fetch proposal ${id}:`, error)
      toast({
        variant: "destructive",
        title: "Error loading proposal",
        description: error.message || "Failed to load the proposal details",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])
  
  // Create a new proposal
  const createProposal = useCallback(async (proposalData: ProposalData) => {
    setIsLoading(true)
    try {
      const newProposal = await proposalsAPI.create(proposalData)
      
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
  }, [toast])
  
  return {
    proposals,
    myProposals,
    currentProposal,
    isLoading,
    fetchProposals,
    fetchMyProposals,
    fetchProposalById,
    createProposal,
  }
}
