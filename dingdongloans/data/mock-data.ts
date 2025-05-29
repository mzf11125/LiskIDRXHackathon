import type { PoolType, BorrowerType, SupplyTransactionType, UserSupplyType } from "@/types/platform";

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
				supplyApr: "6.5%",
				walletBalance: "1000.00",
				available: "100,000,000",
				supplied: "75,000,000",
				collateralFactor: "80%",
				supplyEnabled: true,
				borrowEnabled: true,
			},
			{
				symbol: "LSK",
				name: "Lisk",
				price: "$2.50",
				apr: "5.7%",
				supplyApr: "4.2%",
				walletBalance: "50.00",
				available: "25,000,000",
				supplied: "18,750,000",
				collateralFactor: "75%",
				supplyEnabled: true,
				borrowEnabled: true,
			},
			{
				symbol: "BTC",
				name: "Bitcoin",
				price: "$60,000.00",
				apr: "3.2%",
				supplyApr: "2.1%",
				walletBalance: "0.05",
				available: "1,000",
				supplied: "750",
				collateralFactor: "70%",
				supplyEnabled: true,
				borrowEnabled: true,
			},
			{
				symbol: "ETH",
				name: "Ethereum",
				price: "$3,000.00",
				apr: "4.5%",
				supplyApr: "3.1%",
				walletBalance: "1.20",
				available: "10,000",
				supplied: "7,500",
				collateralFactor: "75%",
				supplyEnabled: true,
				borrowEnabled: true,
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
				supplyApr: "5.0%",
				walletBalance: "50.00",
				available: "10,000,000",
				supplied: "8,000,000",
				collateralFactor: "80%",
				supplyEnabled: true,
				borrowEnabled: true,
			},
			{
				symbol: "IDRX",
				name: "IDRX Token",
				price: "$1.00",
				apr: "9.0%",
				supplyApr: "7.5%",
				walletBalance: "1000.00",
				available: "50,000,000",
				supplied: "42,500,000",
				collateralFactor: "85%",
				supplyEnabled: true,
				borrowEnabled: true,
			},
			{
				symbol: "USDC",
				name: "USD Coin",
				price: "$1.00",
				apr: "7.5%",
				supplyApr: "6.0%",
				walletBalance: "2000.00",
				available: "30,000,000",
				supplied: "25,000,000",
				collateralFactor: "90%",
				supplyEnabled: true,
				borrowEnabled: true,
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
				supplyApr: "4.0%",
				walletBalance: "1.20",
				available: "5,000",
				supplied: "3,750",
				collateralFactor: "70%",
				supplyEnabled: true,
				borrowEnabled: true,
			},
			{
				symbol: "BTC",
				name: "Bitcoin",
				price: "$60,000.00",
				apr: "4.2%",
				supplyApr: "3.0%",
				walletBalance: "0.05",
				available: "500",
				supplied: "375",
				collateralFactor: "65%",
				supplyEnabled: true,
				borrowEnabled: true,
			},
			{
				symbol: "IDRX",
				name: "IDRX Token",
				price: "$1.00",
				apr: "12.0%",
				supplyApr: "10.0%",
				walletBalance: "1000.00",
				available: "20,000,000",
				supplied: "15,000,000",
				collateralFactor: "75%",
				supplyEnabled: true,
				borrowEnabled: true,
			},
			{
				symbol: "DAI",
				name: "Dai Stablecoin",
				price: "$1.00",
				apr: "10.5%",
				supplyApr: "8.0%",
				walletBalance: "1500.00",
				available: "15,000,000",
				supplied: "12,000,000",
				collateralFactor: "85%",
				supplyEnabled: true,
				borrowEnabled: true,
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

// Mock user supplies
export const userSupplies: UserSupplyType[] = [
	{
		poolId: "idrx-main",
		asset: "IDRX",
		suppliedAmount: "5000.00",
		earnedInterest: "325.00",
		currentApr: "6.5%",
		canWithdraw: true,
	},
	{
		poolId: "idrx-main",
		asset: "LSK",
		suppliedAmount: "100.00",
		earnedInterest: "4.20",
		currentApr: "4.2%",
		canWithdraw: true,
	},
];

// Mock supply transactions
export const supplyTransactions: SupplyTransactionType[] = [
	{
		id: "supply-1",
		poolId: "idrx-main",
		asset: "IDRX",
		amount: "5000.00",
		supplyApr: "6.5%",
		timestamp: "2024-01-15T10:30:00Z",
		txHash: "0x1234567890abcdef",
		status: "completed",
	},
];

// User deposit/supply positions
export const userDeposits = [
	{
		id: "dep-001",
		asset: "IDRX",
		amount: "5000.00",
		value: "$5000.00",
		apy: "8.2%",
		earnedInterest: "42.50",
		depositDate: "2024-01-15",
		canWithdraw: true,
	},
	{
		id: "dep-002",
		asset: "LSK",
		amount: "200.00",
		value: "$500.00",
		apy: "5.7%",
		earnedInterest: "5.75",
		depositDate: "2024-01-20",
		canWithdraw: true,
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

// Helper function to get user supplies for a pool
export const getUserSuppliesForPool = (poolId: string): UserSupplyType[] => {
	return userSupplies.filter((supply) => supply.poolId === poolId);
};

// Helper function to get total supplied by user across all pools
export const getTotalUserSupplies = (): UserSupplyType[] => {
	return userSupplies;
};

// Helper function to get user deposits
export const getUserDeposits = () => {
	return userDeposits;
};

// Helper function to add a deposit (simulation)
export const addUserDeposit = (deposit: {
	asset: string;
	amount: string;
	apy: string;
}) => {
	const newDeposit = {
		id: `dep-${Date.now()}`,
		asset: deposit.asset,
		amount: deposit.amount,
		value: `$${(parseFloat(deposit.amount) * 1).toFixed(2)}`, // Simplified USD conversion
		apy: deposit.apy,
		earnedInterest: "0.00",
		depositDate: new Date().toISOString().split("T")[0],
		canWithdraw: true,
	};

	userDeposits.push(newDeposit);
	return newDeposit;
};

// Get all pools function
export function getAllPools(): PoolType[] {
	return pools;
}
