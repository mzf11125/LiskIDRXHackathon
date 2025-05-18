import type { LendingOpportunity } from "@/types/lending"

export const lendingOpportunities: LendingOpportunity[] = [
  {
    id: "lend-001",
    title: "IDRX Stablecoin Lending Pool",
    description:
      "Provide liquidity to the IDRX stablecoin pool and earn competitive interest rates with minimal risk. This pool is used to facilitate stablecoin transactions across the Lisk ecosystem.",
    asset: {
      symbol: "IDRX",
      name: "IDRX Stablecoin",
      icon: "/placeholder.svg?height=40&width=40",
    },
    interestRate: "8.5%",
    apy: "8.7%",
    duration: "Flexible",
    totalAvailable: "5,000,000 IDRX",
    minLendAmount: "100 IDRX",
    maxLendAmount: "500,000 IDRX",
    collateralRequired: false,
    riskLevel: "low",
    status: "active",
    createdAt: "2025-01-15T00:00:00Z",
    expiresAt: "2025-12-31T23:59:59Z",
    lenderProfile: {
      id: "lender-001",
      name: "Lisk Foundation",
      address: "lsk5fr4jbm8srgg9e5qzuvsrxjq4zzm3e34n8respx",
      avatar: "/placeholder.svg?height=100&width=100",
      verificationStatus: "verified",
      joinedDate: "2023-01-01T00:00:00Z",
      totalLent: "25,000,000 IDRX",
      successfulLoans: 1250,
      defaultRate: "0.05%",
      rating: 4.9,
      description:
        "The Lisk Foundation is a non-profit organization dedicated to supporting the Lisk blockchain ecosystem and its community.",
      socialLinks: {
        website: "https://lisk.com",
        twitter: "https://twitter.com/LiskHQ",
        telegram: "https://t.me/Lisk_HQ",
        discord: "https://discord.gg/lisk",
      },
    },
    borrowersCount: 320,
    totalBorrowed: "3,750,000 IDRX",
    utilizationRate: "75%",
    lendersCount: 450,
    termsAndConditions: [
      "Lenders can withdraw their funds at any time, subject to liquidity availability.",
      "Interest is calculated daily and distributed weekly.",
      "The interest rate may fluctuate based on market conditions and utilization rate.",
      "A 0.1% fee is charged on interest earned to maintain the platform.",
      "In case of default, losses are socialized across all lenders proportionally.",
    ],
    faq: [
      {
        question: "How is the interest calculated?",
        answer:
          "Interest is calculated daily based on your contribution to the pool and the current utilization rate. The formula used is: Principal × Daily Interest Rate × Utilization Factor.",
      },
      {
        question: "Can I withdraw my funds at any time?",
        answer:
          "Yes, you can withdraw your funds at any time, subject to liquidity availability in the pool. During periods of high utilization, there might be a short waiting period.",
      },
      {
        question: "What happens if a borrower defaults?",
        answer:
          "In the rare case of default, the loss is socialized across all lenders proportionally to their contribution to the pool. The Lisk Foundation maintains a security fund to mitigate potential losses.",
      },
    ],
  },
  {
    id: "lend-002",
    title: "LSK Token Lending Pool",
    description:
      "Provide LSK tokens to the ecosystem and earn attractive returns. This pool is used for various DeFi applications and governance activities within the Lisk network.",
    asset: {
      symbol: "LSK",
      name: "Lisk Token",
      icon: "/placeholder.svg?height=40&width=40",
    },
    interestRate: "6.2%",
    apy: "6.4%",
    duration: "30-day lock",
    totalAvailable: "250,000 LSK",
    minLendAmount: "10 LSK",
    maxLendAmount: "50,000 LSK",
    collateralRequired: false,
    riskLevel: "medium",
    status: "active",
    createdAt: "2025-02-10T00:00:00Z",
    expiresAt: "2025-12-31T23:59:59Z",
    lenderProfile: {
      id: "lender-002",
      name: "Lisk Capital",
      address: "lsk8mf669675hpzz2fkthsg4tz1x8xmtfgzz95ra9w",
      avatar: "/placeholder.svg?height=100&width=100",
      verificationStatus: "verified",
      joinedDate: "2023-03-15T00:00:00Z",
      totalLent: "1,500,000 LSK",
      successfulLoans: 850,
      defaultRate: "0.8%",
      rating: 4.7,
      description:
        "Lisk Capital is a decentralized lending protocol focused on providing liquidity to the Lisk ecosystem.",
      socialLinks: {
        website: "https://liskcapital.io",
        twitter: "https://twitter.com/LiskCapital",
      },
    },
    borrowersCount: 180,
    totalBorrowed: "175,000 LSK",
    utilizationRate: "70%",
    lendersCount: 320,
    termsAndConditions: [
      "Funds are locked for a minimum period of 30 days.",
      "Early withdrawal is subject to a 2% fee on the principal amount.",
      "Interest is calculated daily and distributed at the end of the lock period.",
      "The interest rate is fixed for the duration of the lock period.",
      "A 0.2% fee is charged on interest earned to maintain the platform.",
    ],
    faq: [
      {
        question: "What happens after the 30-day lock period?",
        answer:
          "After the 30-day lock period, your funds will automatically be available for withdrawal. You can choose to withdraw or continue lending, in which case a new 30-day lock period will begin.",
      },
      {
        question: "Can I add more funds to my existing lending position?",
        answer:
          "Yes, you can add more funds to your existing position, but this will reset the 30-day lock period for your entire position.",
      },
      {
        question: "How is the interest rate determined?",
        answer:
          "The interest rate is determined by market demand for LSK tokens and the current utilization rate of the pool. It is fixed for the duration of your lock period.",
      },
    ],
  },
  {
    id: "lend-003",
    title: "BTC Lending Opportunity",
    description:
      "Lend your Bitcoin to earn passive income. This pool provides liquidity for cross-chain operations and DeFi applications that require BTC.",
    asset: {
      symbol: "BTC",
      name: "Bitcoin",
      icon: "/placeholder.svg?height=40&width=40",
    },
    interestRate: "3.8%",
    apy: "3.9%",
    duration: "90-day lock",
    totalAvailable: "150 BTC",
    minLendAmount: "0.01 BTC",
    maxLendAmount: "10 BTC",
    collateralRequired: false,
    riskLevel: "low",
    status: "active",
    createdAt: "2025-03-05T00:00:00Z",
    expiresAt: "2025-12-31T23:59:59Z",
    lenderProfile: {
      id: "lender-003",
      name: "Lisk Bridge",
      address: "lsk7z8zknvqrsxdmwjsxfm9f9w22k7gadxf9x3vhw",
      avatar: "/placeholder.svg?height=100&width=100",
      verificationStatus: "verified",
      joinedDate: "2023-05-20T00:00:00Z",
      totalLent: "450 BTC",
      successfulLoans: 620,
      defaultRate: "0.02%",
      rating: 4.95,
      description:
        "Lisk Bridge is a cross-chain protocol that enables seamless asset transfers between Lisk and other blockchain networks.",
      socialLinks: {
        website: "https://liskbridge.io",
        twitter: "https://twitter.com/LiskBridge",
        discord: "https://discord.gg/liskbridge",
      },
    },
    borrowersCount: 95,
    totalBorrowed: "120 BTC",
    utilizationRate: "80%",
    lendersCount: 210,
    termsAndConditions: [
      "Funds are locked for a minimum period of 90 days.",
      "Early withdrawal is subject to a 3% fee on the principal amount.",
      "Interest is calculated daily and distributed at the end of the lock period.",
      "The interest rate is fixed for the duration of the lock period.",
      "A 0.15% fee is charged on interest earned to maintain the platform.",
      "All BTC operations are secured by multi-signature wallets and cold storage.",
    ],
    faq: [
      {
        question: "How is my BTC secured?",
        answer:
          "Your BTC is secured using industry-standard security practices, including multi-signature wallets, cold storage, and regular security audits. Additionally, all BTC holdings are insured against theft and hacking.",
      },
      {
        question: "What happens if I want to withdraw before the 90-day period?",
        answer:
          "Early withdrawals are subject to a 3% fee on the principal amount. This fee helps maintain the stability of the pool and compensates other lenders for the disruption.",
      },
      {
        question: "Can I use my lent BTC as collateral for other loans?",
        answer:
          "Yes, you can use your lent BTC as collateral for other loans on the platform. This feature allows you to maintain your earning position while accessing liquidity when needed.",
      },
    ],
  },
]

export const getLendingOpportunityById = (id: string): LendingOpportunity | undefined => {
  return lendingOpportunities.find((opportunity) => opportunity.id === id)
}
