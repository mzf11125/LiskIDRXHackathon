"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import type { ReactNode } from "react"
import { XellarKitProvider } from "@xellar/kit"

// This is an alternative implementation that directly uses a hardcoded App ID
// You can swap this with the main web3-provider.tsx if needed

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

export function AlternativeWeb3Provider({ children }: { children: ReactNode }) {
  // Directly hardcode the App ID to ensure it's set
  const hardcodedAppId = "defi-lending-platform"

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider apiKey={process.env.NEXT_PUBLIC_XELLAR_API_KEY || ""} appId={hardcodedAppId}>
          {children}
        </XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
