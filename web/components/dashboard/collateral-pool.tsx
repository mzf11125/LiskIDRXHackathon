"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccount } from "wagmi"
import { useConnectModal } from "@xellar/kit"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

export function CollateralPool() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collateral Pool</CardTitle>
          <CardDescription>Community-based collateral pools</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-40">
          <p className="text-sm text-muted-foreground text-center mb-4">Connect your wallet to view available pools</p>
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
        <CardTitle>Collateral Pool</CardTitle>
        <CardDescription>Community-based collateral pools</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-600"
                >
                  Active
                </Badge>
                <span className="text-sm font-medium">ETH Pool #3</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>42 members</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pool Size</span>
              <span>120.5 ETH</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Your Contribution</span>
              <span>2.5 ETH</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">APY for Lenders</span>
              <span className="text-emerald-500">4.2%</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            <p>
              Community pools combine collateral from multiple users to provide better rates and reduced risk for all
              participants.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
