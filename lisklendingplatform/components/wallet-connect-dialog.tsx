"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useWallet } from "./wallet-provider"
import { XellarConnectButton, XellarConnectModal } from "@xellar/kit"

export function WalletConnectDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { isConnected } = useWallet()

  // Close the dialog when connected
  const handleConnect = () => {
    if (isConnected) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <XellarConnectButton onClick={() => setIsOpen(true)} />

      <Dialog open={isOpen && !isConnected} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect your wallet</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <XellarConnectModal onConnect={handleConnect} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
