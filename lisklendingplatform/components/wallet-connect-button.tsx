"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useWallet } from "./wallet-provider"
import { useConnectModal } from "@xellar/kit"

export default function WalletConnectButton() {
  const { isConnected, address, balance, connect, disconnect } = useWallet()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { open: openXellarModal } = useConnectModal()

  // Format the wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Handle the connection request
  const handleConnect = async () => {
    await connect()
    setIsDialogOpen(false)
  }

  // If already connected, display wallet info and disconnect button
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-slate-800/60 rounded-lg px-3 py-1.5 text-sm border border-slate-700/50">
          <span className="mr-2">{formatAddress(address)}</span>
          <span className="text-emerald-400">{balance} LSK</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  // If not connected, show connect button with dialog
  return (
    <>
      <Button
        onClick={() => openXellarModal()}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        Connect Wallet
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription>
              Connect your wallet to access all features of the platform
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              onClick={handleConnect} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Connect with Xellar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}