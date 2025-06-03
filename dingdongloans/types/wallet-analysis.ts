export type AddressInfo = {
  hash: string;
  is_contract: boolean;
  is_verified?: boolean;
  name?: string;
};

export type DecodedParameter = {
  name: string;
  type: string;
  value: string;
};

export type DecodedInput = {
  method_call: string;
  method_id: string;
  parameters: DecodedParameter[];
};

export type FeeInfo = {
  type: "actual";
  value: string;
};

export type Transaction = {
  hash: string;
  timestamp: string;
  block_number: number;
  status: string;
  transaction_types: string[];
  from: AddressInfo;
  to?: AddressInfo;
  method?: string;
  decoded_input?: DecodedInput;
  value: string;
  fee?: FeeInfo;
  gas_used: string;
  gas_limit: string;
  gas_price: string;
  exchange_rate?: string;
  historic_exchange_rate?: string;
  token_name?: string;
  created_contract?: AddressInfo;
};

export type ProcessedTransaction = {
  tx_hash: string;
  timestamp: string;
  block_number: number;
  status: string;
  tx_type: string[];
  from_address: string;
  to_address: string;
  from_is_contract: boolean;
  to_is_contract: boolean;
  to_is_verified: boolean;
  from_name?: string;
  to_name?: string;
  token_name?: string;
  method?: string;
  token_amount?: number;
  value_wei: number;
  value_usd: number;
  fee_wei: number;
  fee_usd: number;
  gas_used: number;
  gas_limit: number;
  gas_price: number;
  gas_efficiency: number;
};

export type WalletMetadata = {
  first_seen: string;
  last_seen: string;
  age_days: number;
  total_transactions: number;
  inbound_count: number;
  outbound_count: number;
  unique_tokens_used: number;
  unique_contracts_interacted: number;
  uses_only_transfers: boolean;
  all_contracts_verified: boolean;
  funded_by_established_wallet: boolean;
  linked_to_flagged_entity: boolean;
};

export type APIWalletMetadata = {
  age: string;
  activity_level: string;
  transaction_count: number;
  unique_interactions: number;
};

export type APIScoringBreakdown = {
  age_score: number;
  balance_score: number;
  activity_score: number;
  diversity_score: number;
};

export type APIWalletAnalysis = {
  id: number;
  wallet_address: string;
  network: string;
  analysis_timestamp: string;
  final_score: number;
  risk_level: string;
  wallet_metadata: APIWalletMetadata;
  scoring_breakdown: APIScoringBreakdown;
  behavioral_patterns: string[];
  transactions: any[];
  token_holdings: any[];
  comments: string[];
  created_at: string;
  updated_at: string;
};


// Keep existing AIWalletAnalysis type for backward compatibility
export type AIWalletAnalysis = {
  id: number;
  wallet_address: string;
  network: string;
  analysis_timestamp: string;
  final_score: number;
  risk_level: string;
  wallet_metadata: WalletMetadata;
  scoring_breakdown: Array<{
    criteria: string;
    score_delta: number;
    reason: string;
  }>;
  behavioral_patterns: {
    outbound_only: boolean;
    transaction_anomalies: string[];
    contract_usage: {
      single_contract_usage: boolean;
      unverified_contract_usage: boolean;
    };
  };
  transactions: ProcessedTransaction[];
  token_holdings: Array<{
    token: {
      name: string;
      type: string;
      symbol: string;
      address: string;
      holders: string;
      decimals: string;
      icon_url: string | null;
      volume_24h: string | null;
      address_hash: string;
      total_supply: string;
      exchange_rate: string | null;
      holders_count: string;
      circulating_market_cap: string | null;
    };
    value: string;
    token_id: string | null;
    token_instance: string | null;
  }>;
  comments: string[] | null;
  created_at: string;
  updated_at: string;
};
