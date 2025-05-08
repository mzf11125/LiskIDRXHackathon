import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { LoanOverview } from "@/components/dashboard/loan-overview"
import { AssetSelector } from "@/components/dashboard/asset-selector"
import { CollateralPool } from "@/components/dashboard/collateral-pool"
import { LoanCalculator } from "@/components/dashboard/loan-calculator"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | DeFi Lending Platform",
  description: "Manage your loans and collateral on our decentralized lending platform",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage your loans and collateral" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <LoanOverview />
        <AssetSelector />
        <CollateralPool />
      </div>
      <div className="mt-6">
        <LoanCalculator />
      </div>
    </DashboardShell>
  )
}
