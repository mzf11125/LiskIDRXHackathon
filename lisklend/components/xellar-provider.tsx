"use client"

import { type ReactNode, createContext, useContext } from "react"
import { useAccount, useBalance, useDisconnect } from "wagmi"
import { useConnectModal } from "@xellar/kit"

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
  // Use wagmi hooks (provided by Xellar Kit)
  const { address, isConnected } = useAccount()
  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
    enabled: !!address,
  })
  const { disconnect: disconnectWallet } = useDisconnect()
  const { open: openConnectModal } = useConnectModal()

  // Connect using Xellar modal
  const connect = async () => {
    try {
      openConnectModal()
      console.log("Opening Xellar connect modal")
    } catch (error) {
      console.error("Failed to open connect modal:", error)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    disconnectWallet()
    console.log("Wallet disconnected")
  }

  return (
    <Web3Context.Provider value={{ 
      address: address || null, 
      isConnected, 
      balance: balanceData?.formatted || "0", 
      connect, 
      disconnect 
    }}>
      {children}
    </Web3Context.Provider>
  )
}
