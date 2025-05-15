"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search, Info, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { pools, getEligiblePoolsForBorrower } from "@/data/mock-data"

export default function PoolsPage() {
  const { isConnected, connect, address } = useWallet()
  const [searchTerm, setSearchTerm] = useState("")

  // Filter pools based on search term
  const filteredPools = pools.filter(
    (pool) =>
      pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get eligible pools for the connected wallet
  const eligiblePools = isConnected && address ? getEligiblePoolsForBorrower(address) : []
  const eligiblePoolIds = eligiblePools.map((pool) => pool.id)

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to view and interact with lending pools.
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
          <h1 className="text-3xl font-bold gradient-text">Lending Pools</h1>
          <p className="text-slate-400 mt-2">Explore different lending pools from various companies</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search pools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 w-full md:w-64"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="all">All Pools</TabsTrigger>
          <TabsTrigger value="eligible">Eligible Pools</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPools.map((pool) => (
              <Card
                key={pool.id}
                className="web3-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
              >
                <CardHeader className="pb-2 relative">
                  <div className="absolute top-3 right-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            {pool.riskLevel === "low" && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                                Low Risk
                              </Badge>
                            )}
                            {pool.riskLevel === "medium" && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                              >
                                Medium Risk
                              </Badge>
                            )}
                            {pool.riskLevel === "high" && (
                              <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50">
                                High Risk
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="glass-effect">
                          <p className="max-w-xs">
                            {pool.riskLevel === "low" && "Conservative pool with lower yields but higher security"}
                            {pool.riskLevel === "medium" && "Balanced risk-to-reward ratio"}
                            {pool.riskLevel === "high" && "Higher yields but with increased risk exposure"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                      {pool.logoUrl ? (
                        <Image src={pool.logoUrl || "/placeholder.svg"} alt={pool.name} width={48} height={48} />
                      ) : (
                        <div className="text-2xl font-bold">{pool.name.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg gradient-text">{pool.name}</CardTitle>
                      <CardDescription>{pool.company}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-slate-300 mb-4">{pool.description}</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">TVL</p>
                      <p className="text-sm font-medium">{pool.tvl}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Borrowed</p>
                      <p className="text-sm font-medium">{pool.totalBorrowed}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Utilization</p>
                      <p className="text-sm font-medium">{pool.utilizationRate}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-400">Available Assets</p>
                    <div className="flex flex-wrap gap-2">
                      {pool.assets.map((asset) => (
                        <Badge key={asset.symbol} variant="secondary" className="bg-slate-800">
                          {asset.symbol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {pool.borrowerRequirements && (
                    <div className="mt-4 p-2 bg-slate-800/50 rounded-md">
                      <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mb-1">
                        <Info className="h-3 w-3" /> Requirements
                      </p>
                      <div className="space-y-1">
                        {pool.borrowerRequirements.minCollateral && (
                          <p className="text-xs text-slate-300">
                            Min. Collateral: {pool.borrowerRequirements.minCollateral}
                          </p>
                        )}
                        {pool.borrowerRequirements.kycRequired && (
                          <p className="text-xs text-slate-300 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> KYC Required
                          </p>
                        )}
                        {pool.borrowerRequirements.whitelistRequired && (
                          <p className="text-xs text-slate-300 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Whitelist Required
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href={`/pools/${pool.id}`} className="w-full">
                    <Button className="w-full web3-button group">
                      View Pool <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="eligible" className="space-y-6">
          {eligiblePools.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eligiblePools.map((pool) => (
                <Card
                  key={pool.id}
                  className="web3-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                >
                  <CardHeader className="pb-2 relative">
                    <div className="absolute top-3 right-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              {pool.riskLevel === "low" && (
                                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                                  Low Risk
                                </Badge>
                              )}
                              {pool.riskLevel === "medium" && (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                                >
                                  Medium Risk
                                </Badge>
                              )}
                              {pool.riskLevel === "high" && (
                                <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50">
                                  High Risk
                                </Badge>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="glass-effect">
                            <p className="max-w-xs">
                              {pool.riskLevel === "low" && "Conservative pool with lower yields but higher security"}
                              {pool.riskLevel === "medium" && "Balanced risk-to-reward ratio"}
                              {pool.riskLevel === "high" && "Higher yields but with increased risk exposure"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                        {pool.logoUrl ? (
                          <Image src={pool.logoUrl || "/placeholder.svg"} alt={pool.name} width={48} height={48} />
                        ) : (
                          <div className="text-2xl font-bold">{pool.name.charAt(0)}</div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg gradient-text">{pool.name}</CardTitle>
                        <CardDescription>{pool.company}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-slate-300 mb-4">{pool.description}</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">TVL</p>
                        <p className="text-sm font-medium">{pool.tvl}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Borrowed</p>
                        <p className="text-sm font-medium">{pool.totalBorrowed}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Utilization</p>
                        <p className="text-sm font-medium">{pool.utilizationRate}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-400">Available Assets</p>
                      <div className="flex flex-wrap gap-2">
                        {pool.assets.map((asset) => (
                          <Badge key={asset.symbol} variant="secondary" className="bg-slate-800">
                            {asset.symbol}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/pools/${pool.id}`} className="w-full">
                      <Button className="w-full web3-button group">
                        View Pool <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="web3-card p-8 text-center">
              <CardTitle className="mb-4 gradient-text">No Eligible Pools</CardTitle>
              <CardDescription className="text-slate-400 mb-6">
                You are not eligible for any lending pools at the moment. This could be due to KYC requirements or
                minimum collateral thresholds.
              </CardDescription>
              <Button onClick={() => document.querySelector('[data-value="all"]')?.click()} className="web3-button">
                View All Pools
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <Card className="web3-card">
          <CardHeader>
            <CardTitle className="gradient-text">Pool Comparison</CardTitle>
            <CardDescription>Compare key metrics across different lending pools</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4">Pool Name</th>
                  <th className="text-center p-4">Risk Level</th>
                  <th className="text-center p-4">TVL</th>
                  <th className="text-center p-4">Avg. Supply APY</th>
                  <th className="text-center p-4">Avg. Borrow APR</th>
                  <th className="text-center p-4">Requirements</th>
                  <th className="text-center p-4">Eligibility</th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool) => {
                  // Calculate average APY and APR
                  const avgApy =
                    pool.assets.reduce((sum, asset) => sum + Number.parseFloat(asset.apy?.replace("%", "") || "0"), 0) /
                    pool.assets.length
                  const avgApr =
                    pool.assets.reduce((sum, asset) => sum + Number.parseFloat(asset.apr?.replace("%", "") || "0"), 0) /
                    pool.assets.length

                  return (
                    <tr key={pool.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                            {pool.logoUrl ? (
                              <Image src={pool.logoUrl || "/placeholder.svg"} alt={pool.name} width={32} height={32} />
                            ) : (
                              <div className="text-sm font-bold">{pool.name.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{pool.name}</p>
                            <p className="text-xs text-slate-400">{pool.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {pool.riskLevel === "low" && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                            Low
                          </Badge>
                        )}
                        {pool.riskLevel === "medium" && (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                            Medium
                          </Badge>
                        )}
                        {pool.riskLevel === "high" && (
                          <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50">
                            High
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-center">{pool.tvl}</td>
                      <td className="p-4 text-center text-primary font-medium">{avgApy.toFixed(1)}%</td>
                      <td className="p-4 text-center text-yellow-500 font-medium">{avgApr.toFixed(1)}%</td>
                      <td className="p-4 text-center">
                        {pool.borrowerRequirements ? (
                          <div className="flex flex-col items-center gap-1">
                            {pool.borrowerRequirements.kycRequired && (
                              <Badge variant="outline" className="bg-slate-800/50">
                                KYC
                              </Badge>
                            )}
                            {pool.borrowerRequirements.whitelistRequired && (
                              <Badge variant="outline" className="bg-slate-800/50">
                                Whitelist
                              </Badge>
                            )}
                            {pool.borrowerRequirements.minCollateral && (
                              <Badge variant="outline" className="bg-slate-800/50">
                                Min. Collateral
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">None</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {eligiblePoolIds.includes(pool.id) ? (
                          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                            Eligible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50">
                            Not Eligible
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
