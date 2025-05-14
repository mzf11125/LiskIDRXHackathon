"use client"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import BusinessProposals from "./business-proposals"

export default function LendPage() {
  const { isConnected, connect } = useWallet()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to access the lending features.
        </p>
        <Button onClick={connect} className="web3-button">
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Business Funding</h1>
          <p className="text-slate-400 mt-2">Lend your assets to businesses and earn returns</p>
        </div>
        <Card className="web3-card p-4 flex items-center gap-3 glow-border">
          <AlertCircle className="text-yellow-500 h-5 w-5" />
          <p className="text-sm">Always conduct your own research before investing</p>
        </Card>
      </div>

      <Tabs defaultValue="proposals" className="space-y-8">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="proposals">Business Proposals</TabsTrigger>
          <TabsTrigger value="your-investments">Your Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-6">
          <BusinessProposals />
        </TabsContent>

        <TabsContent value="your-investments">
          <Card className="web3-card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 gradient-text">No Active Investments</h2>
            <p className="text-slate-400 mb-6">
              You haven't invested in any business proposals yet. Browse the available proposals to get started.
            </p>
            <Button onClick={() => document.querySelector('[data-value="proposals"]')?.click()} className="web3-button">
              Browse Proposals
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
