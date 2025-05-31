"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { contractAddress, getUserDeposits, pools, config } from "@/data/mock-data"
import { useToast } from "@/hooks/use-toast"
import { useAccount, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { lendingABI } from "@/contracts/lendingABI"
import { erc20Abi, parseUnits, formatUnits, decodeErrorResult } from 'viem'
import { waitForTransactionReceipt } from "@wagmi/core"
import { getUserFriendlyError, getTransactionError } from "@/lib/errorHandling"
import { Loader2, AlertCircle, Check } from "lucide-react"

interface WithdrawAssetFormProps {
    onSuccess: () => void
}

export default function WithdrawAssetForm({ onSuccess }: WithdrawAssetFormProps) {
    const [selectedAsset, setSelectedAsset] = useState("")
    const [amount, setAmount] = useState("")
    const [isConfirmStep, setIsConfirmStep] = useState(false)
    const [assetBalances, setAssetBalances] = useState<Record<string, string>>({});
    const { toast } = useToast()
    const { address } = useAccount()

    const userDeposits = getUserDeposits()    // Memoize all user deposited assets
    const allDeposits = useMemo(() =>
        userDeposits.filter(deposit => deposit.canWithdraw),
        [] // userDeposits is from mock-data and doesn't change in this component
    )

    // Get all withdrawable assets with their token addresses
    const depositedAssets = useMemo(() => {
        return pools[0].assets
    }, []);

    // Get the selected asset details
    const selectedAssetDetails = useMemo(() => {
        if (!selectedAsset) return null;
        return depositedAssets.find(asset => asset.symbol === selectedAsset);
    }, [selectedAsset, depositedAssets]);

    // Use useReadContract for the specific selected token balance
    const {
        data: tokenBalance,
        isLoading: isLoadingBalance,
        refetch: refetchBalance
    } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: lendingABI,
        functionName: 'getCollateralBalance',
        args: selectedAssetDetails ? [selectedAssetDetails.tokenAddress as `0x${string}`] : undefined,
        account: address,
        query: {
            enabled: !!address && !!contractAddress && !!selectedAssetDetails?.tokenAddress?.startsWith('0x'),
        },
    });

    // Format the balance when it's available
    const formattedBalance = useMemo(() => {
        if (!tokenBalance || !selectedAssetDetails) return "0.00";
        return formatUnits(tokenBalance as bigint, selectedAssetDetails.units);
    }, [tokenBalance, selectedAssetDetails]);

    // Refresh balance when selected asset changes
    useEffect(() => {
        if (selectedAsset && address) {
            refetchBalance();
        }
    }, [selectedAsset, address, refetchBalance]);// Setup contract write hooks for withdrawal
    const {
        data: withdrawHash,
        isPending: isWithdrawPending,
        writeContractAsync: writeWithdraw,
        error: withdrawError,
    } = useWriteContract();

    // Withdrawal confirmation
    const {
        isLoading: isWithdrawConfirming,
        isSuccess: isWithdrawConfirmed,
        isError: isWithdrawFailed,
    } = useWaitForTransactionReceipt({
        hash: withdrawHash,
    });

    // Combined transaction states
    const isTransactionInProgress = isWithdrawPending || isWithdrawConfirming;
    const isTransactionSuccess = isWithdrawConfirmed;
    const isTransactionFailed = withdrawHash && isWithdrawFailed; const handleWithdraw = async () => {
        if (!address || !selectedAsset || !amount) {
            throw new Error("Address, asset, or amount is missing.");
        }

        // Validate amount against actual balance
        if (parseFloat(amount) > parseFloat(formattedBalance)) {
            toast({
                variant: "destructive",
                title: "Insufficient balance",
                description: `You can't withdraw more than ${formattedBalance} ${selectedAsset}.`
            });
            return;
        }

        // Find the selected asset with token address
        const asset = depositedAssets.find(a => a.symbol === selectedAsset);
        if (!asset?.tokenAddress) {
            throw new Error("Asset token address not found.");
        }

        try {
            // Send withdrawal transaction
            const withdrawResult = await writeWithdraw({
                address: contractAddress,
                abi: lendingABI,
                functionName: "withdrawCollateral",
                args: [
                    asset.tokenAddress as `0x${string}`,
                    parseUnits(amount, asset.units),
                ],
            });

            if (!withdrawResult) {
                console.error("Failed to submit withdrawal transaction");
                toast({
                    variant: "destructive",
                    title: "Transaction failed",
                    description: "Failed to submit withdrawal transaction",
                });
                return;
            }

            toast({
                title: "Withdrawal submitted",
                description: "Waiting for confirmation...",
            });

            console.log("Withdrawal transaction submitted:", withdrawResult);

            // Wait for withdrawal transaction to be confirmed
            const withdrawReceipt = await waitForTransactionReceipt(config, {
                hash: withdrawResult,
            });

            toast({
                title: "Withdrawal successful!",
                description: `You have successfully withdrawn ${amount} ${selectedAsset}.`,
            });

            console.log("Withdrawal confirmed in block:", withdrawReceipt.blockNumber);

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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConfirmStep) {
            setIsConfirmStep(true);
            return;
        }

        try {
            await handleWithdraw();
        } catch (error) {
            console.error("Failed to complete withdrawal:", error);
            // Error handling is done in handleWithdraw
        }
    };
    const selectedDeposit = pools[0].assets.find(d => d.symbol === selectedAsset);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isConfirmStep ? (
                <>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="asset">Select Asset</Label>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex-1">
                                    <Select
                                        value={selectedAsset}
                                        onValueChange={setSelectedAsset}
                                    >
                                        <SelectTrigger id="asset" className="bg-slate-800 border-slate-700">
                                            <SelectValue placeholder="Select an asset to withdraw" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            {pools[0].assets.map((deposit) => (
                                                <SelectItem key={deposit.symbol} value={deposit.symbol}>
                                                    {deposit.symbol}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedAsset && (
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {isLoadingBalance ? (
                                                <div className="flex items-center">
                                                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                                    Loading...
                                                </div>
                                            ) : (
                                                `${formattedBalance} ${selectedAsset}`
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400">Available balance</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <Input
                                    id="amount"
                                    type="number" placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0"
                                    max={formattedBalance}
                                    step="0.000001"
                                    className="bg-slate-800 border-slate-700"
                                    required
                                />
                                {selectedAsset && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary"
                                        onClick={() => setAmount(isLoadingBalance ? "0" : formattedBalance)}
                                        disabled={isLoadingBalance}
                                    >
                                        MAX
                                    </Button>
                                )}
                            </div>
                            {selectedAsset && (
                                <div className="flex justify-between text-sm text-slate-400">
                                    <span>You can withdraw up to {isLoadingBalance ? "..." : formattedBalance} {selectedAsset}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* {selectedDeposit && (
                        <div className="rounded-lg bg-slate-800/50 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Current Value</span>
                                <span>{selectedDeposit.value}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Earned Interest</span>
                            </div>
                        </div>
                    )} */}
                </>
            ) : (
                <div className="space-y-6">
                    {isTransactionInProgress ? (
                        <div className="p-4 bg-blue-950/30 border border-blue-800/50 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                <h3 className="text-lg font-medium text-blue-400">
                                    {isWithdrawPending ? "Processing Withdrawal" : "Confirming Withdrawal"}
                                </h3>
                            </div>
                            <p className="text-slate-300 text-sm">
                                {isWithdrawPending
                                    ? "Please confirm the withdrawal transaction in your wallet..."
                                    : "Waiting for the withdrawal transaction to be confirmed on the blockchain..."}
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
                                <h3 className="text-lg font-medium text-green-400">Confirm Your Withdrawal</h3>
                            </div>
                            <p className="text-slate-300 text-sm">
                                Please review the details of your withdrawal before confirming.
                            </p>
                        </div>
                    )}

                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-y-3">
                                    <div className="text-slate-400">You are withdrawing:</div>
                                    <div className="font-medium text-right">
                                        {amount} {selectedAsset}
                                    </div>

                                    <div className="text-slate-400">Current value:</div>
                                    <div className="font-medium text-right">
                                        {selectedDeposit?.value}
                                    </div>

                                    <div className="text-slate-400">Earned interest:</div>
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
                                <div className="flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {isWithdrawPending ? "Confirming..." : "Processing..."}
                                </div>
                            ) : isTransactionFailed ? (
                                <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Try Again
                                </div>
                            ) : (
                                "Confirm Withdrawal"
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
                            Review Withdrawal
                        </Button>
                    </>
                )}
            </div>
        </form>
    )
}
