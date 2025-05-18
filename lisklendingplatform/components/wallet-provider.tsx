"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  useAccount,
  useDisconnect,
  useBalance,
  useSignMessage,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import type { PublicClient, WalletClient } from "viem";
import { authAPI } from "@/services/api";
import { useConnectModal } from "@xellar/kit";

type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  balance: string;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
};

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  balance: "0",
  isAuthenticating: false,
  isAuthenticated: false,
  publicClient: null,
  walletClient: null,
  connect: async () => {},
  disconnect: () => {},
  signMessage: async () => "",
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Use Wagmi hooks from Xellar Kit
  const { address, isConnected } = useAccount();
  const { open: openConnectModal } = useConnectModal();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { data: balanceData, isPending } = useBalance({
    address: address as `0x${string}` | undefined,
    query: { enabled: !!address },
  });
  const { signMessageAsync } = useSignMessage();

  // Use Xellar SDK via wagmi hooks to get clients for blockchain interactions
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Authenticate with backend using wallet signature
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!address) return false;

    setIsAuthenticating(true);
    try {
      // Request message to sign from the backend
      const result = await authAPI.requestMessage(address);
      const message = result?.message || "";

      if (!message) {
        throw new Error("Failed to receive authentication message from server");
      }

      toast({
        title: "Signature required",
        description: "Please sign the message to authenticate",
      });

      // Sign the message using Wagmi's signMessage
      const signature = await signMessageAsync({ message });

      // Verify signature with backend
      const authData = await authAPI.verifySignature(
        address,
        message,
        signature
      ); // Save auth token if available
      if (authData?.access_token) {
        localStorage.setItem("auth_token", authData.access_token);
        setIsAuthenticated(true);

        toast({
          title: "Authentication successful",
          description: "You've been successfully authenticated",
        });
        return true;
      }

      throw new Error("No access token received");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Authentication failed:", errorMessage);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description:
          errorMessage ||
          "Failed to authenticate with your wallet. Please try again.",
      });
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync, toast]);

  // Check if user is authenticated on mount or address change
  useEffect(() => {
    const checkAuthentication = async () => {
      if (isConnected && address) {
        const isAuth = authAPI.isAuthenticated();
        const storedAddress = localStorage.getItem("wallet_address");

        // If authenticated but with a different wallet, logout
        if (
          isAuth &&
          storedAddress &&
          storedAddress.toLowerCase() !== address.toLowerCase()
        ) {
          console.log("Wallet address changed, logging out");
          authAPI.logout();
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(isAuth);

        // If connected but not authenticated, try to authenticate
        if (!isAuth) {
          try {
            await authenticate();
          } catch (error) {
            console.error("Auto-authentication failed:", error);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [isConnected, address, authenticate]);

  // Connect wallet using Xellar modal
  const connect = async () => {
    try {
      // Open Xellar's connect modal
      openConnectModal();

      toast({
        title: "Connect wallet",
        description: "Please select your wallet in the modal",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to open wallet modal";
      console.error("Connection failed:", error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: errorMessage,
      });
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    disconnectWallet();
    authAPI.logout();
    setIsAuthenticated(false);

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  // Sign a message with the wallet
  const signMessage = async (message: string): Promise<string> => {
    try {
      const signature = await signMessageAsync({ message });
      return signature as string;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign message";
      console.error("Error signing message:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address: address || null,
        isConnected,
        balance: balanceData?.formatted || "0",
        isAuthenticating: isAuthenticating || isPending,
        isAuthenticated,
        publicClient: publicClient || null,
        walletClient: walletClient || null,
        connect,
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
