"use client"

import { useState } from "react"
import { proposalsAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

export function useProposals() {
  const [proposals, setProposals] = useState<any[]>([])
  const [myProposals, setMyProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch all proposals
  const fetchProposals = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await proposalsAPI.getAll()
      setProposals(data.proposals || [])
    } catch (err: any) {
      setError(err.message || "Failed to fetch proposals")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch proposals. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch my proposals
  const fetchMyProposals = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await proposalsAPI.getMyProposals()
      setMyProposals(data || [])
    } catch (err: any) {
      setError(err.message || "Failed to fetch your proposals")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch your proposals. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new proposal
  const createProposal = async (proposalData: any) => {
    try {
      setIsLoading(true)
      setError(null)
      const newProposal = await proposalsAPI.create(proposalData)

      // Update the proposals list
      setProposals((prev) => [newProposal, ...prev])
      setMyProposals((prev) => [newProposal, ...prev])

      toast({
        title: "Success",
        description: "Your business proposal has been created successfully.",
      })

      return newProposal
    } catch (err: any) {
      setError(err.message || "Failed to create proposal")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create proposal. Please try again.",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    proposals,
    myProposals,
    isLoading,
    error,
    fetchProposals,
    fetchMyProposals,
    createProposal,
  }
}
