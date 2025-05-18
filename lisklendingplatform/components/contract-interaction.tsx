"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/wallet-provider";
import { useXellarContract } from "@/hooks/use-xellar-contract";

export function ContractInteraction() {
  const { toast } = useToast();
  const { address, isConnected } = useWallet();
  const lendingContract = useLendingContract();

  // State for transaction status
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [loanAmount, setLoanAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [fundUserAddress, setFundUserAddress] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [repayFunderAmount, setRepayFunderAmount] = useState("");
  const [repayFunderInterest, setRepayFunderInterest] = useState("");
  const [raisingAmount, setRaisingAmount] = useState("");

  // User data
  const [remainingDebt, setRemainingDebt] = useState("0");
  const [userCollateral, setUserCollateral] = useState("0");
  const [funderBalance, setFunderBalance] = useState("0");

  // Contract data
  const [totalCollateral, setTotalCollateral] = useState("0");
  const [collateralRaisingGoal, setCollateralRaisingGoal] = useState("0");
  const [collateralRaised, setCollateralRaised] = useState("0");

  // Reset transaction status
  const resetStatus = () => {
    setTransactionHash(null);
    setError(null);
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!isConnected || !address) return;

    try {
      const debt = await lendingContract.getUserRemainingDebt();
      const collateral = await lendingContract.getUserCollateral();
      const balance = await lendingContract.getFunderBalance();

      setRemainingDebt(debt);
      setUserCollateral(collateral);
      setFunderBalance(balance);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Refresh contract data
  const refreshContractData = async () => {
    try {
      const totalColl = await lendingContract.getTotalCollateral();
      const raisingGoal = await lendingContract.getCollateralRaisingGoal();
      const raised = await lendingContract.getCollateralRaised();

      setTotalCollateral(totalColl);
      setCollateralRaisingGoal(raisingGoal);
      setCollateralRaised(raised);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (isConnected) {
      refreshUserData();
      refreshContractData();
    }
  }, [isConnected, address]);

  // Take loan
  const handleTakeLoan = async () => {
    if (!loanAmount) {
      toast({
        title: "Input Required",
        description: "Please enter a loan amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    resetStatus();

    try {
      const result = await lendingContract.takeLoan(loanAmount);

      if (result.success) {
        setTransactionHash(result.hash || null);
        toast({
          title: "Loan Taken",
          description: "Your loan has been processed successfully",
        });

        // Refresh data
        refreshUserData();
        refreshContractData();
      } else {
        setError(result.error || "Unknown error");
        toast({
          title: "Transaction Failed",
          description: result.error || "Failed to process your loan",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "Failed to take loan");
      toast({
        title: "Transaction Failed",
        description: error.message || "An error occurred while taking the loan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Repay loan
  const handleRepayLoan = async () => {
    if (!repayAmount) {
      toast({
        title: "Input Required",
        description: "Please enter a repayment amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    resetStatus();

    try {
      const result = await lendingContract.repayLoan(repayAmount);

      if (result.success) {
        setTransactionHash(result.hash || null);
        toast({
          title: "Loan Repaid",
          description: "Your loan repayment has been processed successfully",
        });

        // Refresh data
        refreshUserData();
        refreshContractData();
      } else {
        setError(result.error || "Unknown error");
        toast({
          title: "Transaction Failed",
          description: result.error || "Failed to process your repayment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "Failed to repay loan");
      toast({
        title: "Transaction Failed",
        description:
          error.message || "An error occurred while repaying the loan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fund user
  const handleFundUser = async () => {
    if (!fundAmount || !fundUserAddress) {
      toast({
        title: "Input Required",
        description: "Please enter a funding amount and user address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    resetStatus();

    try {
      const result = await lendingContract.fundUser(
        fundAmount,
        fundUserAddress
      );

      if (result.success) {
        setTransactionHash(result.hash || null);
        toast({
          title: "User Funded",
          description: "Funding has been processed successfully",
        });

        // Refresh data
        refreshUserData();
        refreshContractData();
      } else {
        setError(result.error || "Unknown error");
        toast({
          title: "Transaction Failed",
          description: result.error || "Failed to process funding",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "Failed to fund user");
      toast({
        title: "Transaction Failed",
        description:
          error.message || "An error occurred while funding the user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Repay funder
  const handleRepayFunder = async () => {
    if (!repayFunderAmount || !repayFunderInterest) {
      toast({
        title: "Input Required",
        description: "Please enter a repayment amount and interest",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    resetStatus();

    try {
      const result = await lendingContract.repayFunder(
        repayFunderAmount,
        repayFunderInterest
      );

      if (result.success) {
        setTransactionHash(result.hash || null);
        toast({
          title: "Funder Repaid",
          description: "Repayment to funder has been processed successfully",
        });

        // Refresh data
        refreshUserData();
        refreshContractData();
      } else {
        setError(result.error || "Unknown error");
        toast({
          title: "Transaction Failed",
          description: result.error || "Failed to process repayment to funder",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "Failed to repay funder");
      toast({
        title: "Transaction Failed",
        description:
          error.message || "An error occurred while repaying the funder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start collateral raising
  const handleStartCollateralRaising = async () => {
    if (!raisingAmount) {
      toast({
        title: "Input Required",
        description: "Please enter a collateral raising amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    resetStatus();

    try {
      const result = await lendingContract.startCollateralRaising(
        raisingAmount
      );

      if (result.success) {
        setTransactionHash(result.hash || null);
        toast({
          title: "Collateral Raising Started",
          description: "Collateral raising has been started successfully",
        });

        // Refresh data
        refreshContractData();
      } else {
        setError(result.error || "Unknown error");
        toast({
          title: "Transaction Failed",
          description: result.error || "Failed to start collateral raising",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "Failed to start collateral raising");
      toast({
        title: "Transaction Failed",
        description:
          error.message ||
          "An error occurred while starting collateral raising",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Close raising
  const handleCloseRaising = async () => {
    setIsLoading(true);
    resetStatus();

    try {
      const result = await lendingContract.closeRaising();

      if (result.success) {
        setTransactionHash(result.hash || null);
        toast({
          title: "Raising Closed",
          description: "Collateral raising has been closed successfully",
        });

        // Refresh data
        refreshContractData();
      } else {
        setError(result.error || "Unknown error");
        toast({
          title: "Transaction Failed",
          description: result.error || "Failed to close raising",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "Failed to close raising");
      toast({
        title: "Transaction Failed",
        description: error.message || "An error occurred while closing raising",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contract Interaction</CardTitle>
          <CardDescription>
            Connect your wallet to interact with the lending contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">
            Please connect your wallet to use this feature
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lending Contract Interaction</CardTitle>
        <CardDescription>
          Interact with the Lisk Lending smart contract
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* User data summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-slate-500">Your Debt</div>
            <div className="text-2xl font-bold">{remainingDebt} USDT</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-slate-500">Your Collateral</div>
            <div className="text-2xl font-bold">{userCollateral} USDT</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-slate-500">Your Funder Balance</div>
            <div className="text-2xl font-bold">{funderBalance} USDT</div>
          </div>
        </div>

        {/* Contract data summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-slate-500">Total Collateral</div>
            <div className="text-2xl font-bold">{totalCollateral} USDT</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-slate-500">Raising Goal</div>
            <div className="text-2xl font-bold">
              {collateralRaisingGoal} USDT
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-slate-500">Raised So Far</div>
            <div className="text-2xl font-bold">{collateralRaised} USDT</div>
          </div>
        </div>

        {/* Transaction status */}
        {transactionHash && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Transaction Successful</AlertTitle>
            <AlertDescription>
              Transaction hash:{" "}
              <a
                href={`https://sepolia.ethscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 hover:text-blue-800"
              >
                {transactionHash.substring(0, 10)}...
                {transactionHash.substring(transactionHash.length - 10)}
              </a>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Transaction Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Contract interaction tabs */}
        <Tabs defaultValue="borrow" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="borrow">Borrower Functions</TabsTrigger>
            <TabsTrigger value="lend">Lender Functions</TabsTrigger>
          </TabsList>

          <TabsContent value="borrow" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Take Loan */}
              <Card>
                <CardHeader>
                  <CardTitle>Take Loan</CardTitle>
                  <CardDescription>
                    Borrow tokens by providing collateral
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Amount (USDT)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleTakeLoan}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Take Loan"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Repay Loan */}
              <Card>
                <CardHeader>
                  <CardTitle>Repay Loan</CardTitle>
                  <CardDescription>Return borrowed tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Amount (USDT)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleRepayLoan}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Repay Loan"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Repay Funder */}
              <Card>
                <CardHeader>
                  <CardTitle>Repay Funder</CardTitle>
                  <CardDescription>
                    Repay a funder with principal and interest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Principal Amount (USDT)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={repayFunderAmount}
                        onChange={(e) => setRepayFunderAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Interest Amount (IDRX)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={repayFunderInterest}
                        onChange={(e) => setRepayFunderInterest(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleRepayFunder}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Repay Funder"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lend" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fund User */}
              <Card>
                <CardHeader>
                  <CardTitle>Fund User</CardTitle>
                  <CardDescription>
                    Provide funding to a specific user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        User Address
                      </label>
                      <Input
                        type="text"
                        placeholder="0x..."
                        value={fundUserAddress}
                        onChange={(e) => setFundUserAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Amount (USDT)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleFundUser}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Fund User"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Start Collateral Raising */}
              <Card>
                <CardHeader>
                  <CardTitle>Start Collateral Raising</CardTitle>
                  <CardDescription>
                    Begin a collateral raising round
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Goal Amount (USDT)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={raisingAmount}
                        onChange={(e) => setRaisingAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleStartCollateralRaising}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Start Raising"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Close Raising */}
              <Card>
                <CardHeader>
                  <CardTitle>Close Raising</CardTitle>
                  <CardDescription>
                    End the current collateral raising round
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      className="w-full"
                      onClick={handleCloseRaising}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Close Raising"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Refresh buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={refreshUserData}
            disabled={isLoading}
          >
            Refresh User Data
          </Button>
          <Button
            variant="outline"
            onClick={refreshContractData}
            disabled={isLoading}
          >
            Refresh Contract Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
