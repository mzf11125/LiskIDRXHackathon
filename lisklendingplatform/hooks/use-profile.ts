"use client"

import { useState, useCallback } from "react"
import { profileAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

export type ProfileData = {
  display_name: string
  email: string
  company_name: string
  company_position: string
  company_website: string
  company_description: string
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch user profile from the API
  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const profileData = await profileAPI.getMyProfile()
      setProfile(profileData)
      return profileData
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update user profile
  const updateProfile = useCallback(async (profileData: ProfileData) => {
    setIsLoading(true)
    try {
      const updatedProfile = await profileAPI.updateProfile(profileData)
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
  }, [toast])

  return {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
  }
}
