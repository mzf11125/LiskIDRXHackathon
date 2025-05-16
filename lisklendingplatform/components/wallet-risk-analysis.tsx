"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, HelpCircle, Info, Shield, TrendingUp } from "lucide-react"
import { useWallet } from "./wallet-provider"
import { useWalletAnalysis } from "@/hooks/use-wallet-analysis"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"

export function WalletRiskAnalysis() {
  const { address, isConnected } = useWallet()
  const { analysis, isLoading, error, fetchWalletAnalysis } = useWalletAnalysis()
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      fetchWalletAnalysis(address)
    }
  }, [isConnected, address, fetchWalletAnalysis])

  if (!isConnected) {
    return (
      <Card className="web3-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Wallet Risk Analysis
          </CardTitle>
          <CardDescription>Connect your wallet to view your risk analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <HelpCircle className="h-16 w-16 text-slate-500 mb-4" />
            <p className="text-slate-400 text-center">Connect your wallet to see your risk analysis and credit score</p>
          </div>
        </CardContent>
      </Card>
    )
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
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !analysis) {
    return (
      <Card className="web3-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Analysis Error
          </CardTitle>
          <CardDescription>We couldn't analyze your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-slate-400 text-center mb-4">
              {error || "There was an error analyzing your wallet. Please try again later."}
            </p>
            <Button onClick={() => address && fetchWalletAnalysis(address)} variant="outline">
              Retry Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Helper function to get color based on risk level
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      case "high":
        return "text-red-500"
      default:
        return "text-blue-500"
    }
  }

  // Helper function to get badge variant based on risk level
  const getRiskBadgeVariant = (riskLevel: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "outline"
      case "medium":
        return "secondary"
      case "high":
        return "destructive"
      default:
        return "default"
    }
  }

  // Helper function to get progress color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <Card className="web3-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Wallet Risk Analysis
            </CardTitle>
            <CardDescription>
              Analysis for {address?.slice(0, 6)}...{address?.slice(-4)}
            </CardDescription>
          </div>
          <Badge variant={getRiskBadgeVariant(analysis.risk_level)}>{analysis.risk_level} Risk</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Credit Score</span>
              <span className="text-sm font-bold">{analysis.final_score}/100</span>
            </div>
            <Progress
              value={analysis.final_score}
              className="h-2"
              indicatorClassName={getScoreColor(analysis.final_score)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Transaction Volume</span>
              </div>
              <p className="text-2xl font-bold">{analysis.transaction_volume || "N/A"}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Age (days)</span>
              </div>
              <p className="text-2xl font-bold">{analysis.wallet_age || "N/A"}</p>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>

          {showDetails && (
            <div className="space-y-4 mt-4">
              <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
              <div className="space-y-2">
                {analysis.risk_factors?.map((factor: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-300">{factor}</p>
                  </div>
                ))}
                {(!analysis.risk_factors || analysis.risk_factors.length === 0) && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-300">No significant risk factors detected</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Balance History</h4>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-400">Average</span>
                      <span className="text-xs font-medium">{analysis.average_balance || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Stability</span>
                      <span className="text-xs font-medium">{analysis.balance_stability || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Transaction Pattern</h4>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-400">Frequency</span>
                      <span className="text-xs font-medium">{analysis.transaction_frequency || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Consistency</span>
                      <span className="text-xs font-medium">{analysis.transaction_consistency || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Analysis Summary</h4>
                <p className="text-sm text-slate-300">{analysis.summary || "No summary available."}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
