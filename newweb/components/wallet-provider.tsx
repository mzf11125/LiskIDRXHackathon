"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

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
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("0")
  const { toast } = useToast()

  const isConnected = !!address

  // Mock wallet connection
  const connect = async () => {
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock address and balance
      setAddress("lsk1234567890abcdefghijklmnopqrstuvwxyz")
      setBalance("1000.00")
      console.log("Wallet connected successfully with mock address")

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

  const disconnect = () => {
    setAddress(null)
    setBalance("0")
    console.log("Wallet disconnected")
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
