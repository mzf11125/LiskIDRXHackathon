"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAccount, useConnect, useDisconnect, useBalance, useSignMessage } from "wagmi"
import { injected, coinbase, walletConnect } from "wagmi/connectors"
import { authAPI } from "@/services/api"

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
  const { connectAsync, isPending } = useConnect()
  const { disconnect: disconnectWallet } = useDisconnect()
  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
    enabled: !!address,
  })
  const { signMessageAsync } = useSignMessage()

  // Connect wallet and authenticate
  const connect = async () => {
    try {
      // Connect using Wagmi with multiple connector options
      const result = await connectAsync({
        connector: injected(),
        chainId: 1 // Ethereum mainnet by default
      }).catch(() => 
        connectAsync({
          connector: coinbase(),
          chainId: 1
        })
      ).catch(() => 
        connectAsync({
          connector: walletConnect(),
          chainId: 1
        })
      )

      const walletAddress = result.accounts[0]

      // Request message to sign from the backend
      const { message } = await authAPI.requestMessage(walletAddress)

      // Sign the message using Wagmi's signMessage
      const signature = await signMessage(message)

      // Verify signature with backend
      const authData = await authAPI.verifySignature(walletAddress, message, signature)

      // Save auth token
      localStorage.setItem("auth_token", authData.access_token)

      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected and authenticated",
      })
    } catch (error: any) {
      console.error("Connection failed:", error)
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "Failed to connect wallet. Please try again.",
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
