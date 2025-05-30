"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/components/wallet-provider";
import {
  getUserProfile,
  updateUserProfile,
  autoUpdateWalletProfile,
} from "@/data/wallet-analysis-api";
import { UserProfile, ProfileUpdateRequest } from "@/types/wallet-analysis";

// Define the profile data structure
export type ProfileData = UserProfile;

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { address, isAuthenticated, authenticate } = useWallet();
  const { toast } = useToast();

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!address) return null;

    if (!isAuthenticated) {
      console.log("Not authenticated, attempting to authenticate...");
      try {
        await authenticate();
      } catch (error) {
        console.error("Authentication failed:", error);
        return null;
      }
    }

    setIsLoading(true);
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
      return profileData;
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);

      // If we get a 401, try to re-authenticate
      if (error.response?.status === 401) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign the authentication message to continue.",
        });
        try {
          await authenticate();
          // Retry fetching profile after authentication
          const profileData = await getUserProfile();
          setProfile(profileData);
          return profileData;
        } catch (authError) {
          console.error("Re-authentication failed:", authError);
        }
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, isAuthenticated, authenticate, toast]);

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

      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign the authentication message first.",
        });
        try {
          await authenticate();
        } catch (error) {
          return null;
        }
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

        // Handle authentication errors
        if (error.response?.status === 401) {
          toast({
            variant: "destructive",
            title: "Authentication required",
            description: "Please sign the authentication message to continue.",
          });
          try {
            await authenticate();
            // Retry updating profile after authentication
            const updatedProfile = await updateUserProfile(profileData);
            setProfile(updatedProfile);
            toast({
              title: "Profile updated",
              description: "Your profile has been successfully updated",
            });
            return updatedProfile;
          } catch (authError) {
            console.error("Re-authentication failed:", authError);
          }
        } else {
          toast({
            variant: "destructive",
            title: "Failed to update profile",
            description:
              error.message || "An unexpected error occurred. Please try again.",
          });
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, isAuthenticated, authenticate, toast]
  );

  // Auto-update profile with default values
  const autoUpdateProfile = useCallback(async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
      });
      return null;
    }

    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign the authentication message first.",
      });
      try {
        await authenticate();
      } catch (error) {
        return null;
      }
    }

    setIsLoading(true);
    try {
      const updatedProfile = await autoUpdateWalletProfile(address);
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: "Profile auto-updated",
          description:
            "Your profile has been automatically completed for proposal creation.",
        });
      }
      return updatedProfile;
    } catch (error: any) {
      console.error("Failed to auto-update profile:", error);
      toast({
        variant: "destructive",
        title: "Failed to auto-update profile",
        description: error.message || "An unexpected error occurred.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, isAuthenticated, authenticate, toast]);

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
    autoUpdateProfile,
    isProfileComplete,
  };
}
