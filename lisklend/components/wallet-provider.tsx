"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "./xellar-provider"

type WalletContextType = {
  address: string | null
  isConnected: boolean
  balance: string
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  balance: "0",
  connect: async () => {},
  disconnect: () => {},
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, balance, connect: web3Connect, disconnect: web3Disconnect } = useWeb3()
  const { toast } = useToast()

  // Connect wallet using Web3Provider
  const connect = async () => {
    try {
      await web3Connect()

      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
      })
    }
  }

  // Disconnect wallet using Web3Provider
  const disconnect = () => {
    web3Disconnect()

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  return (
    <WalletContext.Provider value={{ address, isConnected, balance, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}
