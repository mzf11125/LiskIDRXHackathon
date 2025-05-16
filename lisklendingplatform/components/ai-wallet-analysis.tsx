"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info, Shield, TrendingUp } from "lucide-react"

interface WalletAnalysis {
  wallet_address: string
  risk_level: "Low" | "Medium" | "High"
  final_score: number
  transaction_volume?: string
  wallet_age?: number
  average_balance?: string
  balance_stability?: string
  transaction_frequency?: string
  transaction_consistency?: string
  defi_interaction?: string
  risk_factors?: string[]
  summary?: string
  lending_recommendation?: string
  investment_recommendation?: string
  risk_mitigation?: string
}

interface AIWalletAnalysisComponentProps {
  analysis: WalletAnalysis
}

export function AIWalletAnalysisComponent({ analysis }: AIWalletAnalysisComponentProps) {
  // Helper function to get risk level color
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

  return (
    <Card className="web3-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Wallet Risk Analysis
            </CardTitle>
            <CardDescription>AI-powered analysis of the wallet</CardDescription>
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

          <div>
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
