"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ArrowRight, TrendingUp, Calendar, Wallet, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { businessProposalsService } from "@/services"
import type { BusinessProposal } from "@/types/business-proposal"

export default function BusinessProposals() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tokenFilter, setTokenFilter] = useState<string | null>(null)
  const [proposals, setProposals] = useState<BusinessProposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true)
      try {
        const data = await businessProposalsService.getActiveProposals()
        setProposals(data)
      } catch (error) {
        console.error("Failed to fetch proposals:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProposals()
  }, [])

  // Filter proposals based on search term and token filter
  const filteredProposals = proposals.filter(
    (proposal) =>
      (tokenFilter === null || proposal.acceptedToken === tokenFilter) &&
      (proposal.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.acceptedToken.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Get unique tokens for filter
  const uniqueTokens = Array.from(new Set(proposals.map((proposal) => proposal.acceptedToken)))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Business Proposals</h2>
          <p className="text-slate-400">Companies seeking funding for their business ventures</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 w-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={tokenFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setTokenFilter(null)}
              className={tokenFilter === null ? "web3-button" : ""}
            >
              All
            </Button>
            {uniqueTokens.map((token) => (
              <Button
                key={token}
                variant={tokenFilter === token ? "default" : "outline"}
                size="sm"
                onClick={() => setTokenFilter(token)}
                className={tokenFilter === token ? "web3-button" : ""}
              >
                {token}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="web3-card animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-700 rounded-md w-2/3 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded-md w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-slate-700 rounded-md w-full mb-4"></div>
                <div className="h-4 bg-slate-700 rounded-md w-5/6 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded-md w-4/6"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="web3-card overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {proposal.logo ? (
                      <Image
                        src={proposal.logo}
                        alt={proposal.companyName}
                        width={40}
                        height={40}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-slate-700 flex items-center justify-center text-xl font-bold">
                        {proposal.companyName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{proposal.companyName}</CardTitle>
                      <CardDescription className="text-xs">
                        <Badge variant="outline" className="text-primary bg-primary/10 border-primary/20">
                          {proposal.acceptedToken}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-slate-300 line-clamp-2 mb-4">{proposal.shortDescription}</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Funding Progress</span>
                      <span className="text-primary">
                        {proposal.currentFunding} / {proposal.targetFunding}
                      </span>
                    </div>
                    <Progress value={(parseFloat(proposal.currentFunding) / parseFloat(proposal.targetFunding)) * 100} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      <span className="text-slate-400">Return:</span>
                      <span className="text-slate-200 font-medium">{proposal.expectedReturn}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-slate-200 font-medium">{proposal.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-primary" />
                      <span className="text-slate-400">Min:</span>
                      <span className="text-slate-200 font-medium">{proposal.minimumInvestment}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span className="text-slate-400">Risk:</span>
                      <span
                        className={`font-medium ${
                          proposal.walletAnalysis.riskLevel === "low"
                            ? "text-green-500"
                            : proposal.walletAnalysis.riskLevel === "medium"
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {proposal.walletAnalysis.riskLevel.charAt(0).toUpperCase() +
                          proposal.walletAnalysis.riskLevel.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/lend/${proposal.id}`} className="w-full">
                  <Button className="w-full web3-button-secondary group" size="sm">
                    View Proposal
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-400">No proposals found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
