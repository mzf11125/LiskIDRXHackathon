"use client"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, TrendingUp, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import DepositAssetForm from "@/components/deposit-asset-form"
import WithdrawAssetForm from "@/components/withdraw-asset-form"
import FlowDiagram from "@/components/flow-diagram"
import { getUserDeposits, contractAddress, pools } from "@/data/mock-data"
import { useReadContract, useReadContracts } from "wagmi"
import { lendingABI } from "@/contracts/lendingABI"
import { formatUnits } from "viem"
import { pricefeedABI } from "@/contracts/pricefeedABI"
import { config } from "@/lib/client-config"

export default function PortfolioPage() {
  const { isConnected, connect, address } = useWallet()
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)

  // Get user deposits
  const userDeposits = getUserDeposits()

  // Get all assets from the first pool (in a real app, you might want to merge assets from all pools)
  const allAssets = pools[0]?.assets || []

  // Get collateral balance for IDRX token
  const {
    data: idrxCollateralBalance,
    isLoading: isLoadingIdrxBalance,
    refetch: refetchIdrxBalance
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: lendingABI,
    functionName: 'getCollateralBalance',
    args: [allAssets[0].tokenAddress?.trim() as `0x${string}`],
    account: address as `0x${string}`,
    query: {
      enabled: !!address && !!contractAddress && !!allAssets[0].tokenAddress?.startsWith('0x'),
      refetchInterval: 10000, // Refetch every 5 seconds
    },
  })

  // Get collateral balance for BTC token
  const {
    data: btcCollateralBalance,
    isLoading: isLoadingBtcBalance,
    refetch: refetchBtcBalance
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: lendingABI,
    functionName: 'getCollateralBalance',
    args: [allAssets[1].tokenAddress?.trim() as `0x${string}`],
    account: address as `0x${string}`,
    query: {
      enabled: !!address && !!contractAddress && !!allAssets[1].tokenAddress?.startsWith('0x'),
      refetchInterval: 10000, // Refetch every 5 seconds
    },
  })

  // Get collateral balance for ETH token
  const {
    data: ethCollateralBalance,
    isLoading: isLoadingEthBalance,
    refetch: refetchEthBalance
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: lendingABI,
    functionName: 'getCollateralBalance',
    args: [allAssets[2].tokenAddress?.trim() as `0x${string}`],
    account: address as `0x${string}`,
    query: {
      enabled: !!address && !!contractAddress && !!allAssets[2].tokenAddress?.startsWith('0x'),
      refetchInterval: 10000, // Refetch every 5 seconds
    },
  })

  // Get collateral balance for USDT token
  const {
    data: usdtCollateralBalance,
    isLoading: isLoadingUsdtBalance,
    refetch: refetchUsdtBalance
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: lendingABI,
    functionName: 'getCollateralBalance',
    args: [allAssets[3].tokenAddress?.trim() as `0x${string}`],
    account: address as `0x${string}`,
    query: {
      enabled: !!address && !!contractAddress && !!allAssets[3].tokenAddress?.startsWith('0x'),
      refetchInterval: 10000, // Refetch every 5 seconds
    },
  })

  // Get debt raising token for USDT
  const { data: totalCollateralValue } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: lendingABI,
    args: address ? [address] : undefined,
    functionName: "getTotalCollateralValueInDebtToken",
    query: {
      enabled: !!address,
      refetchInterval: 10000
    }
  });
  // Format the collateral balances by converting from wei to proper units
  const formattedBalances = useMemo(() => {
    return {
      IDRX: idrxCollateralBalance ? formatUnits(idrxCollateralBalance, allAssets[0].units || 2) : "0.00",
      BTC: btcCollateralBalance ? formatUnits(btcCollateralBalance, allAssets[1].units || 8) : "0.00",
      ETH: ethCollateralBalance ? formatUnits(ethCollateralBalance, allAssets[2].units || 18) : "0.00",
      USDT: usdtCollateralBalance ? formatUnits(usdtCollateralBalance, allAssets[3].units || 18) : "0.00"
    }
  }, [idrxCollateralBalance, btcCollateralBalance, ethCollateralBalance, usdtCollateralBalance, allAssets])

  // Format token prices from priceData


  const { data: priceData } = useReadContracts({
    contracts: allAssets
      .filter(token => token.tokenAddress && token.tokenAddress.startsWith('0x'))
      .map((token) => ({
        address: token.priceFeed as `0x${string}`,
        abi: pricefeedABI as any, // Cast to any to resolve type incompatibility
        functionName: 'latestAnswer',
      })),
    query: {
      refetchInterval: 10000, // Refetch every 5 seconds
    }
  })
  const formattedPrices = useMemo(() => {
    return {
      IDRX: priceData?.[0]?.result ? Number(priceData[0].result) / 1e8 : 0.00006123,
      BTC: priceData?.[1]?.result ? Number(priceData[1].result) / 1e8 : 60000,
      ETH: priceData?.[2]?.result ? Number(priceData[2].result) / 1e8 : 3000,
      USDT: priceData?.[3]?.result ? Number(priceData[3].result) / 1e8 : 1
    }
  }, [priceData])

  // Calculate total deposit value and earnings
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

  const handleWithdrawSuccess = () => {
    setIsWithdrawDialogOpen(false)
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
      </div>      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Deposit Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">{totalCollateralValue && `${formatUnits(totalCollateralValue, 2)}`}</p>
              <p className="text-sm text-slate-400 mb-1">IDRX</p>
            </div>
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
                    {/* Token display sections */}
                    {/* IDRX Token */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                          I
                        </div>
                        <div>
                          <p className="font-medium">IDRX</p>
                          <p className="text-sm text-slate-400">
                            Collateral Balance
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{formattedBalances.IDRX} IDRX</p>
                        <p className="text-sm text-slate-400">
                          {isLoadingIdrxBalance
                            ? "Loading..."
                            : `$${(parseFloat(formattedBalances.IDRX) * formattedPrices.IDRX).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsWithdrawDialogOpen(true)}
                        >
                          Withdraw
                        </Button>
                        <Button size="sm" onClick={() => setIsDepositDialogOpen(true)} className="web3-button">
                          Deposit
                        </Button>
                      </div>
                    </div>

                    {/* BTC Token */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                          B
                        </div>
                        <div>
                          <p className="font-medium">BTC</p>
                          <p className="text-sm text-slate-400">
                            Collateral Balance
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{formattedBalances.BTC} BTC</p>
                        <p className="text-sm text-slate-400">
                          {isLoadingBtcBalance
                            ? "Loading..."
                            : `$${(parseFloat(formattedBalances.BTC) * formattedPrices.BTC).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsWithdrawDialogOpen(true)}
                        >
                          Withdraw
                        </Button>
                        <Button size="sm" onClick={() => setIsDepositDialogOpen(true)} className="web3-button">
                          Deposit
                        </Button>
                      </div>
                    </div>

                    {/* ETH Token */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                          E
                        </div>
                        <div>
                          <p className="font-medium">ETH</p>
                          <p className="text-sm text-slate-400">
                            Collateral Balance
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{formattedBalances.ETH} ETH</p>
                        <p className="text-sm text-slate-400">
                          {isLoadingEthBalance
                            ? "Loading..."
                            : `$${(parseFloat(formattedBalances.ETH) * formattedPrices.ETH).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsWithdrawDialogOpen(true)}
                        >
                          Withdraw
                        </Button>
                        <Button size="sm" onClick={() => setIsDepositDialogOpen(true)} className="web3-button">
                          Deposit
                        </Button>
                      </div>
                    </div>

                    {/* USDT Token */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                          U
                        </div>
                        <div>
                          <p className="font-medium">USDT</p>
                          <p className="text-sm text-slate-400">
                            Collateral Balance
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{formattedBalances.USDT} USDT</p>
                        <p className="text-sm text-slate-400">
                          {isLoadingUsdtBalance
                            ? "Loading..."
                            : `$${(parseFloat(formattedBalances.USDT) * formattedPrices.USDT).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsWithdrawDialogOpen(true)}
                        >
                          Withdraw
                        </Button>
                        <Button size="sm" onClick={() => setIsDepositDialogOpen(true)} className="web3-button">
                          Deposit
                        </Button>
                      </div>
                    </div>
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
      </Tabs >

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

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent
          className="web3-card sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          style={{ position: "fixed" }}
        >
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">
              Withdraw Assets
            </DialogTitle>
            <DialogDescription>
              Withdraw your deposited assets and earned interest.
            </DialogDescription>
          </DialogHeader>
          <WithdrawAssetForm onSuccess={handleWithdrawSuccess} />
        </DialogContent>
      </Dialog>
    </div >
  )
}
