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
	// Add new fields from API response
	age?: string;
	activity_level?: string;
	transaction_count?: number;
	unique_interactions?: number;
};

export type AIWalletAnalysis = {
	// Add id field from API response
	id?: number;
	wallet_address: string;
	network: string;
	analysis_timestamp: string;
	final_score: number;
	risk_level: string;
	scoring_breakdown: Array<{
		criteria: string;
		score_delta: number;
		reason: string;
	}> | {
		age_score?: number;
		balance_score?: number;
		activity_score?: number;
		diversity_score?: number;
	};
	wallet_metadata: WalletMetadata;
	transactions: ProcessedTransaction[];
	token_holdings: Array<{
		token: {
			address: string;
			name: string;
			symbol: string;
			type: string;
			decimals: number;
			holders: number;
			total_supply: string;
		};
		value: string;
	}>;
	behavioral_patterns: {
		outbound_only: boolean;
		contract_usage: {
			single_contract_usage: boolean;
			unverified_contract_usage: boolean;
		};
		transaction_anomalies: string[];
	} | string[];
	// Add new fields from API response
	comments?: string[] | null;
	created_at?: string;
	updated_at?: string;
};

export const createPlaceholderWalletAnalysis = (walletAddress: string): AIWalletAnalysis => ({
	wallet_address: walletAddress,
	network: "Lisk",
	analysis_timestamp: new Date().toISOString(),
	final_score: 75.5,
	risk_level: "Low",
	scoring_breakdown: [
		{
			criteria: "Wallet Age",
			score_delta: 15.0,
			reason: "Wallet has been active for 245 days, indicating established usage"
		},
		{
			criteria: "Transaction Volume",
			score_delta: 10.5,
			reason: "Consistent transaction activity with 128 total transactions"
		},
		{
			criteria: "Contract Interactions",
			score_delta: 8.0,
			reason: "Interacted with 12 unique verified contracts"
		},
		{
			criteria: "Token Diversity",
			score_delta: 5.0,
			reason: "Used 8 different tokens, showing diverse DeFi participation"
		},
		{
			criteria: "Gas Efficiency",
			score_delta: -3.0,
			reason: "Slightly inefficient gas usage in some transactions"
		}
	],
	wallet_metadata: {
		first_seen: "2024-01-15T10:30:00Z",
		last_seen: "2024-12-18T14:45:00Z",
		age_days: 245,
		total_transactions: 128,
		inbound_count: 67,
		outbound_count: 61,
		unique_tokens_used: 8,
		unique_contracts_interacted: 12,
		uses_only_transfers: false,
		all_contracts_verified: true,
		funded_by_established_wallet: true,
		linked_to_flagged_entity: false
	},
	transactions: [
		{
			tx_hash: "0x1234567890abcdef1234567890abcdef12345678",
			timestamp: "2024-12-18T14:45:00Z",
			block_number: 1234567,
			status: "ok",
			tx_type: ["token_transfer"],
			from_address: walletAddress,
			to_address: "0xabcdef1234567890abcdef1234567890abcdef12",
			from_is_contract: false,
			to_is_contract: true,
			to_is_verified: true,
			from_name: "User Wallet",
			to_name: "DeFi Protocol",
			token_name: "USDT",
			token_amount: 1000,
			value_wei: 0,
			value_usd: 0,
			fee_wei: 21000000000000,
			fee_usd: 0.05,
			gas_used: 21000,
			gas_limit: 25000,
			gas_price: 1000000000,
			gas_efficiency: 0.84
		}
	],
	token_holdings: [
		{
			token: {
				address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
				name: "Tether USD",
				symbol: "USDT",
				type: "ERC-20",
				decimals: 6,
				holders: 5234567,
				total_supply: "45678901234567890"
			},
			value: "2500.50"
		},
		{
			token: {
				address: "0xa0b86a33e6776d9feddca1c7a9f0c0a1f4c1e8f2",
				name: "Lisk Token",
				symbol: "LSK",
				type: "ERC-20",
				decimals: 18,
				holders: 123456,
				total_supply: "100000000000000000000000000"
			},
			value: "15000.0"
		}
	],
	behavioral_patterns: {
		outbound_only: false,
		contract_usage: {
			single_contract_usage: false,
			unverified_contract_usage: false
		},
		transaction_anomalies: []
	},
	comments: null,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString()
});
