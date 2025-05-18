"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useEffect,
} from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAccount, useDisconnect, useBalance, useSignMessage } from "wagmi";
import { authAPI } from "@/services/api";
import { useConnectModal } from "@xellar/kit";

type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  balance: string;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
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
    enabled: !!address,
  });
  const { signMessageAsync } = useSignMessage();

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
  }, [isConnected, address]);

  // Authenticate with backend using wallet signature
  const authenticate = async (): Promise<boolean> => {
    if (!address) return false;

    setIsAuthenticating(true);
    try {
      // Request message to sign from the backend
      const { message } = await authAPI.requestMessage(address);

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
      );

      // Save auth token
      localStorage.setItem("auth_token", authData.access_token);
      setIsAuthenticated(true);

      toast({
        title: "Authentication successful",
        description: "You've been successfully authenticated",
      });
      return true;
    } catch (error: any) {
      console.error("Authentication failed:", error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description:
          error.message ||
          "Failed to authenticate with your wallet. Please try again.",
      });
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Connect wallet using Xellar modal
  const connect = async () => {
    try {
      // Open Xellar's connect modal
      openConnectModal();

      toast({
        title: "Connect wallet",
        description: "Please select your wallet in the modal",
      });
    } catch (error: any) {
      console.error("Connection failed:", error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description:
          error.message || "Failed to open wallet modal. Please try again.",
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
      return signature;
    } catch (error: any) {
      console.error("Error signing message:", error);
      throw new Error(error.message || "Failed to sign message");
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
        connect,
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
