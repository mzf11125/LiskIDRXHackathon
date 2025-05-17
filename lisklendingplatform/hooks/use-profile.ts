"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "./use-toast"
import { useWallet } from "@/components/wallet-provider"
import { api } from "@/services"

export type ProfileData = {
  id?: string
  wallet_address?: string
  name: string
  email?: string
  bio?: string
  avatar_url?: string
  website?: string
  twitter?: string
  telegram?: string
  github?: string
  created_at?: string
  updated_at?: string
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  
  // Fetch profile data from API
  const fetchProfile = useCallback(async () => {
    if (!isConnected || !address) return null
    
    setIsLoading(true)
    try {
      // Get profile from API
      const response = await api.get<ProfileData>('/api/profiles/me')
      
      if (response.success && response.data) {
        setProfile(response.data)
        return response.data
      }
      
      return null
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected])
  
  // Update profile data
  const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
    if (!isConnected || !address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet to update your profile.",
      })
      return null
    }
    
    setIsLoading(true)
    try {
      const response = await api.post<Partial<ProfileData>, ProfileData>('/api/profiles/me', data)
      
      if (response.success && response.data) {
        setProfile(response.data)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        return response.data
      } else {
        throw new Error(response.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected, toast])
  
  // Clear profile when wallet is disconnected
  useEffect(() => {
    if (!isConnected) {
      setProfile(null)
    }
  }, [isConnected])
  
  // Auto-fetch profile when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchProfile()
    }
  }, [isConnected, address, fetchProfile])
  
  return {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
  }
}
