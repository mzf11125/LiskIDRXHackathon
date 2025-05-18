"use client";

import { ethers } from "ethers";
import { useState, useCallback } from "react";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "./use-toast";

// Import contract constants
import {
  LENDING_CONTRACT_ABI,
  LENDING_CONTRACT_ADDRESS,
  USDT_TOKEN_ADDRESS,
  IDRX_TOKEN_ADDRESS,
  ERC20_ABI,
  TransactionResult,
} from "@/services/contract-constants";

// Using TransactionResult type from contract-constants

export function useLendingContract() {
  const { provider, address, isConnected } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Ensure we have a valid wallet connection
  const getProvider = useCallback(() => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (!provider) {
      throw new Error("Provider not available");
    }

    // Ensure we're using a Web3Provider
    if (!(provider instanceof ethers.providers.Web3Provider)) {
      console.warn("Expected Web3Provider, using window.ethereum");
      return new ethers.providers.Web3Provider(window.ethereum);
    }

    return provider;
  }, [provider, isConnected, address]);

  // Get contract instance
  const getContract = useCallback(() => {
    const provider = getProvider();
    const signer = provider.getSigner();
    return new ethers.Contract(
      LENDING_CONTRACT_ADDRESS,
      LENDING_CONTRACT_ABI,
      signer
    );
  }, [getProvider]);

  // Get token contract (USDT or IDRX)
  const getTokenContract = useCallback(
    (tokenAddress: string) => {
      const provider = getProvider();
      const signer = provider.getSigner();
      return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    },
    [getProvider]
  );

  // Approve tokens for spending
  const approveToken = useCallback(
    async (
      tokenAddress: string,
      amount: string
    ): Promise<TransactionResult> => {
      setIsLoading(true);
      try {
        const tokenContract = getTokenContract(tokenAddress);
        const amountWei = ethers.utils.parseUnits(amount, 18);

        toast({
          title: "Approving tokens",
          description: `Approving ${amount} tokens for the lending contract...`,
        });

        const tx = await tokenContract.approve(
          LENDING_CONTRACT_ADDRESS,
          amountWei
        );
        await tx.wait();

        toast({
          title: "Approval successful",
          description: "Tokens approved for lending contract",
        });

        return {
          success: true,
          hash: tx.hash,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Token approval failed:", errorMessage);
        toast({
          variant: "destructive",
          title: "Approval failed",
          description: errorMessage,
        });
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [getTokenContract, toast]
  );

  // Take a loan
  const takeLoan = useCallback(
    async (amount: string): Promise<TransactionResult> => {
      setIsLoading(true);
      try {
        const contract = getContract();
        const amountWei = ethers.utils.parseUnits(amount, 18);

        toast({
          title: "Taking loan",
          description: `Taking a loan of ${amount}...`,
        });

        const tx = await contract.takeLoan(amountWei);
        await tx.wait();

        toast({
          title: "Transaction successful",
          description: `Successfully took a loan of ${amount}`,
        });

        return {
          success: true,
          hash: tx.hash,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Taking loan failed:", errorMessage);
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: errorMessage,
        });
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [getContract, toast]
  );

  // Repay a loan
  const repayLoan = useCallback(
    async (amount: string): Promise<TransactionResult> => {
      setIsLoading(true);
      try {
        // First approve USDT spending
        const approvalResult = await approveToken(USDT_TOKEN_ADDRESS, amount);
        if (!approvalResult.success) {
          throw new Error(approvalResult.error || "Failed to approve USDT");
        }

        const contract = getContract();
        const amountWei = ethers.utils.parseUnits(amount, 18);

        toast({
          title: "Repaying loan",
          description: `Repaying loan of ${amount}...`,
        });

        const tx = await contract.repayLoan(amountWei);
        await tx.wait();

        toast({
          title: "Transaction successful",
          description: `Successfully repaid ${amount} of your loan`,
        });

        return {
          success: true,
          hash: tx.hash,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Loan repayment failed:", errorMessage);
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: errorMessage,
        });
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [approveToken, getContract, toast]
  );

  // Fund a user
  const fundUser = useCallback(
    async (amount: string, userAddress: string): Promise<TransactionResult> => {
      setIsLoading(true);
      try {
        // First approve USDT spending
        const approvalResult = await approveToken(USDT_TOKEN_ADDRESS, amount);
        if (!approvalResult.success) {
          throw new Error(approvalResult.error || "Failed to approve USDT");
        }

        const contract = getContract();
        const amountWei = ethers.utils.parseUnits(amount, 18);

        toast({
          title: "Funding user",
          description: `Funding user ${userAddress.substring(
            0,
            8
          )}... with ${amount}...`,
        });

        const tx = await contract.fundUser(amountWei, userAddress);
        await tx.wait();

        toast({
          title: "Transaction successful",
          description: `Successfully funded user with ${amount}`,
        });

        return {
          success: true,
          hash: tx.hash,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Funding user failed:", errorMessage);
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: errorMessage,
        });
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [approveToken, getContract, toast]
  );

  // Repay a funder with interest
  const repayFunder = useCallback(
    async (amount: string, interest: string): Promise<TransactionResult> => {
      setIsLoading(true);
      try {
        // First approve USDT spending for the total amount (principal + interest)
        const totalAmount = (
          Number.parseFloat(amount) + Number.parseFloat(interest)
        ).toString();
        const approvalResult = await approveToken(
          USDT_TOKEN_ADDRESS,
          totalAmount
        );
        if (!approvalResult.success) {
          throw new Error(approvalResult.error || "Failed to approve USDT");
        }

        const contract = getContract();
        const amountWei = ethers.utils.parseUnits(amount, 18);
        const interestWei = ethers.utils.parseUnits(interest, 18);

        toast({
          title: "Repaying funder",
          description: `Repaying funder with ${amount} + ${interest} interest...`,
        });

        const tx = await contract.repayFunder(amountWei, interestWei);
        await tx.wait();

        toast({
          title: "Transaction successful",
          description: `Successfully repaid funder with ${totalAmount} (principal + interest)`,
        });

        return {
          success: true,
          hash: tx.hash,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Repaying funder failed:", errorMessage);
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: errorMessage,
        });
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [approveToken, getContract, toast]
  );

  // Start collateral raising
  const startCollateralRaising = useCallback(
    async (amount: string): Promise<TransactionResult> => {
      setIsLoading(true);
      try {
        const contract = getContract();
        const amountWei = ethers.utils.parseUnits(amount, 18);

        toast({
          title: "Starting collateral raising",
          description: `Starting collateral raising for ${amount}...`,
        });

        const tx = await contract.startCollateralRaising(amountWei);
        await tx.wait();

        toast({
          title: "Transaction successful",
          description: `Successfully started collateral raising for ${amount}`,
        });

        return {
          success: true,
          hash: tx.hash,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Starting collateral raising failed:", errorMessage);
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: errorMessage,
        });
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [getContract, toast]
  );

  // Close raising
  const closeRaising = useCallback(async (): Promise<TransactionResult> => {
    setIsLoading(true);
    try {
      const contract = getContract();

      toast({
        title: "Closing raising",
        description: "Closing the collateral raising period...",
      });

      const tx = await contract.closeRaising();
      await tx.wait();

      toast({
        title: "Transaction successful",
        description: "Successfully closed collateral raising",
      });

      return {
        success: true,
        hash: tx.hash,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Closing raising failed:", errorMessage);
      toast({
        variant: "destructive",
        title: "Transaction failed",
        description: errorMessage,
      });
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [getContract, toast]);

  // Read functions

  // Get user's remaining debt
  const getUserRemainingDebt = useCallback(
    async (userAddress?: string): Promise<string> => {
      try {
        const contract = getContract();
        const targetAddress = userAddress || address;

        if (!targetAddress) {
          throw new Error("No address specified");
        }

        const result = await contract.getUserRemainingDebt(targetAddress);
        return ethers.utils.formatUnits(result, 18);
      } catch (error) {
        console.error("Failed to get user remaining debt:", error);
        return "0";
      }
    },
    [getContract, address]
  );

  // Get user's collateral
  const getUserCollateral = useCallback(
    async (userAddress?: string): Promise<string> => {
      try {
        const contract = getContract();
        const targetAddress = userAddress || address;

        if (!targetAddress) {
          throw new Error("No address specified");
        }

        const result = await contract.getUserCollateral(targetAddress);
        return ethers.utils.formatUnits(result, 18);
      } catch (error) {
        console.error("Failed to get user collateral:", error);
        return "0";
      }
    },
    [getContract, address]
  );

  // Get funder's balance
  const getFunderBalance = useCallback(
    async (funderAddress?: string): Promise<string> => {
      try {
        const contract = getContract();
        const targetAddress = funderAddress || address;

        if (!targetAddress) {
          throw new Error("No address specified");
        }

        const result = await contract.getFunderBalance(targetAddress);
        return ethers.utils.formatUnits(result, 18);
      } catch (error) {
        console.error("Failed to get funder balance:", error);
        return "0";
      }
    },
    [getContract, address]
  );

  // Get total collateral in the contract
  const getTotalCollateral = useCallback(async (): Promise<string> => {
    try {
      const contract = getContract();
      const result = await contract.getTotalCollateral();
      return ethers.utils.formatUnits(result, 18);
    } catch (error) {
      console.error("Failed to get total collateral:", error);
      return "0";
    }
  }, [getContract]);

  // Get collateral raising goal
  const getCollateralRaisingGoal = useCallback(async (): Promise<string> => {
    try {
      const contract = getContract();
      const result = await contract.getCollateralRaisingGoal();
      return ethers.utils.formatUnits(result, 18);
    } catch (error) {
      console.error("Failed to get collateral raising goal:", error);
      return "0";
    }
  }, [getContract]);

  // Get collateral raised so far
  const getCollateralRaised = useCallback(async (): Promise<string> => {
    try {
      const contract = getContract();
      const result = await contract.getCollateralRaised();
      return ethers.utils.formatUnits(result, 18);
    } catch (error) {
      console.error("Failed to get collateral raised:", error);
      return "0";
    }
  }, [getContract]);

  return {
    isLoading,
    approveToken,
    takeLoan,
    repayLoan,
    fundUser,
    repayFunder,
    startCollateralRaising,
    closeRaising,
    getUserRemainingDebt,
    getUserCollateral,
    getFunderBalance,
    getTotalCollateral,
    getCollateralRaisingGoal,
    getCollateralRaised,
  };
}
