"use client";

import { useState, useCallback, useEffect } from "react";
import { useToast } from "./use-toast";
import {
  portfolioService,
  Investment,
  Transaction,
} from "@/services/portfolio";
import { useWallet } from "@/components/wallet-provider";

export function usePortfolio() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState({
    investments: false,
    transactions: false,
    summary: false,
  });
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  const fetchInvestments = useCallback(
    async (walletAddress?: string) => {
      if (!isConnected || (!address && !walletAddress)) return [];

      setIsLoading((prev) => ({ ...prev, investments: true }));
      try {
        // Since the getUserInvestments endpoint doesn't exist,
        // returning empty array for now
        console.warn(
          "No endpoint exists for fetching user investments. Returning empty array."
        );
        setInvestments([]);
        return [];
      } catch (error) {
        console.error("Failed to fetch investments:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load investments. Please try again.",
        });
        return [];
      } finally {
        setIsLoading((prev) => ({ ...prev, investments: false }));
      }
    },
    [address, isConnected, toast]
  );
  const fetchTransactions = useCallback(
    async (walletAddress?: string) => {
      if (!isConnected || (!address && !walletAddress)) return [];

      setIsLoading((prev) => ({ ...prev, transactions: true }));
      try {
        // Since the getUserTransactions endpoint doesn't exist,
        // returning empty array for now
        console.warn(
          "No endpoint exists for fetching user transactions. Returning empty array."
        );
        setTransactions([]);
        return [];
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load transaction history. Please try again.",
        });
        return [];
      } finally {
        setIsLoading((prev) => ({ ...prev, transactions: false }));
      }
    },
    [address, isConnected, toast]
  );
  const fetchPortfolioSummary = useCallback(
    async (walletAddress?: string) => {
      if (!isConnected || (!address && !walletAddress)) return null;

      setIsLoading((prev) => ({ ...prev, summary: true }));
      try {
        // Since the getPortfolioSummary endpoint doesn't exist,
        // we can potentially use wallet analysis data instead
        const targetAddress = walletAddress || address;
        if (!targetAddress) return null;

        try {
          // Attempt to get wallet analysis data which could be used
          // as a substitute for portfolio summary in some cases
          const walletAnalysis = await portfolioService.getWalletAnalysis(
            targetAddress
          );

          // Create a basic summary from wallet analysis data
          const mockSummary = {
            totalBalance: "0", // Not available from wallet analysis
            totalDeposited: "0", // Not available from wallet analysis
            totalEarned: "0", // Not available from wallet analysis
            totalBorrowed: "0", // Not available from wallet analysis
            activePools: 0, // Not available from wallet analysis
            assetDistribution: {},
            walletRiskScore: walletAnalysis?.final_score || 0,
            walletRiskLevel: walletAnalysis?.risk_level || "unknown",
          };

          setPortfolioSummary(mockSummary);
          return mockSummary;
        } catch (analyzeError) {
          console.error("Failed to fetch wallet analysis:", analyzeError);
          return null;
        }
      } catch (error) {
        console.error("Failed to fetch portfolio summary:", error);
        return null;
      } finally {
        setIsLoading((prev) => ({ ...prev, summary: false }));
      }
    },
    [address, isConnected]
  );

  // Auto-fetch portfolio data when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchInvestments();
      fetchTransactions();
      fetchPortfolioSummary();
    } else {
      setInvestments([]);
      setTransactions([]);
      setPortfolioSummary(null);
    }
  }, [
    isConnected,
    address,
    fetchInvestments,
    fetchTransactions,
    fetchPortfolioSummary,
  ]);

  return {
    investments,
    transactions,
    portfolioSummary,
    isLoading:
      isLoading.investments || isLoading.transactions || isLoading.summary,
    isLoadingInvestments: isLoading.investments,
    isLoadingTransactions: isLoading.transactions,
    isLoadingSummary: isLoading.summary,
    fetchInvestments,
    fetchTransactions,
    fetchPortfolioSummary,
  };
}
