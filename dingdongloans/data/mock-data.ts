import type { PoolType, BorrowerType } from "@/types/platform";

// Define AssetType interface
interface AssetType {
	symbol: string;
	name: string;
	price: string;
	apr: string;
	apr: string;
	walletBalance: string;
	available: string;
	collateralFactor: string;
	borrowEnabled: boolean;
	supplyEnabled: boolean;
}

// Mock data for pools
export const pools: PoolType[] = [
	{
		id: "idrx-main",
		name: "IDRX Main Pool",
		company: "IDRX Foundation",
		description:
			"The main lending pool for IDRX tokens and major cryptocurrencies",
		tvl: "$850M",
		totalBorrowed: "$320M",
		utilizationRate: "37.6%",
		riskLevel: "low",
		createdAt: "2023-01-15",
		logoUrl: "/placeholder.svg?height=100&width=100",
		assets: [
			{
				symbol: "IDRX",
				name: "IDRX Token",
				price: "$1.00",
				apr: "8.2%",
				apr: "10.2%",
				walletBalance: "1000.00",
				available: "100,000,000",
				collateralFactor: "80%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
			{
				symbol: "LSK",
				name: "Lisk",
				price: "$2.50",
				apr: "5.7%",
				apr: "7.7%",
				walletBalance: "50.00",
				available: "25,000,000",
				collateralFactor: "75%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
			{
				symbol: "BTC",
				name: "Bitcoin",
				price: "$60,000.00",
				apr: "3.2%",
				apr: "5.2%",
				walletBalance: "0.05",
				available: "1,000",
				collateralFactor: "70%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
			{
				symbol: "ETH",
				name: "Ethereum",
				price: "$3,000.00",
				apr: "4.5%",
				apr: "6.5%",
				walletBalance: "1.20",
				available: "10,000",
				collateralFactor: "75%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
		],
		proposals: [
			{
				id: "prop-1",
				title: "Add USDC as collateral",
				description:
					"Proposal to add USDC stablecoin as a supported collateral asset",
				proposer: "lsk1234567890abcdef",
				status: "active",
				votesFor: 1200000,
				votesAgainst: 300000,
				startDate: "2023-04-01",
				endDate: "2023-04-15",
			},
			{
				id: "prop-2",
				title: "Increase IDRX collateral factor",
				description:
					"Increase the collateral factor for IDRX from 80% to 85%",
				proposer: "lsk9876543210abcdef",
				status: "passed",
				votesFor: 2500000,
				votesAgainst: 500000,
				startDate: "2023-03-15",
				endDate: "2023-03-30",
				executionDate: "2023-04-02",
			},
		],
	},
	{
		id: "lisk-enterprise",
		name: "Lisk Enterprise Pool",
		company: "Lisk Enterprise Solutions",
		description:
			"Specialized lending pool for enterprise clients with KYC requirements",
		tvl: "$250M",
		totalBorrowed: "$120M",
		utilizationRate: "48.0%",
		riskLevel: "medium",
		createdAt: "2023-02-20",
		logoUrl: "/placeholder.svg?height=100&width=100",
		borrowerRequirements: {
			minCollateral: "$100,000",
			kycRequired: true,
			whitelistRequired: true,
		},
		assets: [
			{
				symbol: "LSK",
				name: "Lisk",
				price: "$2.50",
				apr: "6.5%",
				apr: "8.5%",
				walletBalance: "50.00",
				available: "10,000,000",
				collateralFactor: "80%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
			{
				symbol: "IDRX",
				name: "IDRX Token",
				price: "$1.00",
				apr: "9.0%",
				apr: "11.0%",
				walletBalance: "1000.00",
				available: "50,000,000",
				collateralFactor: "85%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
			{
				symbol: "USDC",
				name: "USD Coin",
				price: "$1.00",
				apr: "7.5%",
				apr: "9.5%",
				walletBalance: "2000.00",
				available: "30,000,000",
				collateralFactor: "90%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
		],
		proposals: [
			{
				id: "prop-e1",
				title: "Enterprise Borrowing Limit Increase",
				description:
					"Increase the maximum borrowing limit for enterprise clients",
				proposer: "lsk5678901234abcdef",
				status: "pending",
				votesFor: 0,
				votesAgainst: 0,
				startDate: "2023-04-10",
				endDate: "2023-04-25",
			},
		],
	},
	{
		id: "defi-alliance",
		name: "DeFi Alliance Pool",
		company: "DeFi Alliance",
		description:
			"Collaborative pool between multiple DeFi protocols with high yields",
		tvl: "$420M",
		totalBorrowed: "$210M",
		utilizationRate: "50.0%",
		riskLevel: "high",
		createdAt: "2023-03-05",
		logoUrl: "/placeholder.svg?height=100&width=100",
		assets: [
			{
				symbol: "ETH",
				name: "Ethereum",
				price: "$3,000.00",
				apr: "5.5%",
				apr: "7.5%",
				walletBalance: "1.20",
				available: "5,000",
				collateralFactor: "70%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
			{
				symbol: "BTC",
				name: "Bitcoin",
				price: "$60,000.00",
				apr: "4.2%",
				apr: "6.2%",
				walletBalance: "0.05",
				available: "500",
				collateralFactor: "65%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
			{
				symbol: "IDRX",
				name: "IDRX Token",
				price: "$1.00",
				apr: "12.0%",
				apr: "15.0%",
				walletBalance: "1000.00",
				available: "20,000,000",
				collateralFactor: "75%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
			{
				symbol: "DAI",
				name: "Dai Stablecoin",
				price: "$1.00",
				apr: "10.5%",
				apr: "13.5%",
				walletBalance: "1500.00",
				available: "15,000,000",
				collateralFactor: "85%",
				borrowEnabled: true,
				supplyEnabled: true,
			},
		],
		proposals: [
			{
				id: "prop-d1",
				title: "Add Compound Integration",
				description:
					"Integrate with Compound protocol for additional yield strategies",
				proposer: "lsk2468013579abcdef",
				status: "active",
				votesFor: 800000,
				votesAgainst: 200000,
				startDate: "2023-03-25",
				endDate: "2023-04-10",
			},
			{
				id: "prop-d2",
				title: "Risk Parameter Adjustment",
				description: "Adjust risk parameters for high-yield assets",
				proposer: "lsk1357924680abcdef",
				status: "rejected",
				votesFor: 500000,
				votesAgainst: 700000,
				startDate: "2023-03-10",
				endDate: "2023-03-25",
			},
		],
	},
];

// Mock data for borrowers
export const borrowers: BorrowerType[] = [
	{
		address: "lsk1234567890abcdefghijklmnopqrstuvwxyz",
		name: "Default User",
		creditScore: 750,
		kycVerified: false,
		whitelisted: false,
		collateralValue: "$0.00",
		borrowLimit: "$0.00",
		eligiblePools: ["idrx-main", "defi-alliance"],
	},
	{
		address: "lsk9876543210abcdefghijklmnopqrstuvwxyz",
		name: "Enterprise Client",
		creditScore: 850,
		kycVerified: true,
		whitelisted: true,
		collateralValue: "$250,000.00",
		borrowLimit: "$200,000.00",
		eligiblePools: ["idrx-main", "lisk-enterprise", "defi-alliance"],
	},
];

// Helper function to get borrower by address
export const getBorrowerByAddress = (
	address: string
): BorrowerType | undefined => {
	return borrowers.find((borrower) => borrower.address === address);
};

// Helper function to get pool by ID
export const getPoolById = (id: string): PoolType | undefined => {
	return pools.find((pool) => pool.id === id);
};

// Helper function to get eligible pools for a borrower
export const getEligiblePoolsForBorrower = (
	borrowerAddress: string
): PoolType[] => {
	const borrower = getBorrowerByAddress(borrowerAddress);
	if (!borrower) return [];

	return pools.filter((pool) => borrower.eligiblePools.includes(pool.id));
};

// Helper function to get available assets for a borrower in a specific pool
export const getAvailableAssetsForBorrower = (
	borrowerAddress: string,
	poolId: string
): AssetType[] => {
	const pool = getPoolById(poolId);
	if (!pool) return [];

	const borrower = getBorrowerByAddress(borrowerAddress);
	if (!borrower) return [];

	// If the borrower is not eligible for this pool, return empty array
	if (!borrower.eligiblePools.includes(poolId)) return [];

	// If the pool requires KYC and the borrower is not verified, disable borrowing
	if (pool.borrowerRequirements?.kycRequired && !borrower.kycVerified) {
		return pool.assets.map((asset) => ({
			...asset,
			borrowEnabled: false,
		}));
	}

	// If the pool requires whitelist and the borrower is not whitelisted, disable borrowing
	if (pool.borrowerRequirements?.whitelistRequired && !borrower.whitelisted) {
		return pool.assets.map((asset) => ({
			...asset,
			borrowEnabled: false,
		}));
	}

	return pool.assets;
};

// Get all pools function
export function getAllPools(): PoolType[] {
	return pools;
}
