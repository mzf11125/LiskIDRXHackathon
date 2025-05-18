import { api } from "./api";
import type {
  AIWalletAnalysis,
  WalletAnalysis,
  ScoringBreakdown,
} from "@/types/wallet-analysis";

// Types for portfolio data
export interface Investment {
  id: string;
  poolId: string;
  poolName: string;
  amount: string;
  apy: string;
  startDate: string;
  earned: string;
  token: string;
  status: "active" | "closed";
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "interest" | "borrow" | "repay";
  amount: string;
  token: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  poolId?: string;
  poolName?: string;
}

export interface PortfolioSummary {
  totalBalance: string;
  totalDeposited: string;
  totalEarned: string;
  totalBorrowed: string;
  activePools: number;
  assetDistribution: {
    [key: string]: {
      percentage: number;
      amount: string;
    };
  };
}

// Interface for raw wallet analysis data from API
interface RawWalletAnalysisData {
  id?: number; // Made optional since it might not be present in API response
  wallet_address: string;
  network: string;
  analysis_timestamp: string;
  final_score: number;
  risk_level?: string;
  wallet_metadata?: {
    age?: string;
    activity_level?: string;
    transaction_count?: number;
    unique_interactions?: number;
  };
  scoring_breakdown?: {
    age_score?: number;
    balance_score?: number;
    activity_score?: number;
    diversity_score?: number;
  };
  behavioral_patterns?: unknown[];
  transactions?: Array<{
    method?: string;
    status?: string;
    fee_usd?: number;
    fee_wei?: number;
    to_name?: string;
    tx_hash?: string;
    tx_type?: string[];
    gas_used?: number;
    from_name?: string;
    gas_limit?: number;
    gas_price?: number;
    timestamp?: string;
    value_usd?: number;
    value_wei?: number;
    to_address?: string;
    token_name?: string | null;
    block_number?: number;
    from_address?: string;
    token_amount?: string | null;
    gas_efficiency?: number;
    to_is_contract?: boolean;
    to_is_verified?: boolean;
    from_is_contract?: boolean;
  }>;
  token_holdings?: Array<{
    token?: {
      name?: string;
      type?: string;
      symbol?: string;
      address?: string;
      holders?: string;
      decimals?: string;
      icon_url?: string | null;
      volume_24h?: string | null;
      address_hash?: string;
      total_supply?: string;
      exchange_rate?: string | null;
      holders_count?: string;
      circulating_market_cap?: string | null;
    };
    value?: string;
    token_id?: string | null;
    token_instance?: string | null;
  }>;
  comments?: string[];
  created_at?: string;
  updated_at?: string;
}

// Function to map API response to frontend format
const mapWalletAnalysisResponse = (
  data: RawWalletAnalysisData
): AIWalletAnalysis => {
  // Ensure risk_level is properly capitalized and typed
  const risk_level =
    data.risk_level && typeof data.risk_level === "string"
      ? ((data.risk_level.charAt(0).toUpperCase() +
          data.risk_level.slice(1).toLowerCase()) as "Low" | "Medium" | "High")
      : "Medium"; // Default to Medium if not provided

  // Convert wallet age from string to number of days
  let age_days = 0;
  if (data.wallet_metadata?.age === "new") {
    age_days = 0;
  } else if (data.wallet_metadata?.age === "recent") {
    age_days = 30;
  } else if (data.wallet_metadata?.age === "established") {
    age_days = 180;
  } else if (data.wallet_metadata?.age === "old") {
    age_days = 365;
  }

  // Create scoring breakdown array based on the object structure
  const scoringBreakdown: Array<{
    reason: string;
    criteria: string;
    score_delta: number;
  }> = [];

  if (data.scoring_breakdown) {
    if (data.scoring_breakdown.age_score !== undefined) {
      scoringBreakdown.push({
        reason: "Wallet age assessment",
        criteria: "Wallet age score",
        score_delta: data.scoring_breakdown.age_score,
      });
    }

    if (data.scoring_breakdown.balance_score !== undefined) {
      scoringBreakdown.push({
        reason: "Wallet balance assessment",
        criteria: "Balance score",
        score_delta: data.scoring_breakdown.balance_score,
      });
    }

    if (data.scoring_breakdown.activity_score !== undefined) {
      scoringBreakdown.push({
        reason: "Wallet activity assessment",
        criteria: "Activity score",
        score_delta: data.scoring_breakdown.activity_score,
      });
    }

    if (data.scoring_breakdown.diversity_score !== undefined) {
      scoringBreakdown.push({
        reason: "Token diversity assessment",
        criteria: "Diversity score",
        score_delta: data.scoring_breakdown.diversity_score,
      });
    }
  }

  return {
    id: data.id || 0,
    wallet_address: data.wallet_address || "",
    network: data.network || "ethereum",
    analysis_timestamp: data.analysis_timestamp || new Date().toISOString(),
    final_score: data.final_score || 0,
    risk_level,
    wallet_metadata: {
      age_days: age_days,
      last_seen: data.analysis_timestamp || new Date().toISOString(),
      first_seen: data.created_at || new Date().toISOString(),
      inbound_count: data.wallet_metadata?.transaction_count || 0,
      outbound_count: 0, // Not provided in the example
      total_transactions: data.wallet_metadata?.transaction_count || 0,
      unique_tokens_used: data.wallet_metadata?.unique_interactions || 0,
      uses_only_transfers: true, // Default
      all_contracts_verified: true, // Default
      linked_to_flagged_entity: false, // Default
      unique_contracts_interacted:
        data.wallet_metadata?.unique_interactions || 0,
      funded_by_established_wallet: false, // Default
    },
    scoring_breakdown: scoringBreakdown,
    behavioral_patterns: {
      outbound_only: false, // Default
      contract_usage: {
        single_contract_usage: false, // Default
        unverified_contract_usage: false, // Default
      },
      transaction_anomalies: [], // Default
    },
    transactions: [], // Empty array as per the sample response
    token_holdings: [], // Empty array as per the sample response
    comments: data.comments?.length ? data.comments.join(". ") : null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
};

// Convert the AIWalletAnalysis to the simplified WalletAnalysis format used by frontend components
const convertToWalletAnalysis = (
  aiAnalysis: AIWalletAnalysis
): WalletAnalysis => {
  return {
    wallet_address: aiAnalysis.wallet_address,
    risk_level: aiAnalysis.risk_level,
    final_score: aiAnalysis.final_score,
    wallet_age: aiAnalysis.wallet_metadata.age_days,
    transaction_volume: `${aiAnalysis.wallet_metadata.total_transactions} transactions`,
    average_balance: "Not available", // Not provided in the API response
    balance_stability: "Not available", // Not provided in the API response
    transaction_frequency:
      aiAnalysis.wallet_metadata.total_transactions > 10 ? "High" : "Low",
    transaction_consistency: "Normal", // Default value
    defi_interaction:
      aiAnalysis.wallet_metadata.unique_contracts_interacted > 5
        ? "Active"
        : "Limited",
    risk_factors: aiAnalysis.scoring_breakdown
      .filter((item) => item.score_delta < 0)
      .map((item) => item.reason),
    summary: aiAnalysis.comments || "No detailed summary available",
    lending_recommendation:
      aiAnalysis.risk_level === "Low"
        ? "Good candidate for lending with standard terms"
        : aiAnalysis.risk_level === "Medium"
        ? "Proceed with caution, consider enhanced verification"
        : "High risk, lending not recommended without additional verification",
    investment_recommendation:
      aiAnalysis.risk_level === "Low"
        ? "Suitable for regular investment products"
        : aiAnalysis.risk_level === "Medium"
        ? "Limit investment exposure and monitor activity"
        : "Not recommended for investment relationships",
    risk_mitigation:
      aiAnalysis.risk_level === "Low"
        ? "Standard monitoring is sufficient"
        : aiAnalysis.risk_level === "Medium"
        ? "Enhanced due diligence and transaction monitoring recommended"
        : "Require intensive KYC/AML verification before proceeding",
  };
};

export const portfolioService = {
  // Get wallet analysis from the /wallet/analyze/{wallet_address} endpoint
  getWalletAnalysis: async (
    walletAddress: string
  ): Promise<WalletAnalysis | null> => {
    try {
      // Use the correct endpoint: /wallet/analyze/{walletAddress}
      const response = await api.get<RawWalletAnalysisData>(
        `/wallet/analyze/${walletAddress}`
      );

      if (!response.success || !response.data) {
        console.error(
          `Failed to fetch wallet analysis for ${walletAddress}:`,
          response.message
        );
        return null;
      }

      // Transform API response to AIWalletAnalysis format
      const aiAnalysis = mapWalletAnalysisResponse(response.data);

      // Convert to simpler WalletAnalysis format for frontend components
      return convertToWalletAnalysis(aiAnalysis);
    } catch (error) {
      console.error(`Error in wallet analysis for ${walletAddress}:`, error);
      return null;
    }
  },
  // Get complete AI wallet analysis data
  getAIWalletAnalysis: async (
    walletAddress: string
  ): Promise<AIWalletAnalysis | null> => {
    try {
      const response = await api.get<RawWalletAnalysisData>(
        `/wallet/analyze/${walletAddress}`
      );

      if (!response.success || !response.data) {
        console.error(
          `Failed to fetch wallet analysis for ${walletAddress}:`,
          response.message
        );
        return null;
      }

      // Transform API response to AIWalletAnalysis format
      return mapWalletAnalysisResponse(response.data);
    } catch (error) {
      console.error(`Error in wallet analysis for ${walletAddress}:`, error);
      return null;
    }
  },
};
