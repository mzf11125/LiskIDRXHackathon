"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "./use-toast"
import { portfolioService, Investment, Transaction } from "@/services/portfolio"
import { useWallet } from "@/components/wallet-provider"

export function usePortfolio() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState({
    investments: false,
    transactions: false,
    summary: false
  })
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  
  const fetchInvestments = useCallback(async (walletAddress?: string) => {
    if (!isConnected || (!address && !walletAddress)) return []
    
    setIsLoading(prev => ({ ...prev, investments: true }))
    try {
      const targetAddress = walletAddress || address
      if (!targetAddress) return []
      
      const data = await portfolioService.getUserInvestments(targetAddress)
      setInvestments(data)
      return data
    } catch (error) {
      console.error("Failed to fetch investments:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load investments. Please try again.",
      })
      return []
    } finally {
      setIsLoading(prev => ({ ...prev, investments: false }))
    }
  }, [address, isConnected, toast])

  const fetchTransactions = useCallback(async (walletAddress?: string) => {
    if (!isConnected || (!address && !walletAddress)) return []
    
    setIsLoading(prev => ({ ...prev, transactions: true }))
    try {
      const targetAddress = walletAddress || address
      if (!targetAddress) return []
      
      const data = await portfolioService.getUserTransactions(targetAddress)
      setTransactions(data)
      return data
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load transaction history. Please try again.",
      })
      return []
    } finally {
      setIsLoading(prev => ({ ...prev, transactions: false }))
    }
  }, [address, isConnected, toast])

  const fetchPortfolioSummary = useCallback(async (walletAddress?: string) => {
    if (!isConnected || (!address && !walletAddress)) return null
    
    setIsLoading(prev => ({ ...prev, summary: true }))
    try {
      const targetAddress = walletAddress || address
      if (!targetAddress) return null
      
      const data = await portfolioService.getPortfolioSummary(targetAddress)
      setPortfolioSummary(data)
      return data
    } catch (error) {
      console.error("Failed to fetch portfolio summary:", error)
      return null
    } finally {
      setIsLoading(prev => ({ ...prev, summary: false }))
    }
  }, [address, isConnected, toast])

  // Auto-fetch portfolio data when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchInvestments()
      fetchTransactions()
      fetchPortfolioSummary()
    } else {
      setInvestments([])
      setTransactions([])
      setPortfolioSummary(null)
    }
  }, [isConnected, address, fetchInvestments, fetchTransactions, fetchPortfolioSummary])

  return {
    investments,
    transactions,
    portfolioSummary,
    isLoading: isLoading.investments || isLoading.transactions || isLoading.summary,
    isLoadingInvestments: isLoading.investments,
    isLoadingTransactions: isLoading.transactions,
    isLoadingSummary: isLoading.summary,
    fetchInvestments,
    fetchTransactions,
    fetchPortfolioSummary,
  }
}