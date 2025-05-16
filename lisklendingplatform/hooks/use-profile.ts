"use client"

import { useState } from "react"
import { profileAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

export function useProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await profileAPI.getMyProfile()
      setProfile(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile")
      // Don't show toast here as this might be called on initial load
      // and the user might not have a profile yet
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (profileData: any) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedProfile = await profileAPI.updateProfile(profileData)
      setProfile(updatedProfile)

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })

      return updatedProfile
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  }
}
