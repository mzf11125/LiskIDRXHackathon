"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

// Secure implementation of Xellar hooks that don't expose the API key
export function useSecureXellarApi() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Generic function to make API calls through our secure proxy
  const callXellarApi = async (endpoint: string, params: any = {}) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/xellar-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint,
          params,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "API call failed")
      }

      return data.data
    } catch (error) {
      console.error(`Error calling Xellar API (${endpoint}):`, error)
      toast({
        title: "API Error",
        description: "Failed to communicate with Xellar. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Example function for a specific Xellar operation
  const getAssets = async () => {
    return callXellarApi("assets/list")
  }

  // Example function for loan application
  const applyForLoan = async (amount: number, duration: number, collateral: number) => {
    return callXellarApi("loans/apply", {
      amount,
      duration,
      collateral,
    })
  }

  return {
    isLoading,
    getAssets,
    applyForLoan,
  }
}
