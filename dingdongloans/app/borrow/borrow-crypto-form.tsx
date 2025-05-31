"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { contractAddress, pools } from "@/data/mock-data";
import { useWallet } from "@/components/wallet-provider";
import { Progress } from "@/components/ui/progress";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, type Config } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { lendingABI } from "@/contracts/lendingABI";
import { parseUnits, formatUnits, decodeErrorResult } from "viem/utils";

import { getTransactionError, getUserFriendlyError } from "@/lib/errorHandling";
const formSchema = z.object({
  borrowAsset: z.string({
    required_error: "Please select an asset to borrow.",
  }),
  borrowAmount: z.string().min(1, {
    message: "Please enter an amount to borrow.",
  }),
  loanTerm: z.string({
    required_error: "Please select a loan term.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface BorrowCryptoFormProps {
  onSuccess: () => void;
}

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function BorrowCryptoForm({ onSuccess }: BorrowCryptoFormProps) {
  const { toast } = useToast();

  const { address } = useAccount();
  // Get all available assets from pools
  const allAssets = pools.flatMap((pool) => pool.assets);

  // State for calculated values
  const [borrowValue, setBorrowValue] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      borrowAsset: "",
      borrowAmount: "",
      loanTerm: "30",
    },
  });

  const { data: totalCollateralValue } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: lendingABI,
    args: address ? [address] : undefined,
    functionName: "getTotalCollateralValueInDebtToken",
    query: {
      enabled: !!address
    }
  });
  // Watch form values to update calculations
  const borrowAsset = form.watch("borrowAsset");
  const borrowAmount = form.watch("borrowAmount");
  const loanTerm = form.watch("loanTerm");
  // Update calculations when form values change
  useEffect(() => {
    if (borrowAsset && borrowAmount) {
      // In a real app, these would be actual calculations based on market data
      const borrowAssetPrice = Number.parseFloat(
        allAssets
          .find((a) => a.symbol === borrowAsset)
          ?.price.replace("$", "")
          .replace(",", "") || "0"
      );

      const borrowAmountValue = Number.parseFloat(borrowAmount) * borrowAssetPrice;
      setBorrowValue(borrowAmountValue);

      // Set interest rate based on asset and term
      const baseRate = Number.parseFloat(
        allAssets.find((a) => a.symbol === borrowAsset)?.apr.replace("%", "") ||
        "0"
      );
      const termMultiplier =
        Number.parseInt(loanTerm) === 30
          ? 1
          : Number.parseInt(loanTerm) === 90
            ? 0.95
            : 0.9;
      setInterestRate(baseRate * termMultiplier);
    }
  }, [
    borrowAsset,
    borrowAmount,
    loanTerm,
    allAssets,
  ]);

  const {
    data: regularTxHash,
    isPending: isRegularTxPending,
    writeContractAsync: writeRegularTx,
    error: regularTxError,
  } = useWriteContract();

  // Regular transaction confirmation
  const {
    isLoading: isRegularTxConfirming,
    isSuccess: isRegularTxConfirmed,
    isError: isRegularTxFailed,
  } = useWaitForTransactionReceipt({
    hash: regularTxHash,
  });

  const handleTakeLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;


  };
  async function onSubmit(values: FormValues) {
    if (!isConfirmStep) {
      setIsConfirmStep(true);
      return;
    }

    try {
      // Send borrow transaction
      const borrowResult = await writeRegularTx({
        address: contractAddress,
        abi: lendingABI,
        functionName: "takeLoan",
        // TOKEN IDRX ONLY
        args: [parseUnits(borrowAmount, 2)],
      });

      if (!borrowResult) {
        console.error("Failed to submit borrow transaction");
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: "Failed to submit borrow transaction",
        });
        return;
      }

      toast({
        title: "Borrow transaction submitted",
        description: "Waiting for confirmation...",
      });

      console.log("Borrow transaction submitted:", borrowResult);

      // Wait for borrow transaction to be confirmed
      const borrowReceipt = await waitForTransactionReceipt(config, {
        hash: borrowResult,
      });

      console.log("Borrow confirmed in block:", borrowReceipt.blockNumber);

      toast({
        title: "Borrow successful!",
        description: `You have successfully borrowed ${values.borrowAmount} ${values.borrowAsset}`,
      });

      onSuccess();
    } catch (error) {
      console.error("Transaction failed:", error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      const match = errorMessage.match(/data="([^"]+)"/);

      if (match && match[1]) {
        const parsedError = match[1].split(",")[0];
        try {
          const decodedError = decodeErrorResult({
            abi: lendingABI,
            data: parsedError as `0x${string}`,
          });

          // Get user-friendly error message based on error name
          const userMessage = getUserFriendlyError(decodedError.errorName);

          console.error("Transaction failed:", {
            errorName: decodedError.errorName,
            args: decodedError.args,
            userMessage,
          });

          toast({
            variant: "destructive",
            title: "Transaction failed",
            description: userMessage,
          });
        } catch (decodeError) {
          console.error("Failed to decode contract error:", decodeError);
          toast({
            variant: "destructive",
            title: "Transaction failed",
            description: "Failed to decode contract error",
          });
        }
      } else {
        // Handle non-contract errors (e.g. network errors, user rejected, etc)
        const friendlyMessage = getTransactionError(errorMessage);
        console.error("Transaction failed:", friendlyMessage);

        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: friendlyMessage,
        });
      }
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!isConfirmStep ? (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="borrowAsset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset to Borrow</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue placeholder="Select asset" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {allAssets
                            .filter(
                              (asset, index, self) =>
                                index ===
                                self.findIndex(
                                  (a) => a.symbol === asset.symbol
                                ) &&
                                asset.borrowEnabled &&
                                asset.symbol === "IDRX" // Only allow IDRX for borrowing
                            )
                            .map((asset) => (
                              <SelectItem
                                key={asset.symbol}
                                value={asset.symbol}
                              >
                                {asset.symbol} - {asset.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Only IDRX is available for borrowing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="borrowAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount to Borrow</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0.00"
                          {...field}
                          className="bg-slate-800 border-slate-700"
                          type="number"
                          step="0.01"
                          min="0.01"
                        />
                      </FormControl>
                      <FormDescription>
                        Max borrow: {totalCollateralValue && parseFloat(formatUnits(totalCollateralValue, 2)) * 0.7} IDRX
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>) : (
          <div className="space-y-6">
            {(isRegularTxPending || isRegularTxConfirming) ? (
              <div className="p-4 bg-blue-950/30 border border-blue-800/50 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  <h3 className="text-lg font-medium text-blue-400">
                    {isRegularTxPending
                      ? "Confirming Loan Transaction"
                      : "Waiting for Confirmation"}
                  </h3>
                </div>
                <p className="text-slate-300 text-sm">
                  {isRegularTxPending
                    ? "Please confirm the transaction in your wallet..."
                    : "Waiting for the transaction to be confirmed on the blockchain..."}
                </p>
              </div>
            ) : isRegularTxFailed ? (
              <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-medium text-red-400">Transaction Failed</h3>
                </div>
                <p className="text-slate-300 text-sm">
                  {regularTxError?.message || "Your transaction couldn't be completed. Please try again or check your wallet for details."}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-green-950/30 border border-green-800/50 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-medium text-green-400">
                    Confirm Your Loan
                  </h3>
                </div>
                <p className="text-slate-300 text-sm">
                  Please review the details of your loan before confirming. Once
                  confirmed, the transaction will be sent to the blockchain.
                </p>
              </div>
            )}





            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="text-slate-400">You are borrowing:</div>
                    <div className="font-medium text-right">
                      {borrowAmount} {borrowAsset}
                    </div>                    <div className="text-slate-400">Loan term:</div>
                    <div className="font-medium text-right">
                      365 days
                    </div>                    <div className="text-slate-400">Interest rate:</div>
                    <div className="font-medium text-right">
                      2%
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="text-slate-400">Total to repay:</div>
                    <div className="font-medium text-right">
                      {borrowAmount} + {borrowAmount * 0.02} {borrowAsset}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end gap-3">          {isConfirmStep ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmStep(false)}
              disabled={isRegularTxPending || isRegularTxConfirming}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="web3-button"
              disabled={isRegularTxPending || isRegularTxConfirming}
            >
              {isRegularTxPending || isRegularTxConfirming ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                "Confirm Loan"
              )}
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="web3-button"
              disabled={
                !borrowAsset ||
                !borrowAmount
              }
            >
              Review Loan
            </Button>
          </>
        )}
        </div>
      </form>
    </Form>
  );
}
