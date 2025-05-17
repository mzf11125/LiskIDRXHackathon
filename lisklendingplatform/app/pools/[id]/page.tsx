"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, AlertCircle, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { usePools } from "@/hooks/use-pools"
import { useBorrowers } from "@/hooks/use-borrowers"

export default function PoolDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isConnected, connect, address } = useWallet()
  const [activeTab, setActiveTab] = useState("overview")
  const { fetchPoolById, currentPool: pool, isLoading: poolLoading } = usePools()
  const { currentBorrower: borrower, fetchAvailableAssets, isLoading: borrowerLoading } = useBorrowers()
  const [availableAssets, setAvailableAssets] = useState<any[]>([])
  const [assetLoading, setAssetLoading] = useState(false)
  
  // Check if borrower is eligible for this pool
  const isEligible = borrower?.eligiblePools?.includes(params.id) || false
  const isLoading = poolLoading || borrowerLoading || assetLoading

  // Fetch pool data
  useEffect(() => {
    fetchPoolById(params.id)
  }, [params.id, fetchPoolById])
  
  // Fetch available assets when connected and pool is loaded
  useEffect(() => {
    const getAvailableAssets = async () => {
      if (isConnected && address && pool) {
        setAssetLoading(true)
        try {
          const assets = await fetchAvailableAssets(address, params.id)
          setAvailableAssets(assets)
        } catch (error) {
          console.error("Failed to fetch available assets:", error)
        } finally {
          setAssetLoading(false)
        }
      }
    }
    
    getAvailableAssets()
  }, [isConnected, address, pool, params.id, fetchAvailableAssets])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-6 gradient-text">Loading Pool Details</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please wait while we fetch the lending pool information...
        </p>
      </div>
    )
  }

  if (!pool) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Pool Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The lending pool you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/pools")} className="web3-button">
          Back to Pools
        </Button>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to view and interact with this lending pool.
        </p>
        <Button onClick={connect} className="web3-button">
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4 hover:bg-slate-800/50" onClick={() => router.push("/pools")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pools
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
              {pool.logoUrl ? (
                <Image src={pool.logoUrl || "/placeholder.svg"} alt={pool.name} width={64} height={64} />
              ) : (
                <div className="text-3xl font-bold">{pool.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{pool.name}</h1>
              <p className="text-slate-400">{pool.company}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pool.riskLevel === "low" && (
              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50 text-sm px-3 py-1">
                Low Risk
              </Badge>
            )}
            {pool.riskLevel === "medium" && (
              <Badge
                variant="outline"
                className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 text-sm px-3 py-1"
              >
                Medium Risk
              </Badge>
            )}
            {pool.riskLevel === "high" && (
              <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50 text-sm px-3 py-1">
                High Risk
              </Badge>
            )}

            {isEligible ? (
              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50 text-sm px-3 py-1">
                Eligible
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50 text-sm px-3 py-1">
                Not Eligible
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Value Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">{pool.tvl}</p>
              <p className="text-sm text-slate-400 mb-1">USD</p>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">{pool.totalBorrowed}</p>
              <p className="text-sm text-slate-400 mb-1">USD</p>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-3xl font-bold gradient-text">{pool.utilizationRate}</p>
            </div>
            <Progress value={Number.parseFloat(pool.utilizationRate)} className="h-2 bg-slate-800" />
          </CardContent>
        </Card>
      </div>

      {!isEligible && (
        <Card className="web3-card mb-8 border-red-500/30">
          <CardHeader className="bg-red-500/10">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Not Eligible for This Pool
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-slate-300 mb-4">
              You are not eligible to borrow from this pool due to the following requirements:
            </p>
            <div className="space-y-2">
              {pool.borrowerRequirements?.kycRequired && !borrower?.kycVerified && (
                <div className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">KYC Verification Required</p>
                    <p className="text-sm text-slate-400">
                      This pool requires KYC verification. Please complete the verification process.
                    </p>
                  </div>
                </div>
              )}
              {pool.borrowerRequirements?.whitelistRequired && !borrower?.whitelisted && (
                <div className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Whitelist Required</p>
                    <p className="text-sm text-slate-400">This pool is only available to whitelisted addresses.</p>
                  </div>
                </div>
              )}
              {pool.borrowerRequirements?.minCollateral && (
                <div className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Minimum Collateral: {pool.borrowerRequirements.minCollateral}</p>
                    <p className="text-sm text-slate-400">
                      Your current collateral: {borrower?.collateralValue || "$0.00"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="web3-card">
            <CardHeader>
              <CardTitle>Pool Overview</CardTitle>
              <CardDescription>{pool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">About {pool.company}</h3>
                  <p className="text-slate-300">
                    {pool.company} is a leading provider of decentralized financial services on the Lisk blockchain.
                    This lending pool was created on {new Date(pool.createdAt).toLocaleDateString()} to provide
                    liquidity for various assets with competitive interest rates.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Pool Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <p className="text-sm text-slate-400">Total Value Locked</p>
                      <p className="text-xl font-bold gradient-text">{pool.tvl}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <p className="text-sm text-slate-400">Total Borrowed</p>
                      <p className="text-xl font-bold gradient-text">{pool.totalBorrowed}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <p className="text-sm text-slate-400">Utilization Rate</p>
                      <p className="text-xl font-bold gradient-text">{pool.utilizationRate}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <p className="text-sm text-slate-400">Risk Level</p>
                      <p className="text-xl font-bold">
                        {pool.riskLevel === "low" && <span className="text-green-500">Low</span>}
                        {pool.riskLevel === "medium" && <span className="text-yellow-500">Medium</span>}
                        {pool.riskLevel === "high" && <span className="text-red-500">High</span>}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Supported Assets</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {pool.assets?.map((asset) => (
                      <div key={asset.symbol} className="bg-slate-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            {asset.symbol.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{asset.symbol}</p>
                            <p className="text-xs text-slate-400">{asset.name}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-slate-400">Supply APY</p>
                            <p className="text-sm text-green-500">{asset.apy}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Borrow APR</p>
                            <p className="text-sm text-yellow-500">{asset.apr}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card className="web3-card">
            <CardHeader>
              <CardTitle>Available Assets</CardTitle>
              <CardDescription>Assets available for lending and borrowing in this pool</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pool.assets?.map((asset) => (
                    <div key={asset.symbol} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                            {asset.symbol.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{asset.symbol}</p>
                            <p className="text-xs text-slate-400">{asset.name}</p>
                          </div>
                        </div>
                        {availableAssets.some((a) => a.symbol === asset.symbol) ? (
                          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50">
                            Unavailable
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Total Supply</p>
                          <p className="text-sm font-medium">{asset.totalSupply}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Supply APY</p>
                          <p className="text-sm font-medium text-green-500">{asset.apy}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Borrow APR</p>
                          <p className="text-sm font-medium text-yellow-500">{asset.apr}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs text-slate-400 mb-1">Utilization</p>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${asset.utilization || "0%"}` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-slate-500">{asset.utilization}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="w-1/2 web3-button" disabled={!isEligible}>
                          Supply
                        </Button>
                        <Button
                          size="sm"
                          className="w-1/2 web3-button"
                          disabled={!isEligible || !availableAssets.some((a) => a.symbol === asset.symbol)}
                        >
                          Borrow
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <Card className="web3-card">
            <CardHeader>
              <CardTitle>Active Proposals</CardTitle>
              <CardDescription>Governance proposals for this lending pool</CardDescription>
            </CardHeader>
            <CardContent>
              {pool.proposals && pool.proposals.length > 0 ? (
                <div className="space-y-4">
                  {pool.proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{proposal.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            proposal.status === "active"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                              : proposal.status === "passed"
                              ? "bg-green-500/20 text-green-500 border-green-500/50"
                              : proposal.status === "rejected"
                              ? "bg-red-500/20 text-red-500 border-red-500/50"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                          }
                        >
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{proposal.description}</p>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <p className="text-xs text-slate-400">Proposer</p>
                          <p className="text-sm truncate">{proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">End Date</p>
                          <p className="text-sm">{new Date(proposal.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Votes</p>
                          <p className="text-sm">
                            <span className="text-green-500">{proposal.votesFor}</span> /{" "}
                            <span className="text-red-500">{proposal.votesAgainst}</span>
                          </p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${
                              (proposal.votesFor / (proposal.votesFor + proposal.votesAgainst || 1)) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No active proposals for this pool at the moment.</p>
                  <Button className="web3-button">Create Proposal</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <Card className="web3-card">
            <CardHeader>
              <CardTitle>Borrower Requirements</CardTitle>
              <CardDescription>Requirements to borrow from this lending pool</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pool.borrowerRequirements ? (
                  <>
                    {pool.borrowerRequirements.kycRequired && (
                      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                        <h3 className="font-medium mb-2">KYC Verification Required</h3>
                        <p className="text-sm text-slate-300 mb-3">
                          This pool requires Know Your Customer (KYC) verification to ensure compliance with regulatory
                          requirements.
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              borrower?.kycVerified ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                          <p className="text-sm">
                            {borrower?.kycVerified ? "You have completed KYC verification" : "You need to complete KYC verification"}
                          </p>
                        </div>
                      </div>
                    )}

                    {pool.borrowerRequirements.whitelistRequired && (
                      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                        <h3 className="font-medium mb-2">Whitelist Required</h3>
                        <p className="text-sm text-slate-300 mb-3">
                          This pool is restricted to whitelisted addresses only. Whitelisting is managed by the pool
                          administrators.
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              borrower?.whitelisted ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                          <p className="text-sm">
                            {borrower?.whitelisted
                              ? "Your address is whitelisted"
                              : "Your address is not whitelisted"}
                          </p>
                        </div>
                      </div>
                    )}

                    {pool.borrowerRequirements.minCollateral && (
                      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                        <h3 className="font-medium mb-2">Minimum Collateral Required</h3>
                        <p className="text-sm text-slate-300 mb-3">
                          This pool requires a minimum collateral value to protect against default risk.
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              borrower?.collateralValue &&
                              parseFloat(borrower.collateralValue.replace(/[^0-9.]/g, "")) >=
                                parseFloat(pool.borrowerRequirements.minCollateral.replace(/[^0-9.]/g, ""))
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <p className="text-sm">
                            Required: {pool.borrowerRequirements.minCollateral} | Your collateral:{" "}
                            {borrower?.collateralValue || "$0.00"}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center py-8 text-slate-400">
                    This pool has no specific borrower requirements.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
