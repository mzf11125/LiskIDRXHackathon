"use client";

import {
	createContext,
	useContext,
	// useState, // No longer needed
	type ReactNode,
	useEffect,
	useState,
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
import { config } from "@/data/mock-data";

// Define config and queryClient for XellarKit/Wagmi
// TODO: Replace with your actual project IDs


const queryClient = new QueryClient();

type WalletContextType = {
	address: string | undefined;
	isConnected: boolean;
	balance: string;
	connect: () => Promise<void>;
	disconnect: () => void;
	isAuthenticated: boolean; // Add authentication status
	authenticate: () => Promise<void>; // Add manual authentication
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
	disconnect: () => { },
	isAuthenticated: false,
	authenticate: async () => { },
});

export const useWallet = () => useContext(WalletContext);

// Inner component to handle context logic and wagmi hooks
function WalletStateController({ children }: { children: ReactNode }) {
	const { toast } = useToast();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const {
		address: wagmiAddress,
		isConnected: wagmiIsConnected,
		status: wagmiStatus,
	} = useAccount();
	const { data: wagmiBalanceData } = useBalance({ address: wagmiAddress });
	const { disconnect: wagmiDisconnect } = useDisconnect();
	const { signMessageAsync } = useSignMessage();

	const address = wagmiAddress;
	const isConnected = wagmiIsConnected;
	const balance = wagmiBalanceData?.formatted ?? "0";

	const { open } = useConnectModal();

	const baseUrl =
		process.env.NEXT_PUBLIC_API_URL;

	// Check if user is already authenticated
	useEffect(() => {
		const token = localStorage.getItem("access_token");
		setIsAuthenticated(!!token);

		// Listen for token expiration events
		const handleTokenExpired = () => {
			setIsAuthenticated(false);
			toast({
				variant: "destructive",
				title: "Session Expired",
				description: "Please reconnect your wallet to continue.",
			});
		};

		window.addEventListener('auth-token-expired', handleTokenExpired);
		return () => window.removeEventListener('auth-token-expired', handleTokenExpired);
	}, [toast]);

	const signAuthMessage = async () => {
		if (!address) {
			console.error("No wallet address available for authentication");
			throw new Error("No wallet address available");
		}

		try {
			console.log("Starting authentication for address:", address);
			
			const response = await axios.post(
				`${baseUrl}/auth/request-message`,
				{
					wallet_address: address,
				},
				{
					timeout: 10000,
				}
			);

			console.log("Message request response:", response.data);
			const { message } = response.data;
			
			if (!message) {
				throw new Error("No message received from server");
			}

			console.log("Requesting signature for message:", message);
			const signature = await signMessageAsync({ message });
			console.log("Signature received:", signature);

			const signatureResponse = await axios.post(
				`${baseUrl}/auth/verify`,
				{
					message: message,
					signature: signature,
					wallet_address: address,
				},
				{
					timeout: 10000,
				}
			);

			console.log("Verification response:", signatureResponse.data);
			const { access_token } = signatureResponse.data;
			
			if (!access_token) {
				throw new Error("No access token received from server");
			}

			console.log("Access token received and stored");
			localStorage.setItem("access_token", access_token);
			setIsAuthenticated(true);
			
			toast({
				title: "Authentication successful",
				description: "Your wallet has been authenticated.",
			});

			return access_token;
		} catch (error: any) {
			console.error("Error during authentication:", error);
			setIsAuthenticated(false);
			
			let errorMessage = "Failed to authenticate wallet";
			if (error.code === "ACTION_REJECTED" || error.code === "USER_REJECTED") {
				errorMessage = "Authentication cancelled by user";
			} else if (error.response?.status === 404) {
				errorMessage = "Authentication service not available";
			} else if (error.code === "NETWORK_ERROR" || error.name === "NetworkError") {
				errorMessage = "Network error during authentication";
			} else if (error.message) {
				errorMessage = error.message;
			}

			toast({
				variant: "destructive",
				title: "Authentication Error",
				description: errorMessage,
			});

			throw error;
		}
	};

	// Manual authentication function
	const authenticate = async () => {
		if (!address) {
			toast({
				variant: "destructive",
				title: "Wallet not connected",
				description: "Please connect your wallet first.",
			});
			return;
		}

		try {
			await signAuthMessage();
		} catch (error) {
			console.error("Manual authentication failed:", error);
		}
	};

	// Auto-authenticate when wallet connects
	useEffect(() => {
		if (wagmiStatus === "connected" && address) {
			console.log("Wallet connected successfully via wagmi:", address);
			
			// Check if we already have a token for this address
			const existingToken = localStorage.getItem("access_token");
			if (!existingToken) {
				// Add a small delay to ensure the connection is fully established
				setTimeout(() => {
					signAuthMessage().catch(console.error);
				}, 1000);
			} else {
				setIsAuthenticated(true);
			}
		} else if (wagmiStatus === "disconnected") {
			console.log("Wallet disconnected via wagmi");
			// Clear authentication data on disconnect
			localStorage.removeItem("access_token");
			setIsAuthenticated(false);
		}
	}, [wagmiStatus, address]);

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
		localStorage.removeItem("access_token");
		setIsAuthenticated(false);
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
				isAuthenticated,
				authenticate,
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
					showConfirmationModal={false}
				>
					<WalletStateController>{children}</WalletStateController>
				</XellarKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
