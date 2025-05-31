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
