"use client"

import { useState, useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { lendingABI } from "@/contracts/lendingABI"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Info, Loader2, AlertCircle } from "lucide-react"
import { pools, addUserDeposit, contractAddress, config } from "@/data/mock-data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAccount, useBalance, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { erc20Abi, parseUnits, formatUnits, decodeErrorResult } from 'viem'
import { waitForTransactionReceipt } from "@wagmi/core";
import { AssetType } from "@/types/platform"
import { getUserFriendlyError, getTransactionError } from "@/lib/errorHandling"
import { pricefeedABI } from "@/contracts/pricefeedABI"

const formSchema = z.object({
  asset: z.string({
    required_error: "Please select an asset to deposit.",
  }),
  amount: z.string().min(1, {
    message: "Please enter an amount to deposit.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface DepositAssetFormProps {
  onSuccess: () => void
  preselectedAsset?: string
}

export default function DepositAssetForm({ onSuccess, preselectedAsset }: DepositAssetFormProps) {
  const { toast } = useToast()
  const [isConfirmStep, setIsConfirmStep] = useState(false)
  const [assetBalances, setAssetBalances] = useState<Record<string, string>>({});
  const [loadingBalances, setLoadingBalances] = useState<Record<string, boolean>>({});
  const { address } = useAccount()

  // Memoize all assets to prevent unnecessary recalculations
  const allAssets = pools[0].assets;
  // Read all token balances in one call
  const { data: balanceResults } = useReadContracts({
    contracts: allAssets
      .filter(asset => asset.tokenAddress?.startsWith('0x'))
      .map(asset => ({
        address: asset.tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      })),
  })


  useEffect(() => {
    console.log(balanceResults);
  }, [balanceResults])

  // Update balances when contract results change
  useEffect(() => {
    const newBalances: Record<string, string> = {};
    const newLoadingStates: Record<string, boolean> = {};

    // Initialize everything to 0 first
    allAssets.forEach(asset => {
      newBalances[asset.symbol] = "0.00";
      newLoadingStates[asset.symbol] = !!asset.tokenAddress?.startsWith('0x');
    });

    if (balanceResults) {
      const tokensWithBalances = allAssets.filter(asset => asset.tokenAddress?.startsWith('0x'));
      tokensWithBalances.forEach((asset, index) => {
        if (balanceResults[index] && balanceResults[index].result !== undefined) {
          newBalances[asset.symbol] = formatUnits(balanceResults[index].result as bigint, asset.units);
        }
        newLoadingStates[asset.symbol] = false;
      });
    }
    console.log(balanceResults);
    setAssetBalances(newBalances);
    setLoadingBalances(newLoadingStates);
  }, [balanceResults, allAssets]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset: preselectedAsset || "",
      amount: "",
    },
  })

  const { data: priceData } = useReadContracts({
    contracts: allAssets
      .filter(token => token.tokenAddress && token.tokenAddress.startsWith('0x'))
      .map((token) => ({
        address: token.priceFeed as `0x${string}`,
        abi: pricefeedABI as any,
        functionName: 'latestAnswer',
      })),
    query: {
      refetchInterval: 10000, // Refetch every 5 seconds
    }
  })

  // Format token prices from priceData
  const formattedPrices = useMemo(() => {
    const priceMap: Record<string, number> = {};
    allAssets.forEach((asset, index) => {
      if (asset.tokenAddress?.startsWith('0x')) {
        priceMap[asset.symbol] = priceData?.[index]?.result ?
          Number(priceData[index].result) / 1e8 :
          parseFloat(asset.price.replace(/[^0-9.-]+/g, ""));
      }
    });
    return priceMap;
  }, [priceData, allAssets]);

  const selectedAsset = form.watch("asset")
  const amount = form.watch("amount")
  const currentAsset = allAssets.find(asset => asset.symbol === selectedAsset)
  const depositValue = useMemo(() => {
    if (!amount || !currentAsset || !formattedPrices[selectedAsset]) return 0;
    return parseFloat(amount) * formattedPrices[selectedAsset];
  }, [amount, currentAsset, selectedAsset, formattedPrices]);

  const estimatedAnnualEarnings = useMemo(() => {
    if (!amount || !currentAsset || !currentAsset.supplyApr) return 0;
    return parseFloat(amount) * (parseFloat(currentAsset.supplyApr.replace("%", "")) / 100);
  }, [amount, currentAsset]);

  // Get the current wallet balance for the selected asset
  const currentWalletBalance = selectedAsset && assetBalances[selectedAsset]
    ? assetBalances[selectedAsset]
    : currentAsset?.walletBalance || "0.00"

  const isLoadingSelectedAssetBalance = selectedAsset && loadingBalances[selectedAsset] || false

  const {
    data: approvalHash,
    isPending: isApprovalPending,
    writeContractAsync: writeApproval,
    error: approvalError,
  } = useWriteContract();

  // Approval confirmation
  const {
    isLoading: isApprovalConfirming,
    isSuccess: isApprovalConfirmed,
    isError: isApprovalFailed,
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const {
    data: depositHash,
    isPending: isDepositPending,
    writeContractAsync: writeDeposit,
    error: depositError,
  } = useWriteContract();

  // Deposit confirmation
  const {
    isLoading: isDepositConfirming,
    isSuccess: isDepositConfirmed,
    isError: isDepositFailed,
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Combined transaction states
  const isTransactionInProgress =
    isApprovalPending || isApprovalConfirming ||
    isDepositPending || isDepositConfirming;

  const isTransactionSuccess = isDepositConfirmed;

  const isTransactionFailed =
    (approvalHash && isApprovalFailed) ||
    (depositHash && isDepositFailed);

  const handleDepositCollateral = async () => {
    if (!address || !currentAsset?.tokenAddress || !amount) {
      throw new Error("Address, collateral token, or amount is missing.");
    }

    try {
      // Send approval transaction
      const approveResult = await writeApproval({
        address: currentAsset.tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [contractAddress, parseUnits(amount, currentAsset.units)],
      });

      if (!approveResult) {
        console.error("Failed to submit approval transaction");
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: "Failed to submit approval transaction",
        });
        return;
      }

      toast({
        title: "Approval submitted",
        description: "Waiting for confirmation...",
      });

      console.log("Approval transaction submitted:", approveResult);

      // Wait for the approval transaction to be confirmed
      const approvalReceipt = await waitForTransactionReceipt(config, {
        hash: approveResult,
      });

      toast({
        title: "Approval confirmed",
        description: `Approval confirmed in block ${approvalReceipt.blockNumber}`,
      });

      console.log(
        "Approval confirmed in block:",
        approvalReceipt.blockNumber
      );

      // Proceed with the deposit
      const depositResult = await writeDeposit({
        address: contractAddress,
        abi: lendingABI,
        functionName: "depositCollateral",
        args: [
          currentAsset.tokenAddress as `0x${string}`,
          parseUnits(
            amount,
            currentAsset.units
          ),
        ],
      });

      if (!depositResult) {
        console.error("Failed to submit deposit transaction");
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: "Failed to submit deposit transaction",
        });
        return;
      }

      toast({
        title: "Deposit submitted",
        description: "Waiting for confirmation...",
      });

      console.log("Deposit transaction submitted:", depositResult);

      // Wait for deposit transaction to be confirmed
      const depositReceipt = await waitForTransactionReceipt(config, {
        hash: depositResult,
      });

      toast({
        title: "Deposit successful!",
        description: `You have successfully deposited ${amount} ${currentAsset.symbol} and started earning ${currentAsset.supplyApr} APY.`,
      });

      console.log(
        "Deposit confirmed in block:",
        depositReceipt.blockNumber
      );

      onSuccess();
    } catch (error) {
      console.error("Transaction sequence failed:", error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      const match = errorMessage.match(/data="([^"]+)"/);

      if (match && match[1]) {
        const parsedError = match[1].split(",")[0]; // Extract the first part separated by commas
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
          console.error("Failed to decode contract error:", {
            original: errorMessage,
            parsed: parsedError,
            decodeError,
          });

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

      // Call onSuccess to close the form even if transaction fails
      onSuccess();
    }
  };
  async function onSubmit(values: FormValues) {
    if (!isConfirmStep) {
      setIsConfirmStep(true)
      return
    }

    // Validate amount against wallet balance
    const asset = allAssets.find(a => a.symbol === values.asset)
    if (!asset) return

    // Only use the real balance from the connected wallet
    const balanceToUse = values.asset && assetBalances[values.asset]
      ? assetBalances[values.asset]
      : "0.00"

    const walletBalance = parseFloat(balanceToUse.replace(/,/g, ""))
    const depositAmount = parseFloat(values.amount)

    if (depositAmount > walletBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: `You don't have enough ${values.asset} in your wallet.`,
      })
      return
    }

    // Handle the deposit process with all transaction states
    try {
      await handleDepositCollateral();
      // Success toast is handled in handleDepositCollateral
    } catch (error) {
      console.error("Failed to complete deposit:", error);
      // Error handling is done in handleDepositCollateral
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!isConfirmStep ? (
          <>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset to Deposit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select asset to deposit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {allAssets.map((asset) => (
                          <SelectItem key={asset.symbol} value={asset.symbol}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                                {asset.symbol.charAt(0)}
                              </div>
                              {asset.symbol} - {asset.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* <FormDescription>
                      {selectedAsset && (
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-slate-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Annual Percentage Yield - the rate you'll earn on your deposit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount to Deposit</FormLabel>
                    <div className="flex gap-2">
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
                      <Button
                        type="button"
                        variant="outline" onClick={() => {
                          if (currentAsset) {
                            // Use real balance if available, otherwise fallback to mock data
                            const balance = currentWalletBalance.replace(/,/g, "");
                            field.onChange(balance);
                          }
                        }}
                        className="px-3 bg-slate-700 border-slate-600"
                        disabled={isLoadingSelectedAssetBalance}
                      >
                        {isLoadingSelectedAssetBalance ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Max"
                        )}
                      </Button>
                    </div>
                    <FormDescription className="flex items-center gap-2">
                      Wallet balance: {isLoadingSelectedAssetBalance ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                        </span>
                      ) : (
                        `${currentWalletBalance} ${selectedAsset}`
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {depositValue > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Deposit Value</span>
                      <span className="font-bold">
                        ${depositValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                        {!priceData ? " (Loading...)" : ""}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Collateral Factor</span>
                      <span className="font-bold">70%</span>
                    </div>

                    <Separator className="bg-slate-700" />

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>• You can withdraw your deposit at any time</p>
                      <p>• This asset can be used as collateral for borrowing and comunity lending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (<div className="space-y-6">
          {isTransactionInProgress ? (
            <div className="p-4 bg-blue-950/30 border border-blue-800/50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                <h3 className="text-lg font-medium text-blue-400">
                  {isApprovalPending || isApprovalConfirming
                    ? "Approving Token Transfer"
                    : isDepositPending || isDepositConfirming
                      ? "Depositing Assets"
                      : "Processing Transaction"}
                </h3>
              </div>
              <p className="text-slate-300 text-sm">
                {isApprovalPending
                  ? "Please confirm the approval transaction in your wallet..."
                  : isApprovalConfirming
                    ? "Waiting for the approval transaction to be confirmed on the blockchain..."
                    : isDepositPending
                      ? "Please confirm the deposit transaction in your wallet..."
                      : "Waiting for the deposit transaction to be confirmed on the blockchain..."}
              </p>
            </div>
          ) : isTransactionFailed ? (
            <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-medium text-red-400">Transaction Failed</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Your transaction couldn't be completed. Please try again or check your wallet for details.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-green-950/30 border border-green-800/50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-medium text-green-400">Confirm Your Deposit</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Please review the details of your deposit before confirming. Once confirmed, you'll start earning interest immediately.
              </p>
            </div>
          )}

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-y-3">
                  <div className="text-slate-400">You are depositing:</div>
                  <div className="font-medium text-right">
                    {amount} {selectedAsset}
                  </div>

                  <div className="text-slate-400">Deposit value:</div>
                  <div className="font-medium text-right">
                    ${depositValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                    {!priceData ? " (Loading...)" : ""}
                  </div>



                  <div className="text-slate-400">Can be used as collateral:</div>
                  <div className="font-medium text-right">
                    Up to 70% of value
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
        )}        <div className="flex justify-end gap-3">
          {isConfirmStep ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmStep(false)}
                disabled={isTransactionInProgress}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="web3-button"
                disabled={isTransactionInProgress}
              >
                {isTransactionInProgress ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isApprovalPending || isApprovalConfirming
                      ? "Approving..."
                      : isDepositPending || isDepositConfirming
                        ? "Depositing..."
                        : "Processing..."}
                  </div>
                ) : isTransactionFailed ? (
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Try Again
                  </div>
                ) : (
                  "Confirm Deposit"
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
                disabled={!selectedAsset || !amount || parseFloat(amount || "0") <= 0}
              >
                Review Deposit
              </Button>
            </>
          )}
        </div>
      </form>
    </Form >
  )
}
