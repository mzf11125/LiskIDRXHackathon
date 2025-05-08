"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { type ReactNode, useEffect, useState } from "react"
import { XellarKitProvider } from "@xellar/kit"

// Create a client for react-query
const queryClient = new QueryClient()

// Configure wagmi
const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [xellarConfig, setXellarConfig] = useState<{ appId: string }>({ appId: "" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch Xellar configuration from our secure API route
    async function fetchXellarConfig() {
      try {
        const response = await fetch("/api/xellar-auth")
        const data = await response.json()

        if (data.success) {
          setXellarConfig({ appId: data.appId || "" })
        } else {
          console.error("Failed to load Xellar configuration:", data.error)
        }
      } catch (error) {
        console.error("Error fetching Xellar configuration:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchXellarConfig()
  }, [])

  // Show a loading state while fetching the configuration
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider
          // The API key is now handled server-side and not exposed to the client
          appId={xellarConfig.appId}
        >
          {children}
        </XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
