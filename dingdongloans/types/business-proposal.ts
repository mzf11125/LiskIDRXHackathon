export type BusinessDocument = {
  id: string
  title: string
  type: "pdf" | "image" | "spreadsheet" | "presentation" | "contract"
  url: string
  uploadedAt: string
  size: string
}

export type WalletAnalysis = {
  trustScore: number // 0-100
  activityLevel: "high" | "medium" | "low"
  accountAge: string
  previousProposals: number
  successfulProposals: number
  riskLevel: "low" | "medium" | "high"
  verificationStatus: "verified" | "unverified"
  comments: string[]
}

export type BusinessProposal = {
  id: string
  companyName: string
  logo?: string
  acceptedToken: string
  totalPooled: string
  shortDescription: string
  fullDescription: string
  businessPlan: string
  expectedReturn: string
  duration: string
  minimumInvestment: string
  maximumInvestment: string
  proposerWallet: string
  proposedAt: string
  deadline: string
  status: "active" | "funded" | "expired" | "cancelled"
  currentFunding: string
  targetFunding: string
  investorCount: number
  walletAnalysis: WalletAnalysis
  documents: BusinessDocument[]
  tags: string[]
  website?: string
  socialMedia?: {
    twitter?: string
    linkedin?: string
    telegram?: string
  }
}
