"use client"

import { useState } from "react"
import { Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Progress } from "@/components/ui/progress"

export default function BorrowPage() {
  const { isConnected, connect } = useWallet()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false)

  const assets = [
    { symbol: "IDRX", name: "IDRX Token", apr: "10.2%", available: "100,000.00", price: "$1.00" },
    { symbol: "LSK", name: "Lisk", apr: "7.7%", available: "25,000.00", price: "$2.50" },
    { symbol: "BTC", name: "Bitcoin", apr: "5.2%", available: "10.00", price: "$60,000.00" },
    { symbol: "ETH", name: "Ethereum", apr: "6.5%", available: "100.00", price: "$3,000.00" },
  ]

  const handleBorrow = () => {
    if (!selectedAsset || !amount) return

    toast({
      title: "Borrow Initiated",
      description: `You've borrowed ${amount} ${selectedAsset}. Transaction pending...`,
    })

    // Close dialog and reset form
    setIsBorrowDialogOpen(false)
    setAmount("")
    setSelectedAsset(null)
  }

  const openBorrowDialog = (asset: string) => {
    setSelectedAsset(asset)
    setIsBorrowDialogOpen(true)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
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
          <h1 className="text-3xl font-bold">Borrow Assets</h1>
          <p className="text-slate-400 mt-2">Borrow against your supplied collateral</p>
        </div>
        <Card className="web3-card p-4 flex items-center gap-3">
          <AlertCircle className="text-yellow-500 h-5 w-5" />
          <p className="text-sm">
            Your health factor: <span className="font-bold text-green-500">∞</span>
          </p>
        </Card>
      </div>

      <Card className="web3-card mb-8 p-6">
        <CardTitle className="mb-4">Your Borrowing Power</CardTitle>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Supplied</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Borrowed</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Available to Borrow</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-slate-400">Borrow Limit</p>
            <p className="text-sm">0%</p>
          </div>
          <Progress value={0} className="h-2 bg-slate-800" />
        </div>
      </Card>

      <Tabs defaultValue="borrow" className="space-y-8">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
          <TabsTrigger value="borrowed">Your Borrowed</TabsTrigger>
        </TabsList>

        <TabsContent value="borrow" className="space-y-6">
          <Card className="web3-card overflow-hidden">
            <CardHeader className="bg-slate-900">
              <div className="flex justify-between items-center">
                <CardTitle>Assets to Borrow</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Borrow assets against your supplied collateral. Keep your health factor above 1 to avoid
                        liquidation.
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
                      <th className="text-right p-4">Available</th>
                      <th className="text-right p-4">APR</th>
                      <th className="text-right p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.symbol} className="border-b border-slate-800 hover:bg-slate-900/50">
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
                          <p>{asset.available}</p>
                          <p className="text-xs text-slate-400">{asset.price}</p>
                        </td>
                        <td className="p-4 text-right text-yellow-500 font-medium">{asset.apr}</td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            className="web3-button"
                            onClick={() => openBorrowDialog(asset.symbol)}
                            disabled={true}
                          >
                            Borrow
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="bg-yellow-500/10 p-4 border-t border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-500">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">You need to supply collateral before you can borrow.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="borrowed">
          <Card className="web3-card p-8 text-center">
            <CardTitle className="mb-4">No Borrowed Assets</CardTitle>
            <CardDescription className="text-slate-400 mb-6">
              You haven't borrowed any assets yet. Supply collateral first, then borrow assets.
            </CardDescription>
            <Button onClick={() => document.querySelector('[data-value="borrow"]')?.click()}>Borrow Assets</Button>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
        <DialogContent className="web3-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Borrow {selectedAsset}</DialogTitle>
            <DialogDescription>Enter the amount you want to borrow from the lending pool.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount
                </label>
                <span className="text-sm text-slate-400">
                  Available: {assets.find((a) => a.symbol === selectedAsset)?.available || "0.00"}
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
                    if (asset) setAmount(asset.available)
                  }}
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Overview</label>
              <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Borrow APR</span>
                  <span className="text-yellow-500">
                    {assets.find((a) => a.symbol === selectedAsset)?.apr || "0.00%"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Health Factor</span>
                  <span className="text-red-500">Insufficient collateral</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBorrowDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBorrow} className="web3-button" disabled={true}>
              Borrow {selectedAsset}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
