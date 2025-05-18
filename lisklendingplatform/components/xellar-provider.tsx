"use client";

import type { ReactNode } from "react";
import { XellarProvider } from "@xellar/kit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

// Custom chain configuration for Lisk Sepolia
const liskSepolia = {
  ...sepolia,
  id: 4202, // Lisk Sepolia chain ID
  name: "Lisk Sepolia",
  network: "lisk-sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://lisk-sepolia.huostarter.io"],
    },
    public: {
      http: ["https://lisk-sepolia.huostarter.io"],
    },
  },
  blockExplorers: {
    etherscan: { name: "Sepolia", url: "https://sepolia.etherscan.io" },
    default: { name: "Sepolia", url: "https://sepolia.etherscan.io" },
  },
};

// Configure chains and providers
const { chains, publicClient } = configureChains(
  [liskSepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
    }),
  ]
);

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
});

// Get project ID from env
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

// Main XellarProvider component that wraps the app
export function XellarAppProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <XellarProvider
        projectId={projectId}
        chains={chains}
        metadata={{
          name: "DINGDONG.loans Lending Platform",
          description: "Decentralized lending platform on Lisk",
          url: "https://dingdong.loans",
          icons: ["https://dingdong.loans/favicon.ico"],
        }}
      >
        {children}
      </XellarProvider>
    </WagmiConfig>
  );
}

// Note: In a production environment, you would replace this with the actual Xellar implementation
// This is a simplified version for the preview environment
