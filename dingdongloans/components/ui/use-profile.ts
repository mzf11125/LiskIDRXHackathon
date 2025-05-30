"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/components/wallet-provider";
import { getUserProfile, updateUserProfile } from "@/data/wallet-analysis-api";
import { UserProfile, ProfileUpdateRequest } from "@/types/wallet-analysis";

// Define the profile data structure
export type ProfileData = UserProfile;

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useWallet();
  const { toast } = useToast();

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!address) return null;

    setIsLoading(true);
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
      return profileData;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Update user profile
  const updateProfile = useCallback(
    async (profileData: ProfileUpdateRequest) => {
      if (!address) {
        toast({
          variant: "destructive",
          title: "Wallet not connected",
          description: "Please connect your wallet to update your profile.",
        });
        return null;
      }

      setIsLoading(true);
      try {
        const updatedProfile = await updateUserProfile(profileData);
        setProfile(updatedProfile);

        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated",
        });

        return updatedProfile;
      } catch (error: any) {
        console.error("Failed to update profile:", error);

        toast({
          variant: "destructive",
          title: "Failed to update profile",
          description:
            error.message || "An unexpected error occurred. Please try again.",
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, toast]
  );

  // Check if profile is complete
  const isProfileComplete = useCallback(() => {
    if (!profile) return false;

    const requiredFields = [
      "display_name",
      "email",
      "company_name",
      "company_position",
      "company_website",
      "company_description",
    ];

    return requiredFields.every(
      (field) => !!profile[field as keyof ProfileData]
    );
  }, [profile]);

  return {
    profile,
    isLoading,
    fetchProfile,
    updateProfile,
    isProfileComplete,
  };
}
