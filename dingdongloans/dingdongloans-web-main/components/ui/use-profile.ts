"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/components/wallet-provider"

// Define the profile data structure
export type ProfileData = {
  display_name?: string
  email?: string
  company_name?: string
  company_position?: string
  company_website?: string
  company_description?: string
  [key: string]: any
}

// Mock API for profile management (in a real app, this would be integrated with a backend)
const profileAPI = {
  getMyProfile: async (address: string): Promise<ProfileData | null> => {
    // In a real app, this would make an API call
    // For now, we'll simulate retrieving from localStorage
    try {
      const profileData = localStorage.getItem(`profile_${address}`)
      return profileData ? JSON.parse(profileData) : null
    } catch (error) {
      console.error("Failed to retrieve profile:", error)
      return null
    }
  },
  updateProfile: async (address: string, profileData: ProfileData): Promise<ProfileData> => {
    // In a real app, this would make an API call
    // For now, we'll simulate storing in localStorage
    try {
      localStorage.setItem(`profile_${address}`, JSON.stringify(profileData))
      return profileData
    } catch (error) {
      console.error("Failed to update profile:", error)
      throw new Error("Failed to update profile")
    }
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useWallet()
  const { toast } = useToast()

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!address) return null
    
    setIsLoading(true)
    try {
      const profileData = await profileAPI.getMyProfile(address)
      setProfile(profileData)
      return profileData
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Update user profile
  const updateProfile = useCallback(async (profileData: ProfileData) => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to update your profile.",
      })
      return null
    }
    
    setIsLoading(true)
    try {
      const updatedProfile = await profileAPI.updateProfile(address, profileData)
      setProfile(updatedProfile)
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      })
      
      return updatedProfile
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message || "An unexpected error occurred. Please try again.",
      })
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, toast])

  // Check if profile is complete
  const isProfileComplete = useCallback(() => {
    if (!profile) return false
    
    const requiredFields = [
      "display_name",
      "email",
      "company_name",
      "company_position",
      "company_website",
      "company_description"
    ]
    
    return requiredFields.every(field => !!profile[field])
  }, [profile])

  return {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
    isProfileComplete
  }
}