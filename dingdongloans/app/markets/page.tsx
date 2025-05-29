"use client"

import { useState } from "react"
import { Search, ArrowUpDown, Info, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DepositAssetForm from "@/components/deposit-asset-form"

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)
  const [selectedAssetForDeposit, setSelectedAssetForDeposit] = useState<string>("")

  const markets = [
    {
      symbol: "IDRX",
      name: "IDRX Token",
      price: "$1.00",
      marketSize: "$500,000",
      totalBorrowed: "$200,000",
      depositApy: "8.2%",
      borrowApr: "10.2%",
      collateralFactor: "80%",
    },
    {
      symbol: "LSK",
      name: "Lisk",
      price: "$2.50",
      marketSize: "$250,000",
      totalBorrowed: "$100,000",
      depositApy: "5.7%",
      borrowApr: "7.7%",
      collateralFactor: "75%",
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: "$60,000.00",
      marketSize: "$10,000,000",
      totalBorrowed: "$5,000,000",
      depositApy: "3.2%",
      borrowApr: "5.2%",
      collateralFactor: "70%",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: "$3,000.00",
      marketSize: "$5,000,000",
      totalBorrowed: "$2,000,000",
      depositApy: "4.5%",
      borrowApr: "6.5%",
      collateralFactor: "75%",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      price: "$1.00",
      marketSize: "$8,000,000",
      totalBorrowed: "$4,000,000",
      depositApy: "6.0%",
      borrowApr: "8.0%",
      collateralFactor: "85%",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      price: "$1.00",
      marketSize: "$7,000,000",
      totalBorrowed: "$3,500,000",
      depositApy: "5.8%",
      borrowApr: "7.8%",
      collateralFactor: "85%",
    },
  ]

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const filteredMarkets = markets.filter(
    (market) =>
      market.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "marketSize":
        comparison =
          Number.parseFloat(a.marketSize.replace(/[^0-9.-]+/g, "")) -
          Number.parseFloat(b.marketSize.replace(/[^0-9.-]+/g, ""))
        break
      case "depositApy":
        comparison =
          Number.parseFloat(a.depositApy.replace(/[^0-9.-]+/g, "")) -
          Number.parseFloat(b.depositApy.replace(/[^0-9.-]+/g, ""))
        break
      case "borrowApr":
        comparison =
          Number.parseFloat(a.borrowApr.replace(/[^0-9.-]+/g, "")) -
          Number.parseFloat(b.borrowApr.replace(/[^0-9.-]+/g, ""))
        break
      default:
        comparison = 0
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleDepositAsset = (assetSymbol: string) => {
    setSelectedAssetForDeposit(assetSymbol)
    setIsDepositDialogOpen(true)
  }

  const handleDepositSuccess = () => {
    setIsDepositDialogOpen(false)
    setSelectedAssetForDeposit("")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Markets</h1>
          <p className="text-slate-400 mt-2">View all available markets and their stats</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 w-full md:w-64"
          />
        </div>
      </div>

      <Card className="web3-card overflow-hidden">
        <CardHeader className="bg-slate-900">
          <CardTitle>All Markets</CardTitle>
          <CardDescription>Current market rates and statistics for all supported assets</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4">
                    <button className="flex items-center gap-1 hover:text-primary" onClick={() => handleSort("name")}>
                      Asset
                      {sortBy === "name" && <ArrowUpDown className="h-4 w-4" />}
                    </button>
                  </th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-right p-4">
                    <button
                      className="flex items-center gap-1 ml-auto hover:text-primary"
                      onClick={() => handleSort("marketSize")}
                    >
                      Market Size
                      {sortBy === "marketSize" && <ArrowUpDown className="h-4 w-4" />}
                    </button>
                  </th>
                  <th className="text-right p-4">
                    <button
                      className="flex items-center gap-1 ml-auto hover:text-primary"
                      onClick={() => handleSort("depositApy")}
                    >
                      Deposit APY
                      {sortBy === "depositApy" && <ArrowUpDown className="h-4 w-4" />}
                    </button>
                  </th>
                  <th className="text-right p-4">
                    <button
                      className="flex items-center gap-1 ml-auto hover:text-primary"
                      onClick={() => handleSort("borrowApr")}
                    >
                      Borrow APR
                      {sortBy === "borrowApr" && <ArrowUpDown className="h-4 w-4" />}
                    </button>
                  </th>
                  <th className="text-right p-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 ml-auto">
                            Collateral Factor
                            <Info className="h-4 w-4 text-slate-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            The percentage of an asset's value that can be borrowed against when used as collateral.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedMarkets.map((market) => (
                  <tr key={market.symbol} className="border-b border-slate-800 hover:bg-slate-900/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                          {market.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{market.symbol}</p>
                          <p className="text-xs text-slate-400">{market.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">{market.price}</td>
                    <td className="p-4 text-right">
                      <p>{market.marketSize}</p>
                      <p className="text-xs text-slate-400">{market.totalBorrowed} borrowed</p>
                    </td>
                    <td className="p-4 text-right text-primary font-medium">{market.depositApy}</td>
                    <td className="p-4 text-right text-yellow-500 font-medium">{market.borrowApr}</td>
                    <td className="p-4 text-right">{market.collateralFactor}</td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleDepositAsset(market.symbol)}
                        className="web3-button"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Deposit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <Card className="web3-card">
          <CardHeader>
            <CardTitle>Market Statistics</CardTitle>
            <CardDescription>Overview of the lending platform's performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Total Value Locked</span>
                <span className="font-bold">$30,750,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Total Borrowed</span>
                <span className="font-bold">$14,800,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Utilization Rate</span>
                <span className="font-bold">48.13%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Number of Markets</span>
                <span className="font-bold">{markets.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader>
            <CardTitle>Market Trends</CardTitle>
            <CardDescription>Recent changes in market conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Highest Deposit APR</span>
                <span className="font-bold text-primary">8.2% (IDRX)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Lowest Borrow APR</span>
                <span className="font-bold text-yellow-500">5.2% (BTC)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Most Supplied Asset</span>
                <span className="font-bold">BTC ($10M)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Most Borrowed Asset</span>
                <span className="font-bold">BTC ($5M)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent
          className="web3-card sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          style={{ position: "fixed" }}
        >
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">
              Deposit {selectedAssetForDeposit}
            </DialogTitle>
            <DialogDescription>
              Deposit {selectedAssetForDeposit} to earn interest and use it as collateral for borrowing.
            </DialogDescription>
          </DialogHeader>
          <DepositAssetForm
            onSuccess={handleDepositSuccess}
            preselectedAsset={selectedAssetForDeposit}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
