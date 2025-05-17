"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import FlowDiagram from "@/components/flow-diagram"

export default function PortfolioPage() {
  const { isConnected, connect } = useWallet()

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Please connect your wallet to view your portfolio.</p>
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
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-slate-400 mt-2">Track your lending and borrowing positions</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">$0.00</p>
              <p className="text-sm text-slate-400 mb-1">USD</p>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Deposit Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">$0.00</p>
              <p className="text-sm text-slate-400 mb-1">USD</p>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Borrow Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">$0.00</p>
              <p className="text-sm text-slate-400 mb-1">USD</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="space-y-8">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="flow">Flow Diagram</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-6">
          <Card className="web3-card p-8 text-center">
            <CardTitle className="mb-4">No Active Positions</CardTitle>
            <CardDescription className="text-slate-400 mb-6">
              You don't have any active lending or borrowing positions yet.
            </CardDescription>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="web3-button">Deposit Assets</Button>
              <Button variant="outline">Borrow Assets</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="web3-card p-8 text-center">
            <CardTitle className="mb-4">No Transaction History</CardTitle>
            <CardDescription className="text-slate-400 mb-6">
              Your transaction history will appear here once you start using the platform.
            </CardDescription>
          </Card>
        </TabsContent>

        <TabsContent value="flow">
          <FlowDiagram />
        </TabsContent>
      </Tabs>
    </div>
  )
}
