"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  LinkIcon,
  Presentation,
  Shield,
  Table,
  Target,
  Wallet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Edit,
  Trash2,
  Users,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { getBusinessProposalById } from "@/data/business-proposals"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AIWalletAnalysisComponent } from "@/components/ai-wallet-analysis"
import { getAIWalletAnalysis } from "@/data/ai-wallet-analysis"

export default function BusinessProposalPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isConnected, connect } = useWallet()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Get proposal data
  const proposal = getBusinessProposalById(params.id)

  // Get AI wallet analysis
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
        return <FileText className="h-5 w-5 text-red-400" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-400" />
      case "spreadsheet":
        return <Table className="h-5 w-5 text-green-400" />
      case "presentation":
        return <Presentation className="h-5 w-5 text-yellow-400" />
      case "contract":
        return <FileText className="h-5 w-5 text-purple-400" />
      default:
        return <FileText className="h-5 w-5 text-slate-400" />
    }
  }

  const handleDelete = () => {
    toast({
      title: "Proposal Deleted",
      description: `Your business proposal has been deleted.`,
    })

    setIsDeleteDialogOpen(false)
    router.push("/borrow")
  }

  if (!proposal) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Proposal Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The business proposal you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/borrow")} className="web3-button">
          Back to Proposals
        </Button>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to view and interact with this business proposal.
        </p>
        <Button onClick={connect} className="web3-button">
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4 hover:bg-slate-800/50" onClick={() => router.push("/borrow")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Proposals
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
              {proposal.logo ? (
                <Image src={proposal.logo || "/placeholder.svg"} alt={proposal.companyName} width={64} height={64} />
              ) : (
                <div className="text-3xl font-bold">{proposal.companyName.charAt(0)}</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{proposal.companyName}</h1>
              <div className="flex items-center gap-2 text-slate-400">
                <Wallet className="h-4 w-4" />
                <span>Accepts {proposal.acceptedToken} Only</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`
                ${
                  proposal.walletAnalysis.riskLevel === "low"
                    ? "bg-green-500/20 text-green-500 border-green-500/50"
                    : proposal.walletAnalysis.riskLevel === "medium"
                      ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                      : "bg-red-500/20 text-red-500 border-red-500/50"
                } text-sm px-3 py-1
              `}
            >
              {proposal.walletAnalysis.riskLevel.charAt(0).toUpperCase() + proposal.walletAnalysis.riskLevel.slice(1)}{" "}
              Risk
            </Badge>

            <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/50 text-sm px-3 py-1">
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Target Funding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">{proposal.targetFunding}</p>
              <p className="text-sm text-slate-400 mb-1">{proposal.acceptedToken}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">{proposal.duration}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Expected Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">{proposal.expectedReturn}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-5 bg-slate-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="business-plan">Business Plan</TabsTrigger>
              <TabsTrigger value="wallet-analysis">Wallet Analysis</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="investors">Investors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Business Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-slate-300 whitespace-pre-line">{proposal.fullDescription}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Key Information</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Proposed By</p>
                          <p className="text-sm font-medium truncate">
                            {proposal.proposerWallet.slice(0, 6)}...{proposal.proposerWallet.slice(-4)}
                          </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Proposed On</p>
                          <p className="text-sm font-medium">{formatDate(proposal.proposedAt)}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Deadline</p>
                          <p className="text-sm font-medium">{formatDate(proposal.deadline)}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Minimum Investment</p>
                          <p className="text-sm font-medium">
                            {proposal.minimumInvestment} {proposal.acceptedToken}
                          </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Maximum Investment</p>
                          <p className="text-sm font-medium">
                            {proposal.maximumInvestment} {proposal.acceptedToken}
                          </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Investors</p>
                          <p className="text-sm font-medium">{proposal.investorCount}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Funding Progress</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">
                            {proposal.currentFunding} / {proposal.targetFunding}
                          </span>
                          <span>
                            {(
                              (Number.parseFloat(proposal.currentFunding.replace(/[^0-9.-]+/g, "")) /
                                Number.parseFloat(proposal.targetFunding.replace(/[^0-9.-]+/g, ""))) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (Number.parseFloat(proposal.currentFunding.replace(/[^0-9.-]+/g, "")) /
                              Number.parseFloat(proposal.targetFunding.replace(/[^0-9.-]+/g, ""))) *
                            100
                          }
                          className="h-2 bg-slate-800"
                        />
                      </div>
                    </div>

                    {proposal.website && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Links</h3>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => window.open(proposal.website, "_blank")}
                          >
                            <LinkIcon className="h-4 w-4" /> Website
                          </Button>
                          {proposal.socialMedia?.twitter && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => window.open(proposal.socialMedia?.twitter, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" /> Twitter
                            </Button>
                          )}
                          {proposal.socialMedia?.linkedin && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => window.open(proposal.socialMedia?.linkedin, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" /> LinkedIn
                            </Button>
                          )}
                          {proposal.socialMedia?.telegram && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => window.open(proposal.socialMedia?.telegram, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" /> Telegram
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {proposal.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-slate-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business-plan" className="space-y-6">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Business Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Business Model</h3>
                      <p className="text-slate-300 whitespace-pre-line">{proposal.businessPlan}</p>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Investment Terms</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <Target className="h-4 w-4 text-primary" />
                            <p className="font-medium">Target Funding</p>
                          </div>
                          <p className="text-slate-300">
                            {proposal.targetFunding} {proposal.acceptedToken}
                          </p>
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Trust Score</p>
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-xl font-bold ${
                                proposal.walletAnalysis.trustScore >= 80
                                  ? "text-green-500"
                                  : proposal.walletAnalysis.trustScore >= 60
                                    ? "text-yellow-500"
                                    : "text-red-500"
                              }`}
                            >
                              {proposal.walletAnalysis.trustScore}/100
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Activity Level</p>
                          <p className="text-xl font-bold">
                            {proposal.walletAnalysis.activityLevel.charAt(0).toUpperCase() +
                              proposal.walletAnalysis.activityLevel.slice(1)}
                          </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Account Age</p>
                          <p className="text-xl font-bold">{proposal.walletAnalysis.accountAge}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Verification</p>
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
                            Low risk proposals typically have verified wallets with strong history of successful
                            projects.
                          </p>
                        ) : proposal.walletAnalysis.riskLevel === "medium" ? (
                          <p className="text-yellow-500 text-sm">
                            Medium risk proposals may have limited history or some unverified elements. Exercise
                            caution.
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
                              <span>Uploaded on {formatDate(document.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investors" className="space-y-6">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Investors</CardTitle>
                  <CardDescription>People who have invested in this proposal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {proposal.investorCount > 0 ? (
                      <div className="space-y-4">
                        {/* This would be populated with actual investor data in a real application */}
                        {Array.from({ length: Math.min(proposal.investorCount, 5) }).map((_, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                <Users className="h-5 w-5 text-slate-400" />
                              </div>
                              <div>
                                <p className="font-medium">Investor {index + 1}</p>
                                <p className="text-xs text-slate-400">
                                  {(
                                    Number.parseFloat(proposal.currentFunding.replace(/[^0-9.-]+/g, "")) /
                                    proposal.investorCount
                                  ).toFixed(2)}{" "}
                                  {proposal.acceptedToken}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-slate-800 border-slate-700">
                              {formatDate(
                                new Date(
                                  Date.parse(proposal.proposedAt) +
                                    Math.floor(
                                      Math.random() * (Date.parse(proposal.deadline) - Date.parse(proposal.proposedAt)),
                                    ),
                                ).toISOString(),
                              )}
                            </Badge>
                          </div>
                        ))}

                        <div className="flex justify-center mt-6">
                          <Button variant="outline" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            View All {proposal.investorCount} Investors
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Investors Yet</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                          This proposal hasn't received any investments yet. Be the first to invest!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="web3-card sticky top-24">
            <CardHeader>
              <CardTitle>Proposal Management</CardTitle>
              <CardDescription>Manage your business proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        proposal.status === "active"
                          ? "bg-green-500/20 text-green-500 border-green-500/50"
                          : proposal.status === "funded"
                            ? "bg-blue-500/20 text-blue-500 border-blue-500/50"
                            : "bg-red-500/20 text-red-500 border-red-500/50"
                      }
                    `}
                  >
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Created On</p>
                  <p className="text-sm font-medium">{formatDate(proposal.proposedAt)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Deadline</p>
                  <p className="text-sm font-medium">{formatDate(proposal.deadline)}</p>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Funding Progress</p>
                  <p className="text-sm font-medium">
                    {(
                      (Number.parseFloat(proposal.currentFunding.replace(/[^0-9.-]+/g, "")) /
                        Number.parseFloat(proposal.targetFunding.replace(/[^0-9.-]+/g, ""))) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <Progress
                  value={
                    (Number.parseFloat(proposal.currentFunding.replace(/[^0-9.-]+/g, "")) /
                      Number.parseFloat(proposal.targetFunding.replace(/[^0-9.-]+/g, ""))) *
                    100
                  }
                  className="h-2 bg-slate-800"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>
                    {proposal.currentFunding} / {proposal.targetFunding}
                  </span>
                  <span>{proposal.investorCount} investors</span>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => router.push(`/borrow/${params.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Proposal
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => router.push(`/borrow/${params.id}/analytics`)}
                >
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/30 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Proposal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="web3-card sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-red-500">Delete Proposal</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this proposal? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
