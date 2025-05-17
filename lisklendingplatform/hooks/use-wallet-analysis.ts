"use client"

import { useState } from "react"
import { walletAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

export type WalletAnalysis = {
  risk_level: 'low' | 'medium' | 'high' | 'unknown'
  final_score: number
  factors: {
    age_score: number
    balance_score: number
    transaction_score: number
    reputation_score: number
  }
  recommendation: string
}

export function useWalletAnalysis() {
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchWalletAnalysis = async (walletAddress: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await walletAPI.getAnalysis(walletAddress)
      setAnalysis(data)
      return data
    } catch (err: any) {
      console.error("Failed to fetch wallet analysis:", err)
      setError(err.message || "Failed to fetch wallet analysis")
      
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Unable to retrieve wallet analysis. Please try again later.",
      })
      
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    analysis,
    isLoading,
    error,
    fetchWalletAnalysis,
  }
}
