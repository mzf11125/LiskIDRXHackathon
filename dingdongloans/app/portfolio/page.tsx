"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, TrendingUp, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import DepositAssetForm from "@/components/deposit-asset-form"
import FlowDiagram from "@/components/flow-diagram"
import { getUserDeposits } from "@/data/mock-data"

export default function PortfolioPage() {
  const { isConnected, connect } = useWallet()
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)

  // Get user deposits
  const userDeposits = getUserDeposits()
  const totalDepositValue = userDeposits.reduce((sum, deposit) => {
    return sum + parseFloat(deposit.value.replace('$', '').replace(',', ''))
  }, 0)

  const totalEarnings = userDeposits.reduce((sum, deposit) => {
    return sum + parseFloat(deposit.earnedInterest)
  }, 0)

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

  const handleDepositSuccess = () => {
    setIsDepositDialogOpen(false)
    // In a real app, you would refresh the deposits data here
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-slate-400 mt-2">Track your lending and borrowing positions</p>
        </div>
        <Button onClick={() => setIsDepositDialogOpen(true)} className="web3-button">
          <Plus className="mr-2 h-4 w-4" />
          Deposit Assets
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Deposit Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">${totalDepositValue.toFixed(2)}</p>
              <p className="text-sm text-slate-400 mb-1">USD</p>
            </div>
            <p className="text-sm text-green-500 mt-1">+${totalEarnings.toFixed(2)} earned</p>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Debt</CardTitle>
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
            <CardTitle className="text-lg">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">${totalDepositValue.toFixed(2)}</p>
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
          {userDeposits.length > 0 ? (
            <>
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-green-500" />
                    Deposit Positions
                  </CardTitle>
                  <CardDescription>
                    Your active deposit positions earning interest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userDeposits.map((deposit) => (
                      <div key={deposit.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                            {deposit.asset.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{deposit.asset}</p>
                            <p className="text-sm text-slate-400">
                              Deposited on {new Date(deposit.depositDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{deposit.amount} {deposit.asset}</p>
                          <p className="text-sm text-slate-400">{deposit.value}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-primary">{deposit.apy}</p>
                          <p className="text-sm text-slate-400">APY</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500">+{deposit.earnedInterest}</p>
                          <p className="text-sm text-slate-400">Earned</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" disabled={!deposit.canWithdraw}>
                            Withdraw
                          </Button>
                          <Button size="sm" onClick={() => setIsDepositDialogOpen(true)} className="web3-button">
                            Deposit More
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="web3-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownLeft className="h-5 w-5 text-orange-500" />
                    Borrowing Positions
                  </CardTitle>
                  <CardDescription>
                    Your active borrowing positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <WalletIcon className="h-12 w-12 text-slate-400" />
                    </div>
                    <p className="text-slate-400 mb-4">You don't have any active borrowing positions yet.</p>
                    <Button variant="outline">
                      Start Borrowing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="web3-card p-8 text-center">
              <CardTitle className="mb-4">No Active Positions</CardTitle>
              <CardDescription className="text-slate-400 mb-6">
                You don't have any active lending or borrowing positions yet.
              </CardDescription>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={() => setIsDepositDialogOpen(true)} className="web3-button">
                  Deposit Assets
                </Button>
                <Button variant="outline">Borrow Assets</Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="web3-card">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                All your deposit, withdrawal, and borrowing transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userDeposits.length > 0 ? (
                <div className="space-y-3">
                  {userDeposits.map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Deposit {deposit.asset}</p>
                          <p className="text-sm text-slate-400">{deposit.depositDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">+{deposit.amount} {deposit.asset}</p>
                        <p className="text-sm text-slate-400">{deposit.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CardTitle className="mb-4">No Transaction History</CardTitle>
                  <CardDescription className="text-slate-400 mb-6">
                    Your transaction history will appear here once you start using the platform.
                  </CardDescription>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow">
          <FlowDiagram />
        </TabsContent>
      </Tabs>

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent 
          className="web3-card sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          style={{ position: "fixed" }}
        >
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">
              Deposit Assets
            </DialogTitle>
            <DialogDescription>
              Deposit assets to earn interest and use them as collateral for borrowing.
            </DialogDescription>
          </DialogHeader>
          <DepositAssetForm onSuccess={handleDepositSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
