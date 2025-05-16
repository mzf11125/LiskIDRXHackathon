"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
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
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("0")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const { toast } = useToast()

  const isConnected = !!address

  // Check if user is already connected on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem("wallet_address")
    const authToken = localStorage.getItem("auth_token")

    if (storedAddress && authToken) {
      setAddress(storedAddress)
      // In a real app, you would fetch the actual balance here
      setBalance("1000.00")
    }
  }, [])

  // Connect wallet and authenticate
  const connect = async () => {
    try {
      setIsAuthenticating(true)

      // Check if window.ethereum is available
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet found. Please install MetaMask or another wallet.")
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const walletAddress = accounts[0]

      // Request message to sign
      const { message } = await authAPI.requestMessage(walletAddress)

      // Sign the message
      const signature = await signMessage(message)

      // Verify signature
      const authData = await authAPI.verifySignature(walletAddress, message, signature)

      // Save auth token and address
      localStorage.setItem("auth_token", authData.access_token)
      localStorage.setItem("wallet_address", walletAddress)

      // Update state
      setAddress(walletAddress)

      // In a real app, you would fetch the actual balance here
      setBalance("1000.00")

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
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    setAddress(null)
    setBalance("0")
    localStorage.removeItem("auth_token")
    localStorage.removeItem("wallet_address")

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  // Sign a message with the wallet
  const signMessage = async (message: string): Promise<string> => {
    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet found")
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const from = accounts[0]

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, from],
      })

      return signature
    } catch (error: any) {
      console.error("Error signing message:", error)
      throw new Error(error.message || "Failed to sign message")
    }
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        balance,
        isAuthenticating,
        connect,
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
