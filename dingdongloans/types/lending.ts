export type LenderProfile = {
  id: string
  name: string
  address: string
  avatar?: string
  verificationStatus: "verified" | "unverified"
  joinedDate: string
  totalLent: string
  successfulLoans: number
  defaultRate: string
  rating: number
  description?: string
  socialLinks?: {
    website?: string
    twitter?: string
    telegram?: string
    discord?: string
  }
}

export type LendingOpportunity = {
  id: string
  title: string
  description: string
  asset: {
    symbol: string
    name: string
    icon?: string
  }
  interestRate: string
  apr: string
  duration: string
  totalAvailable: string
  minLendAmount: string
  maxLendAmount: string
  collateralRequired: boolean
  collateralRatio?: string
  collateralAssets?: string[]
  riskLevel: "low" | "medium" | "high"
  status: "active" | "filled" | "completed" | "defaulted"
  createdAt: string
  expiresAt: string
  lenderProfile: LenderProfile
  borrowersCount: number
  totalBorrowed: string
  utilizationRate: string
  lendersCount: number
  termsAndConditions: string[]
  faq: Array<{
    question: string
    answer: string
  }>
}
