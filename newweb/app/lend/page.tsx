"use client"

import { useState } from "react"
import { Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/components/wallet-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function LendPage() {
  const { isConnected, connect } = useWallet()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [isSupplyDialogOpen, setIsSupplyDialogOpen] = useState(false)

  const assets = [
    { symbol: "IDRX", name: "IDRX Token", apy: "8.2%", walletBalance: "1000.00", price: "$1.00" },
    { symbol: "LSK", name: "Lisk", apy: "5.7%", walletBalance: "50.00", price: "$2.50" },
    { symbol: "BTC", name: "Bitcoin", apy: "3.2%", walletBalance: "0.05", price: "$60,000.00" },
    { symbol: "ETH", name: "Ethereum", apy: "4.5%", walletBalance: "1.20", price: "$3,000.00" },
  ]

  const handleSupply = () => {
    if (!selectedAsset || !amount) return

    toast({
      title: "Supply Initiated",
      description: `You've supplied ${amount} ${selectedAsset}. Transaction pending...`,
    })

    // Close dialog and reset form
    setIsSupplyDialogOpen(false)
    setAmount("")
    setSelectedAsset(null)
  }

  const openSupplyDialog = (asset: string) => {
    setSelectedAsset(asset)
    setIsSupplyDialogOpen(true)
  }

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
          <h1 className="text-3xl font-bold gradient-text">Lend Assets</h1>
          <p className="text-slate-400 mt-2">Supply your assets to earn interest</p>
        </div>
        <Card className="web3-card p-4 flex items-center gap-3 glow-border">
          <AlertCircle className="text-yellow-500 h-5 w-5" />
          <p className="text-sm">
            Your health factor: <span className="font-bold text-green-500">∞</span>
          </p>
        </Card>
      </div>

      <Tabs defaultValue="supply" className="space-y-8">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="supply">Supply</TabsTrigger>
          <TabsTrigger value="supplied">Your Supplied</TabsTrigger>
        </TabsList>

        <TabsContent value="supply" className="space-y-6">
          <Card className="web3-card overflow-hidden">
            <CardHeader className="bg-slate-900/80 backdrop-blur-md">
              <div className="flex justify-between items-center">
                <CardTitle className="gradient-text">Assets to Supply</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="glass-effect">
                      <p className="max-w-xs">
                        Supply assets to earn interest. Supplied assets can be used as collateral for borrowing.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left p-4">Asset</th>
                      <th className="text-right p-4">Wallet Balance</th>
                      <th className="text-right p-4">APY</th>
                      <th className="text-right p-4">Collateral</th>
                      <th className="text-right p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr
                        key={asset.symbol}
                        className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                              {asset.symbol.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{asset.symbol}</p>
                              <p className="text-xs text-slate-400">{asset.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <p>{asset.walletBalance}</p>
                          <p className="text-xs text-slate-400">{asset.price}</p>
                        </td>
                        <td className="p-4 text-right">
                          <p className="gradient-text font-medium">{asset.apy}</p>
                        </td>
                        <td className="p-4 text-right">
                          <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">Yes</span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            className="web3-button group"
                            onClick={() => openSupplyDialog(asset.symbol)}
                          >
                            Supply
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplied">
          <Card className="web3-card p-8 text-center">
            <CardTitle className="mb-4 gradient-text">No Supplied Assets</CardTitle>
            <CardDescription className="text-slate-400 mb-6">
              You haven't supplied any assets yet. Supply assets to earn interest.
            </CardDescription>
            <Button onClick={() => document.querySelector('[data-value="supply"]')?.click()} className="web3-button">
              Supply Assets
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isSupplyDialogOpen} onOpenChange={setIsSupplyDialogOpen}>
        <DialogContent className="web3-card sm:max-w-md glass-effect">
          <DialogHeader>
            <DialogTitle className="gradient-text">Supply {selectedAsset}</DialogTitle>
            <DialogDescription>Enter the amount you want to supply to the lending pool.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount
                </label>
                <span className="text-sm text-slate-400">
                  Balance: {assets.find((a) => a.symbol === selectedAsset)?.walletBalance || "0.00"}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => {
                    const asset = assets.find((a) => a.symbol === selectedAsset)
                    if (asset) setAmount(asset.walletBalance)
                  }}
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Overview</label>
              <div className="bg-slate-800/70 rounded-lg p-4 space-y-2 backdrop-blur-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Supply APY</span>
                  <span className="gradient-text">
                    {assets.find((a) => a.symbol === selectedAsset)?.apy || "0.00%"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Collateral</span>
                  <span className="text-green-500">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Health Factor</span>
                  <span className="text-green-500">∞</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSupplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSupply} className="web3-button">
              Supply {selectedAsset}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
