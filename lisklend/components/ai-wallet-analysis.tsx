"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Clock,
  Code,
  CreditCard,
  ExternalLink,
  Info,
  Shield,
  Wallet,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { AIWalletAnalysis } from "@/types/wallet-analysis"

interface AIWalletAnalysisProps {
  analysis: AIWalletAnalysis
}

export function AIWalletAnalysisComponent({ analysis }: AIWalletAnalysisProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format transaction time
  const formatTransactionTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Format transaction date
  const formatTransactionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format token value based on decimals
  const formatTokenValue = (value: string, decimals: string) => {
    const decimalValue = Number.parseInt(decimals)
    if (!decimalValue) return value

    const valueNum = BigInt(value)
    const divisor = BigInt(10) ** BigInt(decimalValue)
    const wholePart = valueNum / divisor
    const fractionalPart = valueNum % divisor

    // Pad the fractional part with leading zeros if needed
    const fractionalStr = fractionalPart.toString().padStart(decimalValue, "0")

    return `${wholePart}.${fractionalStr}`
  }

  // Truncate wallet address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Get risk color
  const getRiskColor = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low":
        return "text-green-500"
      case "Medium":
        return "text-yellow-500"
      case "High":
        return "text-red-500"
      default:
        return "text-slate-400"
    }
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  // Get delta icon
  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (delta < 0) return <ArrowDown className="h-4 w-4 text-red-500" />
    return null
  }

  return (
    <Card className="web3-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              AI Wallet Analysis
            </CardTitle>
            <CardDescription>Advanced risk assessment powered by AI</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`
              ${
                analysis.risk_level === "Low"
                  ? "bg-green-500/20 text-green-500 border-green-500/50"
                  : analysis.risk_level === "Medium"
                    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                    : "bg-red-500/20 text-red-500 border-red-500/50"
              } 
              px-3 py-1
            `}
          >
            {analysis.risk_level} Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-slate-400">Trust Score</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Trust score is calculated based on wallet activity, transaction patterns, and risk factors.
                          Higher scores indicate lower risk.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.final_score)}`}>
                    {analysis.final_score.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
                <Progress
                  value={analysis.final_score}
                  max={100}
                  className="h-2 mt-2"
                  style={{
                    background: "linear-gradient(to right, #ef4444, #eab308, #22c55e)",
                  }}
                />
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Wallet Age</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-lg font-medium">{analysis.wallet_metadata.age_days} days</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Created on {formatDate(analysis.wallet_metadata.first_seen)}
                </p>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Transaction Activity</h3>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="text-lg font-medium">
                    {analysis.wallet_metadata.total_transactions} transactions
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Last active on {formatDate(analysis.wallet_metadata.last_seen)}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Wallet Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <p className="text-sm font-mono">{analysis.wallet_address}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Network</p>
                  <p className="text-sm">{analysis.network}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Unique Tokens Used</p>
                  <p className="text-sm">{analysis.wallet_metadata.unique_tokens_used}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Contracts Interacted</p>
                  <p className="text-sm">{analysis.wallet_metadata.unique_contracts_interacted}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">All Contracts Verified</p>
                  <p className="text-sm flex items-center gap-1">
                    {analysis.wallet_metadata.all_contracts_verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Yes
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        No
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Linked to Flagged Entity</p>
                  <p className="text-sm flex items-center gap-1">
                    {analysis.wallet_metadata.linked_to_flagged_entity ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Yes
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        No
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Behavioral Patterns</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Outbound Only</p>
                  <Badge
                    variant="outline"
                    className={
                      analysis.behavioral_patterns.outbound_only
                        ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                        : "bg-green-500/20 text-green-500 border-green-500/50"
                    }
                  >
                    {analysis.behavioral_patterns.outbound_only ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Single Contract Usage</p>
                  <Badge
                    variant="outline"
                    className={
                      analysis.behavioral_patterns.contract_usage.single_contract_usage
                        ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                        : "bg-green-500/20 text-green-500 border-green-500/50"
                    }
                  >
                    {analysis.behavioral_patterns.contract_usage.single_contract_usage ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Unverified Contract Usage</p>
                  <Badge
                    variant="outline"
                    className={
                      analysis.behavioral_patterns.contract_usage.unverified_contract_usage
                        ? "bg-red-500/20 text-red-500 border-red-500/50"
                        : "bg-green-500/20 text-green-500 border-green-500/50"
                    }
                  >
                    {analysis.behavioral_patterns.contract_usage.unverified_contract_usage ? "Yes" : "No"}
                  </Badge>
                </div>
                {analysis.behavioral_patterns.transaction_anomalies.length > 0 && (
                  <div>
                    <p className="text-sm mb-2">Transaction Anomalies</p>
                    <div className="space-y-2">
                      {analysis.behavioral_patterns.transaction_anomalies.map((anomaly, index) => (
                        <div key={index} className="bg-slate-800 p-2 rounded text-sm flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                          <p>{anomaly}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Score Breakdown</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${getScoreColor(analysis.final_score)}`}>
                    {analysis.final_score.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
              </div>

              <div className="space-y-4">
                {analysis.scoring_breakdown.map((item, index) => (
                  <Collapsible key={index}>
                    <div className="flex items-center justify-between bg-slate-800/70 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getDeltaIcon(item.score_delta)}
                        <span className="font-medium">{item.criteria}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            item.score_delta > 0
                              ? "text-green-500"
                              : item.score_delta < 0
                                ? "text-red-500"
                                : "text-slate-400"
                          }
                        >
                          {item.score_delta > 0 ? "+" : ""}
                          {item.score_delta.toFixed(1)}
                        </span>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="p-3 bg-slate-800/30 rounded-b-lg mt-px">
                        <p className="text-sm text-slate-300">{item.reason}</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="space-y-4">
              {analysis.transactions.map((tx, index) => (
                <div key={index} className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-700 border-slate-600">
                          {tx.method === "0x9045c025" ? "Contract Call" : tx.method}
                        </Badge>
                        {tx.tx_type.map((type, i) => (
                          <Badge key={i} variant="outline" className="bg-slate-700 border-slate-600">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-slate-400">
                          {formatTransactionDate(tx.timestamp)} at {formatTransactionTime(tx.timestamp)}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            tx.status === "ok"
                              ? "bg-green-500/20 text-green-500 border-green-500/50"
                              : "bg-red-500/20 text-red-500 border-red-500/50"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => window.open(`https://explorer.lisk.com/tx/${tx.tx_hash}`, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Explorer
                    </Button>
                  </div>

                  <Separator className="bg-slate-700 my-3" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">From</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Wallet className="h-3 w-3 text-slate-400" />
                        <span className="font-mono">{truncateAddress(tx.from_address)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">To</p>
                      <div className="flex items-center gap-1 text-sm">
                        {tx.to_is_contract ? (
                          <Code className="h-3 w-3 text-slate-400" />
                        ) : (
                          <Wallet className="h-3 w-3 text-slate-400" />
                        )}
                        <span className="font-mono">{truncateAddress(tx.to_address)}</span>
                        {tx.to_is_contract && !tx.to_is_verified && (
                          <Badge
                            variant="outline"
                            className="bg-red-500/20 text-red-500 border-red-500/50 text-xs ml-1"
                          >
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                    {tx.token_name && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Token</p>
                        <p className="text-sm">{tx.token_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Gas</p>
                      <p className="text-sm">
                        {tx.gas_used.toLocaleString()} / {tx.gas_limit.toLocaleString()} (
                        {(tx.gas_efficiency * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-6">
            <div className="space-y-4">
              {analysis.token_holdings.map((holding, index) => (
                <div key={index} className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                        {holding.token.symbol.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{holding.token.name}</h4>
                        <p className="text-xs text-slate-400">{holding.token.symbol}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-slate-700 border-slate-600">
                      {holding.token.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Balance</p>
                      <p className="text-lg font-medium">
                        {formatTokenValue(holding.value, holding.token.decimals)} {holding.token.symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Contract Address</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Code className="h-3 w-3 text-slate-400" />
                        <span className="font-mono">{truncateAddress(holding.token.address)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-700 my-3" />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Holders</p>
                      <p className="text-sm">{Number.parseInt(holding.token.holders).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Decimals</p>
                      <p className="text-sm">{holding.token.decimals}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Total Supply</p>
                      <p className="text-sm">{formatTokenValue(holding.token.total_supply, holding.token.decimals)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
