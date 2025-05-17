"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"
import { useConnectModal } from "@xellar/kit"

export function WalletConnectButton() {
  const { isConnected, disconnect, address } = useWallet()
  const { open: openXellarModal } = useConnectModal()

  return (
    <div>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden md:inline-block">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <Button variant="outline" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button onClick={() => openXellarModal()}>Connect Wallet</Button>
      )}
    </div>
  )
}
