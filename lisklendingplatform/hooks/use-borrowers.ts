"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "./use-toast"
import { borrowersService } from "@/services"
import type { BorrowerType } from "@/types/platform"
import { useWallet } from "@/components/wallet-provider"

export function useBorrowers() {
  const [borrowers, setBorrowers] = useState<BorrowerType[]>([])
  const [currentBorrower, setCurrentBorrower] = useState<BorrowerType | null>(null)
  const [eligiblePools, setEligiblePools] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  
  const fetchBorrowers = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await borrowersService.getAllBorrowers()
      setBorrowers(data)
      return data
    } catch (error) {
      console.error("Failed to fetch borrowers:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchBorrowerByAddress = useCallback(async (borrowerAddress: string) => {
    setIsLoading(true)
    try {
      const borrower = await borrowersService.getBorrowerByAddress(borrowerAddress)
      setCurrentBorrower(borrower)
      return borrower
    } catch (error) {
      console.error(`Failed to fetch borrower ${borrowerAddress}:`, error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const fetchEligiblePools = useCallback(async (borrowerAddress: string) => {
    setIsLoading(true)
    try {
      const pools = await borrowersService.getEligiblePoolsForBorrower(borrowerAddress)
      setEligiblePools(pools)
      return pools
    } catch (error) {
      console.error(`Failed to fetch eligible pools for borrower ${borrowerAddress}:`, error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const fetchAvailableAssets = useCallback(async (borrowerAddress: string, poolId: string) => {
    setIsLoading(true)
    try {
      const assets = await borrowersService.getAvailableAssetsForBorrower(borrowerAddress, poolId)
      return assets
    } catch (error) {
      console.error(`Failed to fetch available assets for borrower ${borrowerAddress} in pool ${poolId}:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load available assets. Please try again.",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [toast])
  
  // Auto-fetch borrower data when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchBorrowerByAddress(address)
      fetchEligiblePools(address)
    } else {
      setCurrentBorrower(null)
      setEligiblePools([])
    }
  }, [isConnected, address, fetchBorrowerByAddress, fetchEligiblePools])

  return {
    borrowers,
    currentBorrower,
    eligiblePools,
    isLoading,
    fetchBorrowers,
    fetchBorrowerByAddress,
    fetchEligiblePools,
    fetchAvailableAssets
  }
}