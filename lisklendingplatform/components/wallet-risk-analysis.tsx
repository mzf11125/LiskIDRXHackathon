"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  HelpCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "./wallet-provider";
import { useWalletAnalysis } from "@/hooks/use-wallet-analysis";

export function WalletRiskAnalysis() {
  const { address, isConnected } = useWallet();
  const { analysis, isLoading, error, fetchWalletAnalysis } =
    useWalletAnalysis();
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    // Only fetch when wallet is connected and we have an address
    if (isConnected && address) {
      console.log("Fetching wallet analysis for:", address);
      fetchWalletAnalysis(address);
    }
  }, [isConnected, address]); // Remove fetchWalletAnalysis from deps to prevent infinite loop

  if (!isConnected) {
    return (
      <Card className="web3-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Wallet Risk Analysis
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your risk analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <HelpCircle className="h-16 w-16 text-slate-500 mb-4" />
            <p className="text-slate-400 text-center">
              Connect your wallet to see a detailed analysis of your wallet's
              risk profile
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="web3-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Wallet Risk Analysis
          </CardTitle>
          <CardDescription>Analyzing your wallet...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
            <p className="text-slate-400">
              Please wait while we analyze your wallet activity
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="web3-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Analysis Error
          </CardTitle>
          <CardDescription>Unable to retrieve wallet analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-slate-400 text-center mb-4">
              {error ||
                "There was a problem analyzing your wallet. Please try again later."}
            </p>
            <Button
              onClick={() => fetchWalletAnalysis(address!)}
              className="web3-button"
            >
              Retry Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get color based on risk level
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-red-500";
      default:
        return "text-slate-400";
    }
  };

  // Get progress color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="web3-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Wallet Risk Analysis
        </CardTitle>
        <CardDescription>
          Risk assessment for your connected wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-sm text-slate-400">Risk Level:</span>
              <span
                className={`ml-2 font-bold ${getRiskColor(
                  analysis.risk_level
                )}`}
              >
                {analysis.risk_level.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-sm text-slate-400">Score:</span>
              <span className="ml-2 font-bold">{analysis.final_score}/100</span>
            </div>
          </div>
          <Progress
            value={analysis.final_score}
            className={`h-2 ${getScoreColor(analysis.final_score)}`}
          />
        </div>

        <div className="mb-4">
          <p className="text-slate-300">{analysis.recommendation}</p>
        </div>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Details"}
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showDetails && analysis.factors && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-400">Account Age</span>
                <span className="text-sm font-medium">
                  {analysis.factors.age_score}/100
                </span>
              </div>
              <Progress value={analysis.factors.age_score} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-400">Balance History</span>
                <span className="text-sm font-medium">
                  {analysis.factors.balance_score}/100
                </span>
              </div>
              <Progress
                value={analysis.factors.balance_score}
                className="h-1"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-400">
                  Transaction History
                </span>
                <span className="text-sm font-medium">
                  {analysis.factors.transaction_score}/100
                </span>
              </div>
              <Progress
                value={analysis.factors.transaction_score}
                className="h-1"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-400">Reputation</span>
                <span className="text-sm font-medium">
                  {analysis.factors.reputation_score}/100
                </span>
              </div>
              <Progress
                value={analysis.factors.reputation_score}
                className="h-1"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
