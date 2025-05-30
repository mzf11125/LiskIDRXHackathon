import type {
  PoolType,
  BorrowerType,
  SupplyTransactionType,
  UserSupplyType,
} from "@/types/platform";

import { defaultConfig } from "@xellar/kit";
import { liskSepolia } from "viem/chains";
import type { Config } from "wagmi";

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
        walletBalance: "1000.00",
        tokenAddress: "0xfD498EF2a4A07189c715f43BA1Af8429C3af9B4d",
        available: "100,000,000",
        supplied: "75,000,000",
        collateralFactor: "80%",
        supplyEnabled: true,
        borrowEnabled: true, // Only IDRX can be borrowed
        units: 2,
      },
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: "$60,000.00",
        apr: "3.2%",
        tokenAddress: " 0xC4f88D43C0f9426E1De9CC6380d87a458Bb239b6",
        walletBalance: "0.05",
        available: "1,000",
        supplied: "750",
        collateralFactor: "70%",
        supplyEnabled: true,
        borrowEnabled: false, // Can only be used as collateral
        units: 8,
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        price: "$3,000.00",
        apr: "4.5%",
        tokenAddress: "0x07BFd7D84aB09e0A6DB8307E906F4edEaAC9a70c",
        walletBalance: "1.20",
        available: "10,000",
        supplied: "7,500",
        collateralFactor: "75%",
        supplyEnabled: true,
        borrowEnabled: false, // Can only be used as collateral
        units: 18,
      },
      {
        symbol: "USDT",
        name: "Tether",
        price: "$1.00",
        apr: "8.0%",
        walletBalance: "5000.00",
        tokenAddress: "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda",
        available: "50,000,000",
        supplied: "35,000,000",
        collateralFactor: "85%",
        supplyEnabled: true,
        borrowEnabled: false, // Can only be used as collateral
        units: 18,
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
        description: "Increase the collateral factor for IDRX from 80% to 85%",
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

export const contractAddress = "0x1C5025C66FC6d8F36f48cac97Ea5120A61ba8EA5";

export const config = defaultConfig({
  appName: "Ding Dong Loans", // You can customize your app name
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  xellarAppId: process.env.NEXT_PUBLIC_XELLAR_APP_ID || "",
  xellarEnv: "sandbox", // Or "production"
  ssr: true, // Required for Next.js App Router
  syncConnectedChain: false,
  chains: [liskSepolia], // Add your desired chains here
}) as Config;
