"use client"

import { useState } from "react"
import { walletAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

export function useWalletAnalysis() {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch wallet analysis
  const fetchWalletAnalysis = async (walletAddress: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await walletAPI.getAnalysis(walletAddress)
      setAnalysis(data)
      return data
    } catch (err: any) {
      setError(err.message || "Failed to fetch wallet analysis")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch wallet analysis. Please try again.",
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
