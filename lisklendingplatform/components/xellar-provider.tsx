"use client"

import { type ReactNode, createContext, useContext, useState } from "react"

// Context to expose Web3 functionality throughout the app
export const Web3Context = createContext<{
  address: string | null
  isConnected: boolean
  balance: string
  connect: () => Promise<void>
  disconnect: () => void
}>({
  address: null,
  isConnected: false,
  balance: "0",
  connect: async () => {},
  disconnect: () => {},
})

// Hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context)

// Main provider component that wraps the app
export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("0")
  const isConnected = !!address

  // Mock connect function for preview
  const connect = async () => {
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Set mock address and balance
      setAddress("lsk1234567890abcdefghijklmnopqrstuvwxyz")
      setBalance("1000.00")

      console.log("Mock wallet connected successfully")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  // Mock disconnect function for preview
  const disconnect = () => {
    setAddress(null)
    setBalance("0")
    console.log("Mock wallet disconnected")
  }

  return (
    <Web3Context.Provider value={{ address, isConnected, balance, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  )
}

// Note: In a production environment, you would replace this with the actual Xellar implementation
// This is a simplified version for the preview environment
