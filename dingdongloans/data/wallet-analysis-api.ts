import { api } from "@/hooks/use-axios";
import type { AIWalletAnalysis } from "@/types/wallet-analysis";

export const fetchWalletAnalysis = async (
    walletAddress: string
): Promise<AIWalletAnalysis | null> => {
    try {
        const { data } = await api.get(`/wallets/${walletAddress}`);
        return data;
    } catch (error) {
        console.error(`Error fetching wallet analysis for ${walletAddress}:`, error);
        return null;
    }
};

export const analyzeWallet = async (
    walletAddress: string
): Promise<AIWalletAnalysis | null> => {
    try {
        const { data } = await api.post(`/wallets/analyze/${walletAddress}`);
        return data;
    } catch (error) {
        console.error(`Error analyzing wallet ${walletAddress}:`, error);
        return null;
    }
};

// New function to handle the complete workflow: POST first, then GET if needed
export const getOrCreateWalletAnalysis = async (
    walletAddress: string
): Promise<AIWalletAnalysis | null> => {
    try {
        // First try to get existing analysis
        let analysis = await fetchWalletAnalysis(walletAddress);

        // If no analysis exists or it's incomplete, trigger new analysis
        if (!analysis || analysis.final_score === 0 || analysis.risk_level === "unknown") {
            console.log(`Triggering new analysis for wallet ${walletAddress}`);
            analysis = await analyzeWallet(walletAddress);

            // If the POST returns incomplete data, wait a bit and try GET again
            if (analysis && (analysis.final_score === 0 || analysis.risk_level === "unknown")) {
                console.log(`Analysis incomplete, waiting for processing...`);
                // Wait 2 seconds for processing
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const updatedAnalysis = await fetchWalletAnalysis(walletAddress);
                if (updatedAnalysis && updatedAnalysis.final_score > 0) {
                    analysis = updatedAnalysis;
                }
            }
        }

        return analysis;
    } catch (error) {
        console.error(`Error getting or creating wallet analysis for ${walletAddress}:`, error);
        return null;
    }
};
