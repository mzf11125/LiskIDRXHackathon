"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAccount } from "wagmi"
import { useConnectModal } from "@xellar/kit"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function LoanOverview() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Overview</CardTitle>
          <CardDescription>Connect your wallet to view your loans</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-40">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Please connect your wallet to view your active loans and collateral
          </p>
          <Button
            onClick={openConnectModal}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
          >
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Overview</CardTitle>
        <CardDescription>Your active loans and collateral</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Loan</span>
              <span className="text-sm font-medium">2.5 ETH</span>
            </div>
            <Progress value={65} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Borrowed: 65%</span>
              <span>Max: 3.8 ETH</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Collateral</span>
              <span className="text-sm font-medium">10,000 USDC</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Health Factor: 1.8</span>
              <span className="text-emerald-500">Safe</span>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
