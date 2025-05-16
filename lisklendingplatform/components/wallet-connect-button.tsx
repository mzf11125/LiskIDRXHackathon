"use client"
import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"
import { Loader2 } from "lucide-react"

export function WalletConnectButton() {
  const { isConnected, connect, disconnect, address, isAuthenticating } = useWallet()

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
        <Button onClick={connect} disabled={isAuthenticating}>
          {isAuthenticating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      )}
    </div>
  )
}
