import { api } from "@/hooks/use-axios";
import type {
  APIWalletAnalysis,
  UserProfile,
  ProfileUpdateRequest,
} from "@/types/wallet-analysis";

export const analyzeWallet = async (
  walletAddress: string
): Promise<APIWalletAnalysis> => {
  try {
    const { data } = await api.post("/wallets/analyze", {
      wallet_address: walletAddress,
    });
    return data;
  } catch (error) {
    console.error("Error analyzing wallet:", error);
    throw error;
  }
};

export const getWalletAnalysis = async (
  walletAddress: string
): Promise<APIWalletAnalysis> => {
  try {
    const { data } = await api.get(`/wallets/${walletAddress}`);
    return data;
  } catch (error) {
    console.error("Error fetching wallet analysis:", error);
    throw error;
  }
};

export const getOrAnalyzeWallet = async (
  walletAddress: string
): Promise<APIWalletAnalysis> => {
  try {
    // First try to get existing analysis
    return await getWalletAnalysis(walletAddress);
  } catch (error) {
    // If not found, analyze the wallet
    console.log("No existing analysis found, analyzing wallet...");
    return await analyzeWallet(walletAddress);
  }
};

// Profile API functions
export const getUserProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get("/profiles/me");
  return data;
};

export const getProfileByWallet = async (
  walletAddress: string
): Promise<UserProfile> => {
  const { data } = await api.get(`/profiles/${walletAddress}`);
  return data;
};

export const createOrUpdateUserProfile = async (
  profileData: ProfileUpdateRequest
): Promise<UserProfile> => {
  const { data } = await api.put("/profiles/me", profileData);
  return data;
};

// Keep backward compatibility
export const updateUserProfile = createOrUpdateUserProfile;

// Auto-update wallet profile function
export const autoUpdateWalletProfile = async (
  address: string
): Promise<UserProfile | null> => {
  try {
    const timestamp = Date.now();
    const profileData: ProfileUpdateRequest = {
      display_name: `Test User ${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      bio: "Auto-generated profile for proposal creation",
      avatar_url: "",
      phone: "",
      website: "https://example.com",
      social_media: {
        twitter: "",
        linkedin: "",
        telegram: "",
      },
      company_name: `Test Company ${timestamp}`,
      company_position: "CEO",
      company_website: "https://example.com",
      company_description: "A test company for API integration testing",
    };

    const { data } = await api.put("/profiles/me", profileData);
    console.log(`✓ Profile auto-updated successfully for ${address}`);
    return data;
  } catch (error: any) {
    console.error(`× Failed to auto-update profile: ${error.message}`);
    if (error.response) {
      console.error(`× Response:`, error.response.data);
    }
    return null;
  }
};
