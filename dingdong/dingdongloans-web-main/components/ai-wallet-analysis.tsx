"use client"

import { useState } from "react"
import { format } from "date-fns"
import { AlertTriangle, CheckCircle, Clock, Code, ExternalLink, Info, Shield, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { AIWalletAnalysis } from "@/types/wallet-analysis"

interface AIWalletAnalysisComponentProps {
  analysis: AIWalletAnalysis
}

export function AIWalletAnalysisComponent({ analysis }: AIWalletAnalysisComponentProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (e) {
      return dateString
    }
  }

  // Format token value (remove scientific notation)
  const formatTokenValue = (value: string) => {
    const num = Number.parseFloat(value)
    if (isNaN(num)) return value

    // If the number is very large, format it with commas
    if (num > 1000000) {
      return num.toLocaleString()
    }

    return value
  }

  // Get risk level color
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      case "high":
        return "text-red-500"
      default:
        return "text-slate-400"
    }
  }

  // Get risk level icon
  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "high":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-slate-400" />
    }
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  // Get score delta color
  const getScoreDeltaColor = (delta: number) => {
    if (delta > 0) return "text-green-500"
    if (delta < 0) return "text-red-500"
    return "text-slate-400"
  }

  // Get transaction status icon
  const getTransactionStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "ok":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <Card className="web3-card">
      <CardHeader>
        <CardTitle>AI Wallet Analysis</CardTitle>
        <CardDescription>
          Comprehensive analysis of wallet {analysis.wallet_address.slice(0, 6)}...{analysis.wallet_address.slice(-4)}
        </CardDescription>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Risk Score</h3>
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        analysis.risk_level.toLowerCase() === "low"
                          ? "bg-green-500/20 text-green-500 border-green-500/50"
                          : analysis.risk_level.toLowerCase() === "medium"
                            ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                            : "bg-red-500/20 text-red-500 border-red-500/50"
                      }
                    `}
                  >
                    {analysis.risk_level} Risk
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={getScoreColor(analysis.final_score)}>{analysis.final_score.toFixed(1)}/100</span>
                    <span className="text-xs text-slate-400">Analysis: {formatDate(analysis.analysis_timestamp)}</span>
                  </div>
                  <Progress
                    value={analysis.final_score}
                    max={100}
                    className="h-2 bg-slate-700"
                    indicatorClassName={
                      analysis.final_score >= 70
                        ? "bg-green-500"
                        : analysis.final_score >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Wallet Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network</span>
                    <span>{analysis.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Age</span>
                    <span>{analysis.wallet_metadata.age_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">First Seen</span>
                    <span>{formatDate(analysis.wallet_metadata.first_seen)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Seen</span>
                    <span>{formatDate(analysis.wallet_metadata.last_seen)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Transaction Activity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Transactions</span>
                    <span>{analysis.wallet_metadata.total_transactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inbound</span>
                    <span>{analysis.wallet_metadata.inbound_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Outbound</span>
                    <span>{analysis.wallet_metadata.outbound_count}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Token Usage</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unique Tokens</span>
                    <span>{analysis.wallet_metadata.unique_tokens_used}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Only Transfers</span>
                    <span>{analysis.wallet_metadata.uses_only_transfers ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Token Holdings</span>
                    <span>{analysis.token_holdings.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Contract Interaction</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unique Contracts</span>
                    <span>{analysis.wallet_metadata.unique_contracts_interacted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">All Verified</span>
                    <span>{analysis.wallet_metadata.all_contracts_verified ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flagged Entity</span>
                    <span>{analysis.wallet_metadata.linked_to_flagged_entity ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Behavioral Patterns</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {analysis.behavioral_patterns.outbound_only ? (
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                      Outbound Only
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                      Balanced Activity
                    </Badge>
                  )}

                  {analysis.behavioral_patterns.contract_usage.single_contract_usage && (
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                      Single Contract Usage
                    </Badge>
                  )}

                  {analysis.behavioral_patterns.contract_usage.unverified_contract_usage && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/50">
                      Unverified Contract Usage
                    </Badge>
                  )}
                </div>

                {analysis.behavioral_patterns.transaction_anomalies.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Transaction Anomalies:</p>
                    <ul className="space-y-1">
                      {analysis.behavioral_patterns.transaction_anomalies.map((anomaly, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <span>{anomaly}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.behavioral_patterns.transaction_anomalies.length === 0 && (
                  <p className="text-sm text-slate-400">No transaction anomalies detected.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Risk Assessment Summary</h3>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                This wallet has been classified as{" "}
                <span className={getRiskLevelColor(analysis.risk_level)}>{analysis.risk_level.toLowerCase()} risk</span>{" "}
                with a score of{" "}
                <span className={getScoreColor(analysis.final_score)}>{analysis.final_score.toFixed(1)}/100</span>. The
                assessment is based on transaction history, contract interactions, and behavioral patterns.
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  {getRiskLevelIcon(analysis.risk_level)}
                  <p className="text-sm">
                    {analysis.risk_level === "Low" && "This wallet shows patterns consistent with legitimate usage."}
                    {analysis.risk_level === "Medium" &&
                      "This wallet shows some concerning patterns but no definitive red flags."}
                    {analysis.risk_level === "High" &&
                      "This wallet shows multiple patterns associated with high-risk behavior."}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm">
                    Key factors: {analysis.wallet_metadata.age_days} days old,
                    {analysis.wallet_metadata.total_transactions} transactions,
                    {analysis.wallet_metadata.unique_tokens_used} unique tokens,
                    {analysis.wallet_metadata.unique_contracts_interacted} contracts interacted with.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Final Score</h3>
                <div className="flex items-center gap-2">
                  <span className={getScoreColor(analysis.final_score)}>{analysis.final_score.toFixed(1)}/100</span>
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        analysis.risk_level.toLowerCase() === "low"
                          ? "bg-green-500/20 text-green-500 border-green-500/50"
                          : analysis.risk_level.toLowerCase() === "medium"
                            ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                            : "bg-red-500/20 text-red-500 border-red-500/50"
                      }
                    `}
                  >
                    {analysis.risk_level} Risk
                  </Badge>
                </div>
              </div>
              <Progress
                value={analysis.final_score}
                max={100}
                className="h-3 bg-slate-700"
                indicatorClassName={
                  analysis.final_score >= 70
                    ? "bg-green-500"
                    : analysis.final_score >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Scoring Breakdown</h3>

              <div className="space-y-2">
                {analysis.scoring_breakdown.map((item, index) => (
                  <div key={index} className="bg-slate-800/30 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{item.criteria}</span>
                      <span className={getScoreDeltaColor(item.score_delta)}>
                        {item.score_delta > 0 ? "+" : ""}
                        {item.score_delta.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Scoring Methodology</h3>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                The wallet risk score is calculated based on multiple factors including transaction patterns, contract
                interactions, token usage, and wallet age. Each factor contributes positively or negatively to the final
                score.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/30 p-2 rounded-lg">
                  <span className="text-green-500">Positive factors</span>: Wallet age, consistent transaction patterns,
                  verified contract usage
                </div>
                <div className="bg-slate-800/30 p-2 rounded-lg">
                  <span className="text-red-500">Negative factors</span>: Unverified contracts, single contract usage,
                  limited token diversity
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Transaction History</h3>
                <span className="text-sm text-slate-400">Total: {analysis.wallet_metadata.total_transactions}</span>
              </div>

              <div className="space-y-3">
                {analysis.transactions.map((tx, index) => (
                  <Accordion key={index} type="single" collapsible className="w-full">
                    <AccordionItem value={`tx-${index}`} className="border-0">
                      <AccordionTrigger className="bg-slate-800/30 p-3 rounded-lg hover:bg-slate-800/50 hover:no-underline">
                        <div className="flex items-center gap-3 w-full text-left">
                          <div className="flex-shrink-0">{getTransactionStatusIcon(tx.status)}</div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {tx.method === "0x9045c025" ? "Contract Call" : tx.method}
                              </span>
                              {tx.token_name && (
                                <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/50">
                                  {tx.token_name}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate">{formatDate(tx.timestamp)}</div>
                          </div>
                          <div className="text-right text-sm hidden md:block">
                            <div className="truncate">
                              To: {tx.to_address.slice(0, 6)}...{tx.to_address.slice(-4)}
                            </div>
                            <div className="text-xs text-slate-400">{tx.tx_type.join(", ")}</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="bg-slate-800/20 px-3 pb-3 rounded-b-lg mt-px">
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Transaction Hash</span>
                                <span className="font-mono">
                                  {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Block</span>
                                <span>{tx.block_number}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Method</span>
                                <span>{tx.method}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Status</span>
                                <span className={tx.status === "ok" ? "text-green-500" : "text-red-500"}>
                                  {tx.status.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">From</span>
                                <span className="font-mono">
                                  {tx.from_address.slice(0, 6)}...{tx.from_address.slice(-4)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">To</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono">
                                    {tx.to_address.slice(0, 6)}...{tx.to_address.slice(-4)}
                                  </span>
                                  {tx.to_is_contract && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Code className="h-3 w-3 text-slate-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Contract {tx.to_is_verified ? "(Verified)" : "(Unverified)"}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Value</span>
                                <span>{tx.value_wei} wei</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Gas Used</span>
                                <span>
                                  {tx.gas_used} ({(tx.gas_efficiency * 100).toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <a
                              href={`https://explorer.lisk.com/tx/${tx.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 text-primary hover:underline"
                            >
                              View on Explorer <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Token Holdings</h3>
                <span className="text-sm text-slate-400">Total: {analysis.token_holdings.length} tokens</span>
              </div>

              <div className="space-y-3">
                {analysis.token_holdings.map((holding, index) => (
                  <div key={index} className="bg-slate-800/30 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                          {holding.token.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{holding.token.name}</div>
                          <div className="text-xs text-slate-400">{holding.token.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatTokenValue(holding.value)}</div>
                        <div className="text-xs text-slate-400">{holding.token.type}</div>
                      </div>
                    </div>

                    <Separator className="bg-slate-700 my-2" />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contract</span>
                        <span className="font-mono">
                          {holding.token.address.slice(0, 6)}...{holding.token.address.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Decimals</span>
                        <span>{holding.token.decimals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Holders</span>
                        <span>{holding.token.holders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Supply</span>
                        <span>{formatTokenValue(holding.token.total_supply)}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <a
                        href={`https://explorer.lisk.com/token/${holding.token.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 text-primary hover:underline"
                      >
                        View Token <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
