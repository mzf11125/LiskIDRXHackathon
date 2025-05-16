"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WalletRiskAnalysis } from "@/components/wallet-risk-analysis"
import { useProposals } from "@/hooks/use-proposals"

export default function PortfolioPage() {
  const { isConnected, connect } = useWallet()
  const router = useRouter()
  const { myProposals, fetchMyProposals, isLoading } = useProposals()

  useEffect(() => {
    if (isConnected) {
      fetchMyProposals()
    }
  }, [isConnected, fetchMyProposals])

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to view your portfolio and investments.
        </p>
        <Button onClick={connect} className="web3-button">
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Your Portfolio</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="investments" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="investments">Investments</TabsTrigger>
              <TabsTrigger value="proposals">My Proposals</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="investments">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Your Investments</CardTitle>
                  <CardDescription>Track your active investments and returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-slate-400 text-center mb-4">You don't have any active investments yet.</p>
                    <Button onClick={() => router.push("/lend")} className="web3-button">
                      Browse Investment Opportunities
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="proposals">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Your Business Proposals</CardTitle>
                  <CardDescription>Manage your submitted business proposals</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : myProposals && myProposals.length > 0 ? (
                    <div className="space-y-4">
                      {myProposals.map((proposal: any) => (
                        <div key={proposal.id} className="bg-slate-800/50 p-4 rounded-lg">
                          <h3 className="font-medium mb-1">{proposal.company_name}</h3>
                          <p className="text-sm text-slate-400 mb-2">{proposal.short_description}</p>
                          <div className="flex justify-between text-xs">
                            <span>
                              Target: {proposal.target_funding} {proposal.accepted_token}
                            </span>
                            <span>Deadline: {new Date(proposal.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-slate-400 text-center mb-4">You haven't created any business proposals yet.</p>
                      <Button onClick={() => router.push("/borrow")} className="web3-button">
                        Create a Business Proposal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="transactions">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-slate-400 text-center">No transactions found.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <WalletRiskAnalysis />
        </div>
      </div>
    </div>
  )
}
