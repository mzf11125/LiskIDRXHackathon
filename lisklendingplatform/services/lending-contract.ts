import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { LENDING_CONTRACT_ABI, LENDING_CONTRACT_ADDRESS, ERC20_ABI, USDT_TOKEN_ADDRESS, IDRX_TOKEN_ADDRESS, TransactionResult } from "./contract-constants";

/**
 * Hook for using the lending contract with Xellar wallet integration
 * Uses wagmi hooks instead of ethers.js
 */
export function useLendingContract() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const checkConnection = () => {
    if (!isConnected || !walletClient || !address) {
      throw new Error("Wallet not connected");
    }
    return { walletClient, address };
  };

  /**
   * Approve token spending for the contract
   */
  const approveToken = async (
    tokenAddress: string,
    amount: string
  ): Promise<TransactionResult> => {
    try {
      const { walletClient, address } = checkConnection();

      // Convert amount to wei (assuming 18 decimals, adjust if different)
      const amountWei = parseUnits(amount, 18);

      // Approve token spending
      const hash = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [LENDING_CONTRACT_ADDRESS, amountWei],
      });

      return {
        success: true,
        hash: hash,
      };
    } catch (error: any) {
      console.error("Error approving token:", error);
      return {
        success: false,
        error: error.message || "Failed to approve token",
      };
    }
  };

  return {
    /**
     * Take a loan
     */
    takeLoan: async (amount: string): Promise<TransactionResult> => {
      try {
        const { walletClient } = checkConnection();

        // Convert amount to wei (assuming 18 decimals, adjust if different)
        const amountWei = parseUnits(amount, 18);

        const hash = await walletClient.writeContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "takeLoan",
          args: [amountWei],
        });

        return {
          success: true,
          hash: hash,
        };
      } catch (error: any) {
        console.error("Error taking loan:", error);
        return {
          success: false,
          error: error.message || "Failed to take loan",
        };
      }
    },

    /**
     * Repay loan
     */
    repayLoan: async (amount: string): Promise<TransactionResult> => {
      try {
        const { walletClient } = checkConnection();

        // Convert amount to wei (assuming 18 decimals, adjust if different)
        const amountWei = parseUnits(amount, 18);

        // First approve USDT spending
        const approveResult = await approveToken(
          USDT_TOKEN_ADDRESS,
          amount
        );

        if (!approveResult.success) {
          throw new Error(approveResult.error || "Failed to approve USDT");
        }

        const hash = await walletClient.writeContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "repayLoan",
          args: [amountWei],
        });

        return {
          success: true,
          hash: hash,
        };
      } catch (error: any) {
        console.error("Error repaying loan:", error);
        return {
          success: false,
          error: error.message || "Failed to repay loan",
        };
      }
    },

    /**
     * Fund a user
     */
    fundUser: async (amount: string, userAddress: string): Promise<TransactionResult> => {
      try {
        const { walletClient } = checkConnection();

        // Convert amount to wei (assuming 18 decimals, adjust if different)
        const amountWei = parseUnits(amount, 18);

        // First approve USDT spending
        const approveResult = await approveToken(
          USDT_TOKEN_ADDRESS,
          amount
        );

        if (!approveResult.success) {
          throw new Error(approveResult.error || "Failed to approve USDT");
        }

        const hash = await walletClient.writeContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "fundUser",
          args: [amountWei, userAddress as `0x${string}`],
        });

        return {
          success: true,
          hash: hash,
        };
      } catch (error: any) {
        console.error("Error funding user:", error);
        return {
          success: false,
          error: error.message || "Failed to fund user",
        };
      }
    },

    /**
     * Repay funder with interest
     */
    repayFunder: async (
      amount: string,
      interest: string
    ): Promise<TransactionResult> => {
      try {
        const { walletClient } = checkConnection();

        // Convert amounts to wei (assuming 18 decimals, adjust if different)
        const amountWei = parseUnits(amount, 18);
        const interestWei = parseUnits(interest, 18);

        // First approve USDT spending for amount
        const approveUSDTResult = await approveToken(
          USDT_TOKEN_ADDRESS,
          amount
        );

        if (!approveUSDTResult.success) {
          throw new Error(approveUSDTResult.error || "Failed to approve USDT");
        }

        // Then approve IDRX spending for interest
        const approveIDRXResult = await approveToken(
          IDRX_TOKEN_ADDRESS,
          interest
        );

        if (!approveIDRXResult.success) {
          throw new Error(approveIDRXResult.error || "Failed to approve IDRX");
        }

        const hash = await walletClient.writeContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "repayFunder",
          args: [amountWei, interestWei],
        });

        return {
          success: true,
          hash: hash,
        };
      } catch (error: any) {
        console.error("Error repaying funder:", error);
        return {
          success: false,
          error: error.message || "Failed to repay funder",
        };
      }
    },

    /**
     * Start collateral raising
     */
    startCollateralRaising: async (amount: string): Promise<TransactionResult> => {
      try {
        const { walletClient } = checkConnection();

        // Convert amount to wei (assuming 18 decimals, adjust if different)
        const amountWei = parseUnits(amount, 18);

        const hash = await walletClient.writeContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "startCollateralRaising",
          args: [amountWei],
        });

        return {
          success: true,
          hash: hash,
        };
      } catch (error: any) {
        console.error("Error starting collateral raising:", error);
        return {
          success: false,
          error: error.message || "Failed to start collateral raising",
        };
      }
    },

    /**
     * Close raising
     */
    closeRaising: async (): Promise<TransactionResult> => {
      try {
        const { walletClient } = checkConnection();

        const hash = await walletClient.writeContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "closeRaising",
          args: [],
        });

        return {
          success: true,
          hash: hash,
        };
      } catch (error: any) {
        console.error("Error closing raising:", error);
        return {
          success: false,
          error: error.message || "Failed to close raising",
        };
      }
    },

    /**
     * Get user's remaining debt
     */
    getUserRemainingDebt: async (userAddress?: string): Promise<string> => {
      try {
        const { address: connectedAddress } = checkConnection();
        const targetAddress = userAddress || connectedAddress;

        const debtWei = await publicClient.readContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "getUserRemainingDebt",
          args: [targetAddress as `0x${string}`],
        });

        return formatUnits(debtWei as bigint, 18);
      } catch (error) {
        console.error("Error getting user debt:", error);
        return "0";
      }
    },

    /**
     * Get user's collateral
     */
    getUserCollateral: async (userAddress?: string): Promise<string> => {
      try {
        const { address: connectedAddress } = checkConnection();
        const targetAddress = userAddress || connectedAddress;

        const collateralWei = await publicClient.readContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "getUserCollateral",
          args: [targetAddress as `0x${string}`],
        });

        return formatUnits(collateralWei as bigint, 18);
      } catch (error) {
        console.error("Error getting user collateral:", error);
        return "0";
      }
    },

    /**
     * Get funder's balance
     */
    getFunderBalance: async (funderAddress?: string): Promise<string> => {
      try {
        const { address: connectedAddress } = checkConnection();
        const targetAddress = funderAddress || connectedAddress;

        const balanceWei = await publicClient.readContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "getFunderBalance",
          args: [targetAddress as `0x${string}`],
        });

        return formatUnits(balanceWei as bigint, 18);
      } catch (error) {
        console.error("Error getting funder balance:", error);
        return "0";
      }
    },

    /**
     * Get total collateral in the contract
     */
    getTotalCollateral: async (): Promise<string> => {
      try {
        const totalCollateralWei = await publicClient.readContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "getTotalCollateral",
          args: [],
        });

        return formatUnits(totalCollateralWei as bigint, 18);
      } catch (error) {
        console.error("Error getting total collateral:", error);
        return "0";
      }
    },

    /**
     * Get collateral raising goal
     */
    getCollateralRaisingGoal: async (): Promise<string> => {
      try {
        const goalWei = await publicClient.readContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "getCollateralRaisingGoal",
          args: [],
        });

        return formatUnits(goalWei as bigint, 18);
      } catch (error) {
        console.error("Error getting collateral raising goal:", error);
        return "0";
      }
    },

    /**
     * Get amount of collateral raised so far
     */
    getCollateralRaised: async (): Promise<string> => {
      try {
        const raisedWei = await publicClient.readContract({
          address: LENDING_CONTRACT_ADDRESS,
          abi: LENDING_CONTRACT_ABI,
          functionName: "getCollateralRaised",
          args: [],
        });

        return formatUnits(raisedWei as bigint, 18);
      } catch (error) {
        console.error("Error getting collateral raised:", error);
        return "0";
      }
    },
  };
}
