export type WalletMetadata = {
  age_days: number
  last_seen: string
  first_seen: string
  inbound_count: number
  outbound_count: number
  total_transactions: number
  unique_tokens_used: number
  uses_only_transfers: boolean
  all_contracts_verified: boolean
  linked_to_flagged_entity: boolean
  unique_contracts_interacted: number
  funded_by_established_wallet: boolean
}

export type ScoringBreakdown = {
  reason: string
  criteria: string
  score_delta: number
}

export type BehavioralPatterns = {
  outbound_only: boolean
  contract_usage: {
    single_contract_usage: boolean
    unverified_contract_usage: boolean
  }
  transaction_anomalies: string[]
}

export type Transaction = {
  method: string
  status: string
  fee_usd: number
  fee_wei: number
  to_name: string
  tx_hash: string
  tx_type: string[]
  gas_used: number
  from_name: string
  gas_limit: number
  gas_price: number
  timestamp: string
  value_usd: number
  value_wei: number
  to_address: string
  token_name: string | null
  block_number: number
  from_address: string
  token_amount: string | null
  gas_efficiency: number
  to_is_contract: boolean
  to_is_verified: boolean
  from_is_contract: boolean
}

export type TokenInfo = {
  name: string
  type: string
  symbol: string
  address: string
  holders: string
  decimals: string
  icon_url: string | null
  volume_24h: string | null
  address_hash: string
  total_supply: string
  exchange_rate: string | null
  holders_count: string
  circulating_market_cap: string | null
}

export type TokenHolding = {
  token: TokenInfo
  value: string
  token_id: string | null
  token_instance: string | null
}

export type AIWalletAnalysis = {
  id: number
  wallet_address: string
  network: string
  analysis_timestamp: string
  final_score: number
  risk_level: "Low" | "Medium" | "High"
  wallet_metadata: WalletMetadata
  scoring_breakdown: ScoringBreakdown[]
  behavioral_patterns: BehavioralPatterns
  transactions: Transaction[]
  token_holdings: TokenHolding[]
  comments: string | null
  created_at: string
  updated_at: string
}

export interface WalletAnalysis {
  wallet_address: string
  risk_level: "Low" | "Medium" | "High"
  final_score: number
  transaction_volume?: string
  wallet_age?: number
  average_balance?: string
  balance_stability?: string
  transaction_frequency?: string
  transaction_consistency?: string
  defi_interaction?: string
  risk_factors?: string[]
  summary?: string
  lending_recommendation?: string
  investment_recommendation?: string
  risk_mitigation?: string
}
