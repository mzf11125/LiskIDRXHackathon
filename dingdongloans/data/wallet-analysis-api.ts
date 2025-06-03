import { api } from "@/hooks/use-axios";
import type { 
	APIWalletAnalysis,
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