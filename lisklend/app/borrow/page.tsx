"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  PlusCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Calendar,
  Wallet,
  AlertCircle,
  DollarSign,
  Lock,
  Percent,
  ChevronRight,
  BarChart3,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useWallet } from "@/components/wallet-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { businessProposals } from "@/data/business-proposals"
import CreateProposalForm from "./create-proposal-form"
import { pools } from "@/data/mock-data"
import BorrowCryptoForm from "./borrow-crypto-form"

export default function BorrowPage() {
  const { isConnected, connect, address } = useWallet()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false)

  // Filter proposals to only show those from the current user
  // In a real app, this would come from an API call
  const userProposals = businessProposals.filter(
    (proposal) => isConnected && address && proposal.proposerWallet === address,
  )

  // Filter proposals based on search term
  const filteredProposals = userProposals.filter(
    (proposal) =>
      proposal.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.acceptedToken.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to access the borrowing features.
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
          <h1 className="text-3xl font-bold gradient-text">Borrow</h1>
          <p className="text-slate-400 mt-2">Borrow crypto assets or create business funding proposals</p>
        </div>
        <div className="flex gap-3">
          <Card className="web3-card p-4 flex items-center gap-3">
            <AlertCircle className="text-yellow-500 h-5 w-5" />
            <p className="text-sm">
              Your wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="crypto" className="space-y-8">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="crypto">Borrow Crypto</TabsTrigger>
          <TabsTrigger value="proposals">Business Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="web3-card col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="gradient-text">Borrow Crypto with Collateral</CardTitle>
                <CardDescription>
                  Borrow cryptocurrency by providing collateral assets. Monitor your positions and manage your risk.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" /> Available to Borrow
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold gradient-text">$25,000.00</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center">
                        <Lock className="h-4 w-4 mr-1" /> Your Collateral
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold gradient-text">$10,000.00</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center">
                        <Percent className="h-4 w-4 mr-1" /> Current Ratio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold gradient-text">200%</div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 gradient-text">Your Active Loans</h3>
                  {[1, 2].map((index) => (
                    <Card key={index} className="bg-slate-800 border-slate-700 mb-4">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                              <Image src={`/placeholder.svg?height=40&width=40`} alt="BTC" width={40} height={40} />
                            </div>
                            <div>
                              <div className="font-medium">{index === 1 ? "2.5 BTC" : "50 ETH"}</div>
                              <div className="text-sm text-slate-400">
                                Borrowed on {index === 1 ? "May 10, 2025" : "April 25, 2025"}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-slate-400">Collateral</div>
                              <div className="font-medium">{index === 1 ? "100,000 IDRX" : "75 BTC"}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400">Interest Rate</div>
                              <div className="font-medium">{index === 1 ? "3.5%" : "2.8%"} APR</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400">Health</div>
                              <div className="font-medium text-green-500">Healthy</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600">
                              Manage <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="web3-button">
                        <DollarSign className="mr-2 h-4 w-4" /> Borrow Crypto
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="web3-card sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
                      style={{ position: "fixed" }}
                    >
                      <DialogHeader>
                        <DialogTitle className="gradient-text text-xl">Borrow Cryptocurrency</DialogTitle>
                        <DialogDescription>
                          Borrow crypto assets by providing collateral. Monitor your health factor to avoid liquidation.
                        </DialogDescription>
                      </DialogHeader>
                      <BorrowCryptoForm onSuccess={() => setIsBorrowDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="bg-slate-800 border-slate-700">
                    <BarChart3 className="mr-2 h-4 w-4" /> View Analytics
                  </Button>

                  <Button variant="outline" className="bg-slate-800 border-slate-700">
                    <FileText className="mr-2 h-4 w-4" /> Loan History
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="web3-card">
              <CardHeader>
                <CardTitle className="gradient-text">Borrowing Markets</CardTitle>
                <CardDescription>Available assets for borrowing with current rates and liquidity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pools[0].assets.map((asset) => (
                  <div key={asset.symbol} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <Image src={`/placeholder.svg?height=32&width=32`} alt={asset.symbol} width={32} height={32} />
                      </div>
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-xs text-slate-400">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{asset.apr}</div>
                      <div className="text-xs text-slate-400">Variable APR</div>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link href="/markets" className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                    View all markets <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 w-full"
              />
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="web3-button">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Proposal
                </Button>
              </DialogTrigger>
              <DialogContent
                className="web3-card sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
                style={{ position: "fixed" }}
              >
                <DialogHeader>
                  <DialogTitle className="gradient-text text-xl">Create Business Proposal</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to create a new business proposal for funding.
                  </DialogDescription>
                </DialogHeader>
                <CreateProposalForm onSuccess={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="active" className="space-y-8">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="active">Active Proposals</TabsTrigger>
              <TabsTrigger value="funded">Funded Proposals</TabsTrigger>
              <TabsTrigger value="expired">Expired/Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {filteredProposals.filter((p) => p.status === "active").length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProposals
                    .filter((p) => p.status === "active")
                    .map((proposal) => (
                      <Card
                        key={proposal.id}
                        className="web3-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                      >
                        <CardHeader className="pb-2 relative">
                          <div className="absolute top-3 right-3">
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/50">
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                              {proposal.logo ? (
                                <Image
                                  src={proposal.logo || "/placeholder.svg"}
                                  alt={proposal.companyName}
                                  width={48}
                                  height={48}
                                />
                              ) : (
                                <div className="text-2xl font-bold">{proposal.companyName.charAt(0)}</div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg gradient-text">{proposal.companyName}</CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> Requesting {proposal.acceptedToken}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-300 mb-4">{proposal.shortDescription}</p>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <TrendingUp className="h-3 w-3" /> Return
                              </div>
                              <p className="text-sm font-medium gradient-text">{proposal.expectedReturn}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <Calendar className="h-3 w-3" /> Duration
                              </div>
                              <p className="text-sm font-medium">{proposal.duration}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <Wallet className="h-3 w-3" /> Target
                              </div>
                              <p className="text-sm font-medium">{proposal.targetFunding}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Funding Progress</span>
                              <span>
                                {(
                                  (Number.parseFloat(proposal.currentFunding.replace(/[^0-9.-]+/g, "")) /
                                    Number.parseFloat(proposal.targetFunding.replace(/[^0-9.-]+/g, ""))) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                (Number.parseFloat(proposal.currentFunding.replace(/[^0-9.-]+/g, "")) /
                                  Number.parseFloat(proposal.targetFunding.replace(/[^0-9.-]+/g, ""))) *
                                100
                              }
                              className="h-1.5 bg-slate-800"
                            />
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>
                                {proposal.currentFunding} / {proposal.targetFunding}
                              </span>
                              <span>{proposal.investorCount} investors</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/borrow/${proposal.id}`} className="w-full">
                            <Button className="w-full web3-button group">
                              View Details{" "}
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card className="web3-card p-8 text-center">
                  <CardTitle className="mb-4 gradient-text">No Active Proposals</CardTitle>
                  <CardDescription className="text-slate-400 mb-6">
                    {searchTerm
                      ? "No proposals match your search criteria. Try adjusting your search."
                      : "You don't have any active business proposals. Create a new proposal to get started."}
                  </CardDescription>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="web3-button">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Proposal
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="funded" className="space-y-6">
              {filteredProposals.filter((p) => p.status === "funded").length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProposals
                    .filter((p) => p.status === "funded")
                    .map((proposal) => (
                      <Card
                        key={proposal.id}
                        className="web3-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                      >
                        <CardHeader className="pb-2 relative">
                          <div className="absolute top-3 right-3">
                            <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                              Funded
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                              {proposal.logo ? (
                                <Image
                                  src={proposal.logo || "/placeholder.svg"}
                                  alt={proposal.companyName}
                                  width={48}
                                  height={48}
                                />
                              ) : (
                                <div className="text-2xl font-bold">{proposal.companyName.charAt(0)}</div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg gradient-text">{proposal.companyName}</CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> Funded with {proposal.acceptedToken}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-300 mb-4">{proposal.shortDescription}</p>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <TrendingUp className="h-3 w-3" /> Return
                              </div>
                              <p className="text-sm font-medium gradient-text">{proposal.expectedReturn}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <Calendar className="h-3 w-3" /> Duration
                              </div>
                              <p className="text-sm font-medium">{proposal.duration}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <Wallet className="h-3 w-3" /> Raised
                              </div>
                              <p className="text-sm font-medium">{proposal.targetFunding}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Progress value={100} className="h-1.5 bg-slate-800" />
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>Fully Funded</span>
                              <span>{proposal.investorCount} investors</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/borrow/${proposal.id}`} className="w-full">
                            <Button className="w-full web3-button group">
                              View Details{" "}
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card className="web3-card p-8 text-center">
                  <CardTitle className="mb-4 gradient-text">No Funded Proposals</CardTitle>
                  <CardDescription className="text-slate-400 mb-6">
                    You don't have any funded business proposals yet.
                  </CardDescription>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="web3-button">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Proposal
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="expired" className="space-y-6">
              {filteredProposals.filter((p) => p.status === "expired" || p.status === "cancelled").length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProposals
                    .filter((p) => p.status === "expired" || p.status === "cancelled")
                    .map((proposal) => (
                      <Card
                        key={proposal.id}
                        className="web3-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                      >
                        <CardHeader className="pb-2 relative">
                          <div className="absolute top-3 right-3">
                            <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50">
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                              {proposal.logo ? (
                                <Image
                                  src={proposal.logo || "/placeholder.svg"}
                                  alt={proposal.companyName}
                                  width={48}
                                  height={48}
                                />
                              ) : (
                                <div className="text-2xl font-bold">{proposal.companyName.charAt(0)}</div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg gradient-text">{proposal.companyName}</CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> Requested {proposal.acceptedToken}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-300 mb-4">{proposal.shortDescription}</p>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <TrendingUp className="h-3 w-3" /> Return
                              </div>
                              <p className="text-sm font-medium gradient-text">{proposal.expectedReturn}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <Calendar className="h-3 w-3" /> Duration
                              </div>
                              <p className="text-sm font-medium">{proposal.duration}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <Wallet className="h-3 w-3" /> Target
                              </div>
                              <p className="text-sm font-medium">{proposal.targetFunding}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Progress
                              value={
                                (Number.parseFloat(proposal.currentFunding.replace(/[^0-9.-]+/g, "")) /
                                  Number.parseFloat(proposal.targetFunding.replace(/[^0-9.-]+/g, ""))) *
                                100
                              }
                              className="h-1.5 bg-slate-800"
                            />
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>
                                {proposal.currentFunding} / {proposal.targetFunding}
                              </span>
                              <span>{proposal.investorCount} investors</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/borrow/${proposal.id}`} className="w-full">
                            <Button className="w-full web3-button group">
                              View Details{" "}
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card className="web3-card p-8 text-center">
                  <CardTitle className="mb-4 gradient-text">No Expired or Cancelled Proposals</CardTitle>
                  <CardDescription className="text-slate-400 mb-6">
                    You don't have any expired or cancelled business proposals.
                  </CardDescription>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="web3-button">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Proposal
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
