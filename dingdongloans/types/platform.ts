// Types for the lending platform

export type AssetType = {
  symbol: string
  name: string
  icon?: string
  price: string
  apr?: string
  apr?: string
  walletBalance?: string
  available?: string
  collateralFactor?: string
  borrowLimit?: string
  liquidationThreshold?: string
  borrowEnabled?: boolean
  supplyEnabled?: boolean
}

export type ProposalType = {
  id: string
  title: string
  description: string
  proposer: string
  status: "active" | "passed" | "rejected" | "pending"
  votesFor: number
  votesAgainst: number
  startDate: string
  endDate: string
  executionDate?: string
}

export type PoolType = {
  id: string
  name: string
  company: string
  description: string
  tvl: string
  totalBorrowed: string
  utilizationRate: string
  assets: AssetType[]
  proposals: ProposalType[]
  borrowerRequirements?: {
    minCollateral?: string
    kycRequired?: boolean
    whitelistRequired?: boolean
  }
  riskLevel: "low" | "medium" | "high"
  createdAt: string
  logoUrl?: string
}

export type BorrowerType = {
  address: string
  name?: string
  creditScore?: number
  kycVerified: boolean
  whitelisted: boolean
  collateralValue: string
  borrowLimit: string
  eligiblePools: string[] // IDs of pools the borrower is eligible for
}
