"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CheckCircle, AlertTriangle, XCircle, ChevronRight, Calendar, Clock, Shield } from "lucide-react"
import {
  FilePdf,
  FileImage,
  FileSpreadsheet,
  FilePresentation,
  FileText,
  Download,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AIWalletAnalysisComponent } from "@/components/ai-wallet-analysis"
import { getAIWalletAnalysis } from "@/data/ai-wallet-analysis"
import { businessProposalsService } from "@/services"
import type { BusinessProposal } from "@/types/business-proposal"

export default function BusinessProposalPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isConnected, connect } = useWallet()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [lendAmount, setLendAmount] = useState("")
  const [isLendDialogOpen, setIsLendDialogOpen] = useState(false)
  const [proposal, setProposal] = useState<BusinessProposal | null>(null)
  const [loading, setLoading] = useState(true)

  // Get proposal data
  useEffect(() => {
    const fetchProposal = async () => {
      setLoading(true)
      try {
        const data = await businessProposalsService.getProposalById(params.id)
        if (data) {
          setProposal(data)
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load proposal details. Proposal not found.",
          })
          router.push("/lend")
        }
      } catch (error) {
        console.error("Failed to fetch proposal:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load proposal details. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [params.id, toast, router])

  // Get wallet analysis for the business proposal owner
  const walletAnalysis = proposal ? getAIWalletAnalysis(proposal.proposerWallet) : null

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FilePdf className="h-5 w-5 text-primary" />
      case "image":
        return <FileImage className="h-5 w-5 text-primary" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-5 w-5 text-primary" />
      case "presentation":
        return <FilePresentation className="h-5 w-5 text-primary" />
      default:
        return <FileText className="h-5 w-5 text-primary" />
    }
  }

  // Handle lending
  const handleLend = () => {
    if (!isConnected) {
      connect()
      return
    }

    if (!lendAmount || parseFloat(lendAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to lend",
      })
      return
    }

    toast({
      title: "Investment submitted",
      description: `You have successfully invested ${lendAmount} ${proposal?.acceptedToken} in ${proposal?.companyName}`,
    })

    setIsLendDialogOpen(false)
    setLendAmount("")
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-slate-800 rounded w-1/3"></div>
          <div className="h-10 bg-slate-800 rounded w-3/4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-800 rounded"></div>
            <div className="h-64 bg-slate-800 rounded"></div>
            <div className="h-64 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="container py-16 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Proposal not found</h2>
        <p className="text-slate-400 mb-8">The business proposal you're looking for doesn't exist or has been removed.</p>
        <Button className="web3-button" onClick={() => router.push("/lend")}>
          Back to Proposals
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/lend">Lending</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">{proposal.companyName}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          {proposal.logo ? (
            <Image src={proposal.logo} alt={proposal.companyName} width={64} height={64} className="rounded-lg" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-2xl font-bold">
              {proposal.companyName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{proposal.companyName}</h1>
            <p className="text-slate-400">{proposal.shortDescription}</p>
          </div>
        </div>
        <Button className="web3-button" onClick={() => setIsLendDialogOpen(true)}>
          Lend Now
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-b border-slate-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallet-analysis">Wallet Analysis</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="web3-card">
            <CardHeader>
              <CardTitle>Business Description</CardTitle>
              <CardDescription>Detailed information about the business proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">About the Project</h3>
                <p className="text-slate-300 mb-4 whitespace-pre-line">{proposal.fullDescription}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium mb-2">Business Plan</h4>
                    <p className="text-slate-300 whitespace-pre-line">{proposal.businessPlan}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium mb-2">Project Details</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <p className="font-medium">Expected Return</p>
                        </div>
                        <p className="text-slate-300">{proposal.expectedReturn}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          <p className="font-medium">Duration</p>
                        </div>
                        <p className="text-slate-300">{proposal.duration}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-primary" />
                          <p className="font-medium">Deadline</p>
                        </div>
                        <p className="text-slate-300">{formatDate(proposal.deadline)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div>
                <h3 className="text-lg font-medium mb-2">Investment Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="font-medium">Minimum Investment</p>
                    <p className="text-slate-300">
                      {proposal.minimumInvestment} {proposal.acceptedToken}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="font-medium">Maximum Investment</p>
                    <p className="text-slate-300">
                      {proposal.maximumInvestment} {proposal.acceptedToken}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet-analysis" className="space-y-6">
          {walletAnalysis ? (
            <AIWalletAnalysisComponent analysis={walletAnalysis} />
          ) : (
            <Card className="web3-card">
              <CardHeader>
                <CardTitle>Wallet Analysis</CardTitle>
                <CardDescription>AI-powered analysis of the proposer's wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Wallet Information</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Trust Score</p>
                        <p className="text-xl font-bold">{proposal.walletAnalysis.trustScore}/100</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Activity Level</p>
                        <p className="text-xl font-bold">
                          {proposal.walletAnalysis.activityLevel.charAt(0).toUpperCase() +
                            proposal.walletAnalysis.activityLevel.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Account Age</p>
                        <p className="text-xl font-bold">{proposal.walletAnalysis.accountAge}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Verification Status</p>
                        <p
                          className={`text-xl font-bold ${
                            proposal.walletAnalysis.verificationStatus === "verified"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {proposal.walletAnalysis.verificationStatus.charAt(0).toUpperCase() +
                            proposal.walletAnalysis.verificationStatus.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Proposal History</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Previous Proposals</p>
                        <p className="text-xl font-bold">{proposal.walletAnalysis.previousProposals}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Successful Proposals</p>
                        <p className="text-xl font-bold">{proposal.walletAnalysis.successfulProposals}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">AI Analysis Comments</h3>
                    <div className="space-y-2">
                      {proposal.walletAnalysis.comments.map((comment, index) => (
                        <div key={index} className="flex items-start gap-2 bg-slate-800/30 p-3 rounded-lg">
                          {proposal.walletAnalysis.riskLevel === "low" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          ) : proposal.walletAnalysis.riskLevel === "medium" ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                          )}
                          <p className="text-slate-300">{comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <p className="font-medium">Risk Assessment</p>
                    </div>
                    <p className="text-slate-300 mb-2">
                      This proposal has been classified as{" "}
                      <span
                        className={
                          proposal.walletAnalysis.riskLevel === "low"
                            ? "text-green-500 font-medium"
                            : proposal.walletAnalysis.riskLevel === "medium"
                              ? "text-yellow-500 font-medium"
                              : "text-red-500 font-medium"
                        }
                      >
                        {proposal.walletAnalysis.riskLevel} risk
                      </span>
                      . This assessment is based on the proposer's wallet history, verification status, and previous
                      proposal performance.
                    </p>
                    {proposal.walletAnalysis.riskLevel === "low" ? (
                      <p className="text-green-500 text-sm">
                        Low risk proposals typically have verified wallets with strong history of successful projects.
                      </p>
                    ) : proposal.walletAnalysis.riskLevel === "medium" ? (
                      <p className="text-yellow-500 text-sm">
                        Medium risk proposals may have limited history or some unverified elements. Exercise caution.
                      </p>
                    ) : (
                      <p className="text-red-500 text-sm">
                        High risk proposals have unverified wallets, limited history, or other concerning factors.
                        Invest with extreme caution.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="web3-card">
            <CardHeader>
              <CardTitle>Business Documents</CardTitle>
              <CardDescription>Important documents related to this business proposal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(document.type)}
                      <div>
                        <p className="font-medium">{document.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{document.type.toUpperCase()}</span>
                          <span>•</span>
                          <span>{document.size}</span>
                          <span>•</span>
                          <span>Uploaded {formatDate(document.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary" asChild>
                      <a href={document.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" /> Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isLendDialogOpen} onOpenChange={setIsLendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lend to {proposal.companyName}</DialogTitle>
            <DialogDescription>
              You are about to lend {proposal.acceptedToken} to this business proposal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-3 rounded-lg text-sm">
                <p className="text-slate-400">Minimum</p>
                <p className="font-medium">
                  {proposal.minimumInvestment} {proposal.acceptedToken}
                </p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg text-sm">
                <p className="text-slate-400">Maximum</p>
                <p className="font-medium">
                  {proposal.maximumInvestment} {proposal.acceptedToken}
                </p>
              </div>
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={lendAmount}
                onChange={(e) => setLendAmount(e.target.value)}
                className="bg-slate-800 border-slate-700 pr-16"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                {proposal.acceptedToken}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-slate-400">Expected Return</p>
              <p className="text-primary">{proposal.expectedReturn}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-slate-400">Duration</p>
              <p>{proposal.duration}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="web3-button w-full" onClick={handleLend}>
              Confirm Lending
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
