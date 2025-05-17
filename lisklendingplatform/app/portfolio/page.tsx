"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { WalletRiskAnalysis } from "@/components/wallet-risk-analysis"
import { useProposals } from "@/hooks/use-proposals"
import { usePortfolio } from "@/hooks/use-portfolio"
import { ArrowUpRight, ArrowDownRight, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function PortfolioPage() {
  const { isConnected, connect } = useWallet()
  const router = useRouter()
  const { myProposals, fetchMyProposals, isLoading: proposalsLoading } = useProposals()
  const { 
    investments, 
    transactions, 
    fetchInvestments, 
    fetchTransactions,
    isLoadingInvestments, 
    isLoadingTransactions 
  } = usePortfolio()

  useEffect(() => {
    if (isConnected) {
      if (fetchMyProposals) {
        fetchMyProposals()
      }
      fetchInvestments()
      fetchTransactions()
    }
  }, [isConnected, fetchMyProposals, fetchInvestments, fetchTransactions])

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
                  {isLoadingInvestments ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : investments && investments.length > 0 ? (
                    <div className="space-y-4">
                      {investments.map((investment) => (
                        <div key={investment.id} className="bg-slate-800/50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">{investment.poolName}</h3>
                            <Badge variant={investment.status === 'active' ? "outline" : "secondary"}>
                              {investment.status === 'active' ? 'Active' : 'Closed'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <p className="text-xs text-slate-400">Amount</p>
                              <p>{investment.amount} {investment.token}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">APY</p>
                              <p>{investment.apy}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Earned</p>
                              <p className="text-green-400">{investment.earned} {investment.token}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Since</p>
                              <p className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(investment.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-slate-400 text-center mb-4">You don't have any active investments yet.</p>
                      <Button onClick={() => router.push("/lend")} className="web3-button">
                        Browse Investment Opportunities
                      </Button>
                    </div>
                  )}
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
                  {proposalsLoading ? (
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
                  {isLoadingTransactions ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              transaction.type === 'deposit' || transaction.type === 'interest' 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-red-500/20 text-red-500'
                            }`}>
                              {transaction.type === 'deposit' || transaction.type === 'interest' ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium capitalize">{transaction.type}</p>
                              <p className="text-xs text-slate-400">{transaction.poolName || '-'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={transaction.type === 'deposit' || transaction.type === 'interest' ? 'text-green-400' : ''}>
                              {transaction.type === 'withdrawal' || transaction.type === 'repay' ? '-' : '+'}{transaction.amount} {transaction.token}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                              <Clock className="h-3 w-3" />
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-slate-400 text-center">No transactions found.</p>
                    </div>
                  )}
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
