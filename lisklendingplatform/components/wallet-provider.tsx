"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAccount, useDisconnect, useBalance, useSignMessage } from "wagmi"
import { authAPI } from "@/services/api"
import { useConnectModal } from "@xellar/kit"

type WalletContextType = {
  address: string | null
  isConnected: boolean
  balance: string
  isAuthenticating: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signMessage: (message: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  balance: "0",
  isAuthenticating: false,
  connect: async () => {},
  disconnect: () => {},
  signMessage: async () => "",
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  
  // Use Wagmi hooks from Xellar Kit
  const { address, isConnected } = useAccount()
  const { open: openConnectModal } = useConnectModal()
  const { disconnect: disconnectWallet } = useDisconnect()
  const { data: balanceData, isPending } = useBalance({
    address: address as `0x${string}` | undefined,
    enabled: !!address,
  })
  const { signMessageAsync } = useSignMessage()

  // Connect wallet using Xellar modal
  const connect = async () => {
    try {
      // Open Xellar's connect modal
      openConnectModal()

      toast({
        title: "Connect wallet",
        description: "Please select your wallet in the modal",
      })
    } catch (error: any) {
      console.error("Connection failed:", error)
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "Failed to open wallet modal. Please try again.",
      })
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    disconnectWallet()
    localStorage.removeItem("auth_token")

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  // Sign a message with the wallet
  const signMessage = async (message: string): Promise<string> => {
    try {
      const signature = await signMessageAsync({ message })
      return signature
    } catch (error: any) {
      console.error("Error signing message:", error)
      throw new Error(error.message || "Failed to sign message")
    }
  }

  return (
    <WalletContext.Provider
      value={{
        address: address || null,
        isConnected,
        balance: balanceData?.formatted || "0",
        isAuthenticating: isPending,
        connect,
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
