"use client"

import * as z from "zod"
import { useState, useEffect, useMemo } from "react"
import { useAccount, useWaitForTransactionReceipt, useReadContract, useReadContracts } from "wagmi"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { waitForTransactionReceipt } from "@wagmi/core"
import { formatUnits, parseUnits } from "viem"
import { useWriteContract } from "wagmi"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Check, Info, Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { pricefeedABI } from "@/contracts/pricefeedABI"
import { erc20Abi, decodeErrorResult } from 'viem'
import { pools } from "@/data/mock-data";
import { contractAddress } from "@/data/mock-data";
import { config } from "@/lib/client-config";
import { getUserFriendlyError, getTransactionError } from "@/lib/errorHandling"
import { lendingABI } from "@/contracts/lendingABI"

const formSchema = z.object({
    asset: z.string({
        required_error: "Please select an asset to repay.",
    }),
    amount: z.string().min(1, {
        message: "Please enter an amount to repay.",
    }),
})

type FormValues = z.infer<typeof formSchema>

interface RepayLoanFormProps {
    onSuccess: () => void
    preselectedAsset?: string
}

export default function RepayLoanForm({ onSuccess, preselectedAsset }: RepayLoanFormProps) {
    const { toast } = useToast()
    const [isConfirmStep, setIsConfirmStep] = useState(false)
    const [assetBalances, setAssetBalances] = useState<Record<string, string>>({});
    const [loadingBalances, setLoadingBalances] = useState<Record<string, boolean>>({});
    const { address } = useAccount()

    // Get loan info from contract
    const { data: loanInfo } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: lendingABI,
        functionName: "getLoanInfo",
        args: address ? [address as `0x${string}`] : undefined,
        account: address,
        query: {
            enabled: !!address,
            refetchInterval: 5000,
        },
    });

    // Calculate outstanding debt
    const outstandingDebt = useMemo(() => {
        if (!loanInfo) return "0";
        return formatUnits(loanInfo.debt - loanInfo.repaid, 2); // Using 2 decimals as per contract
    }, [loanInfo]);

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
        setAssetBalances(newBalances);
        setLoadingBalances(newLoadingStates);
    }, [balanceResults, allAssets]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            asset: preselectedAsset ?? "",
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
            refetchInterval: 10000,
        }
    })

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
    const repayValue = useMemo(() => {
        if (!amount || !currentAsset || !formattedPrices[selectedAsset]) return 0;
        return parseFloat(amount) * formattedPrices[selectedAsset];
    }, [amount, currentAsset, selectedAsset, formattedPrices]);

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
        data: repayHash,
        isPending: isRepayPending,
        writeContractAsync: writeRepay,
        error: repayError,
    } = useWriteContract();

    // Repay confirmation
    const {
        isLoading: isRepayConfirming,
        isSuccess: isRepayConfirmed,
        isError: isRepayFailed,
    } = useWaitForTransactionReceipt({
        hash: repayHash,
    });

    // Combined transaction states
    const isTransactionInProgress =
        isApprovalPending || isApprovalConfirming ||
        isRepayPending || isRepayConfirming;

    const isTransactionSuccess = isRepayConfirmed;

    const isTransactionFailed =
        (approvalHash && isApprovalFailed) ||
        (repayHash && isRepayFailed);

    const handleRepayLoan = async () => {
        if (!address || !currentAsset?.tokenAddress || !amount) {
            throw new Error("Address, loan token, or amount is missing.");
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

            console.log("Approval confirmed in block:", approvalReceipt.blockNumber);

            // Proceed with the repay
            const repayResult = await writeRepay({
                address: contractAddress,
                abi: lendingABI,
                functionName: "repayLoan",
                args: [
                    parseUnits(amount, 2),
                ],
            });

            if (!repayResult) {
                console.error("Failed to submit repay transaction");
                toast({
                    variant: "destructive",
                    title: "Transaction failed",
                    description: "Failed to submit repay transaction",
                });
                return;
            }

            toast({
                title: "Repay submitted",
                description: "Waiting for confirmation...",
            });

            console.log("Repay transaction submitted:", repayResult);

            // Wait for repay transaction to be confirmed
            const repayReceipt = await waitForTransactionReceipt(config, {
                hash: repayResult,
            });

            toast({
                title: "Repay successful!",
                description: `You have successfully repaid ${amount} ${currentAsset.symbol}`,
            });

            console.log("Repay confirmed in block:", repayReceipt.blockNumber);

            onSuccess();
        } catch (error) {
            console.error("Transaction sequence failed:", error);

            const errorMessage = error instanceof Error ? error.message : String(error);
            const match = errorMessage.match(/data="([^"]+)"/);

            if (match && match[1]) {
                const parsedError = match[1].split(",")[0];
                try {
                    const decodedError = decodeErrorResult({
                        abi: lendingABI,
                        data: parsedError as `0x${string}`,
                    });

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
                const friendlyMessage = getTransactionError(errorMessage);
                console.error("Transaction failed:", friendlyMessage);

                toast({
                    variant: "destructive",
                    title: "Transaction failed",
                    description: friendlyMessage,
                });
            }

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
        const repayAmount = parseFloat(values.amount)

        if (repayAmount > walletBalance) {
            toast({
                variant: "destructive",
                title: "Insufficient balance",
                description: `You don't have enough ${values.asset} in your wallet.`,
            })
            return
        }

        try {
            await handleRepayLoan();
        } catch (error) {
            console.error("Failed to complete repay:", error);
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
                                        <FormLabel>Asset to Repay</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                                    <SelectValue placeholder="Select an asset to repay" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                {allAssets
                                                    .filter(asset => asset.borrowEnabled)
                                                    .map((asset) => (
                                                        <SelectItem
                                                            key={asset.symbol}
                                                            value={asset.symbol}
                                                            className="focus:bg-slate-700"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span>{asset.symbol}</span>
                                                                <span className="text-slate-400 text-sm">
                                                                    {asset.name}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount to Repay</FormLabel>
                                        <div className="flex gap-2">                                            <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="0.00"
                                                className="bg-slate-800 border-slate-700"
                                                type="number"
                                                step="any"
                                                min="0"
                                                max={Number(outstandingDebt)}
                                            />
                                        </FormControl>
                                            {selectedAsset && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="bg-slate-800 border-slate-700"
                                                    onClick={() => {
                                                        form.setValue(
                                                            "amount",
                                                            outstandingDebt
                                                        );
                                                    }}
                                                >
                                                    Max
                                                </Button>
                                            )}
                                        </div>
                                        <FormDescription className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                Outstanding debt: {outstandingDebt} {selectedAsset}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                Wallet balance: {isLoadingSelectedAssetBalance ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    currentWalletBalance
                                                )} {selectedAsset}
                                            </div>
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {repayValue > 0 && (
                            <Card className="bg-slate-800 border-slate-700">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-400">Repay Value</span>
                                            <span className="font-medium">
                                                ${repayValue.toFixed(2)}
                                            </span>
                                        </div>

                                        <Separator className="bg-slate-700" />

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-400">After Repay Balance</span>
                                            <span className="font-medium">
                                                {(parseFloat(currentWalletBalance) - parseFloat(amount || "0")).toFixed(4)} {selectedAsset}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    <div className="space-y-6">
                        {isTransactionInProgress ? (
                            <div className="p-4 bg-blue-950/30 border border-blue-800/50 rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                    <h3 className="text-lg font-medium text-blue-400">
                                        Transaction in Progress
                                    </h3>
                                </div>
                                <p className="text-slate-300 text-sm">
                                    {isApprovalPending
                                        ? "Please confirm the approval transaction in your wallet..."
                                        : isApprovalConfirming
                                            ? "Waiting for the approval transaction to be confirmed on the blockchain..."
                                            : isRepayPending
                                                ? "Please confirm the repay transaction in your wallet..."
                                                : "Waiting for the repay transaction to be confirmed on the blockchain..."}
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
                                    <h3 className="text-lg font-medium text-green-400">Confirm Your Repay</h3>
                                </div>
                                <p className="text-slate-300 text-sm">
                                    Please review the details of your repay before confirming.
                                </p>
                            </div>
                        )}

                        <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Asset</span>
                                        <span className="font-medium">{selectedAsset}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Amount</span>
                                        <span className="font-medium">{amount} {selectedAsset}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Outstanding Debt</span>
                                        <span className="font-medium">{outstandingDebt} {selectedAsset}</span>
                                    </div>

                                    <Separator className="bg-slate-700" />

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Value</span>
                                        <span className="font-medium">${repayValue.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="flex justify-end gap-3">
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
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isTransactionFailed ? (
                                    "Try Again"
                                ) : (
                                    "Confirm Repay"
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
                                Review Repay
                            </Button>
                        </>
                    )}
                </div>
            </form>
        </Form>
    )
}
