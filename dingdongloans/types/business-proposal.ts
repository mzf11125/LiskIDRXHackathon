export type SocialMediaLinks = {
	twitter?: string;
	linkedin?: string;
	telegram?: string;
	facebook?: string;
	discord?: string;
	github?: string;
};

export type DocumentBase = {
	title: string;
	type: "pdf" | "image" | "spreadsheet" | "presentation" | "contract";
	url: string;
	size: string;
};

export type Document = DocumentBase & {
	id: string;
	proposal_id: string;
	uploaded_at: string;
	created_at: string;
	updated_at: string;
};

export type FraudRiskAnalysis = {
	wallet_address: string;
	network: string;
	analysis_timestamp: string;
	scoring_breakdown: Array<{
		criteria: string;
		score_delta: number;
		reason: string;
	}>;
	wallet_metadata: {
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
	behavioral_patterns: {
		outbound_only: boolean;
		transaction_anomalies: string[];
		contract_usage: {
			single_contract_usage: boolean;
			unverified_contract_usage: boolean;
		};
	};
	comments?: string[];
	final_score: number;
	risk_level: string;
};

export type BusinessProposal = {
	id: string;
	company_name: string;
	logo?: string;
	accepted_token: string;
	total_pooled: string;
	short_description: string;
	full_description: string;
	business_plan: string;
	expected_return: string;
	minimum_investment: string;
	maximum_investment: string;
	proposer_wallet: string;
	proposed_at: string;
	deadline: string;
	status: "active" | "funded" | "expired" | "cancelled";
	current_funding: string;
	target_funding: string;
	investor_count: number;
	website?: string;
	social_media?: SocialMediaLinks;
	documents: Document[];
	wallet_analysis?: Record<string, any>;
	created_at: string;
	updated_at: string;
	tags: string[];
};
