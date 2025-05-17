"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"
import { useConnectModal } from "@xellar/kit"

export default function WalletConnectButton() {
  const { isConnected, address, balance, disconnect } = useWallet()
  const { open: openXellarModal } = useConnectModal()

  // Format the wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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

  // If not connected, use a button that opens the Xellar modal
  return (
    <Button
      onClick={() => openXellarModal()}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      Connect Wallet
    </Button>
  )
}