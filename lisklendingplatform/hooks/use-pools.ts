"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "./use-toast"
import { poolsService } from "@/services"
import type { PoolType } from "@/types/platform"

export function usePools() {
  const [pools, setPools] = useState<PoolType[]>([])
  const [currentPool, setCurrentPool] = useState<PoolType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const fetchPools = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await poolsService.getAllPools()
      setPools(data)
      return data
    } catch (error) {
      console.error("Failed to fetch pools:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pools. Please try again.",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const fetchPoolById = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const pool = await poolsService.getPoolById(id)
      setCurrentPool(pool)
      return pool
    } catch (error) {
      console.error(`Failed to fetch pool ${id}:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pool details. Please try again.",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Auto-fetch pools on component mount
  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  return {
    pools,
    currentPool,
    isLoading,
    fetchPools,
    fetchPoolById,
  }
}