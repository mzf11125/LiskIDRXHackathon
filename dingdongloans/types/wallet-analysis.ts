export type WalletTransaction = {
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

export type WalletToken = {
  token: {
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
  value: string
  token_id: string | null
  token_instance: string | null
}

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

export type ScoreBreakdown = {
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

export type AIWalletAnalysis = {
  id: number
  wallet_address: string
  network: string
  analysis_timestamp: string
  final_score: number
  risk_level: string
  wallet_metadata: WalletMetadata
  scoring_breakdown: ScoreBreakdown[]
  behavioral_patterns: BehavioralPatterns
  transactions: WalletTransaction[]
  token_holdings: WalletToken[]
  comments: string | null
  created_at: string
  updated_at: string
}
