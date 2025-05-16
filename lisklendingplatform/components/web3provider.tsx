"use client"
  
import React from "react";
import { Config, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, defaultConfig, darkTheme } from "@xellar/kit";
import { polygonAmoy } from "viem/chains";

// Use the environment variables correctly
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
const xellarAppId = process.env.NEXT_PUBLIC_XELLAR_APP_ID || "08e4a3bd-2ecf-4c26-83d4-45f06094d372";

// Log the values to debug (you can remove this in production)
console.log("WCID:", walletConnectProjectId);
console.log("XellarAppID:", xellarAppId);

const config = defaultConfig({
  appName: "IDRX Lisk Lending Platform",
  walletConnectProjectId,
  xellarAppId,
  xellarEnv: "sandbox",
  chains: [polygonAmoy],
}) as Config;

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider theme={darkTheme}>{children}</XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;