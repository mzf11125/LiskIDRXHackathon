"use client";

import {
	createContext,
	useContext,
	// useState, // No longer needed
	type ReactNode,
	useEffect,
} from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSignMessage, WagmiProvider, type Config } from "wagmi";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	XellarKitProvider,
	defaultConfig,
	darkTheme,
	useConnectModal,
} from "@xellar/kit";
import axios from "axios";
import { liskSepolia } from "viem/chains";

// Define config and queryClient for XellarKit/Wagmi
// TODO: Replace with your actual project IDs
const config = defaultConfig({
	appName: "Ding Dong Loans", // You can customize your app name
	walletConnectProjectId:
		process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
	xellarAppId: process.env.NEXT_PUBLIC_XELLAR_APP_ID || "",
	xellarEnv: "production", // Or "production"
	ssr: true, // Required for Next.js App Router

	chains: [
		{
			id: 4202,
			name: "Lisk Sepolia Testnet",
			nativeCurrency: {
				name: "Sepolia Ether",
				symbol: "ETH",
				decimals: 18,
			},
			rpcUrls: {
				default: {
					http: ["https://rpc.sepolia-api.lisk.com"],
				},
				public: {
					http: ["https://rpc.sepolia-api.lisk.com"],
				},
			},
			blockExplorers: {
				default: {
					name: "Lisk Blockscout",
					url: "https://sepolia-blockscout.lisk.com",
				},
			},
			testnet: true,
		},
	], // Add your desired chains here
}) as Config;

const queryClient = new QueryClient();

type WalletContextType = {
	address: string | undefined; // Updated from string | null
	isConnected: boolean;
	balance: string;
	connect: () => Promise<void>; // Kept for interface, implementation changed
	disconnect: () => void;
};

const WalletContext = createContext<WalletContextType>({
	address: undefined,
	isConnected: false,
	balance: "0",
	connect: async () => {
		console.warn(
			"Connect function should be triggered by XellarKit UI components."
		);
	},
	disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

// Inner component to handle context logic and wagmi hooks
function WalletStateController({ children }: { children: ReactNode }) {
	const { toast } = useToast();

	const {
		address: wagmiAddress,
		isConnected: wagmiIsConnected,
		status: wagmiStatus,
	} = useAccount();
	const { data: wagmiBalanceData } = useBalance({ address: wagmiAddress });
	const { disconnect: wagmiDisconnect } = useDisconnect();
	const { signMessage } = useSignMessage();

	const address = wagmiAddress;
	const isConnected = wagmiIsConnected;
	const balance = wagmiBalanceData?.formatted ?? "0";

	const { open } = useConnectModal();

	const baseUrl =
		process.env.NEXT_PUBLIC_API_URL || "https://api.dingdong.loans";

	const signAuthMessage = async () => {
		try {
			const response = await axios.post(
				`${baseUrl}/auth/request-message`,
				{
					wallet_address: address,
				}
			);

			const { message } = response.data;
			const signature = signMessage({ message });

			const signatureResponse = await axios.post(
				`${baseUrl}/auth/verify`,
				{
					message: message,
					signature: signature,
					wallet_address: address,
				}
			);

			const { access_token } = signatureResponse.data;
			console.log("Access token received:", access_token);

			console.log("Message signed successfully:", signature);
		} catch (error) {
			console.error("Error requesting or signing message:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to authenticate wallet",
			});
		}
	};

	useEffect(() => {
		if (wagmiStatus === "connected") {
			console.log("Wallet connected successfully via wagmi:", address);
			signAuthMessage();
		} else if (wagmiStatus === "disconnected") {
			console.log("Wallet disconnected via wagmi");
		}
	}, [wagmiStatus, address, toast]);

	const connect = async () => {
		console.warn(
			"Programmatic connect via context is not standard with XellarKit. Please use XellarKit's UI components."
		);
		toast({
			variant: "default",
			title: "Connect Wallet",
			description:
				"Please use the dedicated UI button to connect your wallet.",
		});
		open();
	};

	const disconnect = () => {
		wagmiDisconnect();
		console.log("Wallet disconnect initiated via context");
		toast({
			title: "Wallet disconnected",
			description: "Your wallet has been disconnected.",
		});
	};

	return (
		<WalletContext.Provider
			value={{
				address,
				isConnected,
				balance,
				connect,
				disconnect,
			}}
		>
			{children}
		</WalletContext.Provider>
	);
}

// Main WalletProvider component
export function WalletProvider({ children }: { children: ReactNode }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<XellarKitProvider
					theme={darkTheme}
					showConfirmationModal={true}
				>
					<WalletStateController>{children}</WalletStateController>
				</XellarKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
