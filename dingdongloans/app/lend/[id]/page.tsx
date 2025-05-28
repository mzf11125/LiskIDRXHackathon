"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  Info,
  Shield,
  Star,
  Wallet,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { getLendingOpportunityById } from "@/data/lending-opportunities"

export default function LendingOpportunityPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isConnected, connect } = useWallet()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [lendAmount, setLendAmount] = useState("")
  const [isLendDialogOpen, setIsLendDialogOpen] = useState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)

  // Get lending opportunity data
  const opportunity = getLendingOpportunityById(params.id)

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate expected returns
  const calculateReturns = () => {
    if (!lendAmount || isNaN(Number.parseFloat(lendAmount))) return "0"

    const principal = Number.parseFloat(lendAmount)
    const rate = Number.parseFloat(opportunity?.interestRate.replace("%", "") || "0") / 100

    // Simple interest calculation for demonstration
    // In a real app, this would be more complex based on compounding, etc.
    let returns = principal * rate

    // If duration is in days, adjust the returns
    if (opportunity?.duration.includes("day")) {
      const days = Number.parseInt(opportunity.duration.split("-")[0])
      returns = (principal * rate * days) / 365
    }

    return returns.toFixed(2)
  }

  const handleLendSubmit = () => {
    if (!lendAmount || Number.parseFloat(lendAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to lend.",
      })
      return
    }

    // Check min/max limits
    const amount = Number.parseFloat(lendAmount)
    const minAmount = Number.parseFloat(opportunity?.minLendAmount.split(" ")[0].replace(/,/g, "") || "0")
    const maxAmount = Number.parseFloat(opportunity?.maxLendAmount.split(" ")[0].replace(/,/g, "") || "0")

    if (amount < minAmount) {
      toast({
        variant: "destructive",
        title: "Amount too low",
        description: `The minimum lending amount is ${opportunity?.minLendAmount}.`,
      })
      return
    }

    if (amount > maxAmount) {
      toast({
        variant: "destructive",
        title: "Amount too high",
        description: `The maximum lending amount is ${opportunity?.maxLendAmount}.`,
      })
      return
    }

    // Close the input dialog and open confirmation dialog
    setIsLendDialogOpen(false)
    setIsConfirmationDialogOpen(true)
  }

  const handleConfirmLend = () => {
    toast({
      title: "Lending successful",
      description: `You have successfully lent ${lendAmount} ${opportunity?.asset.symbol}.`,
    })
    setIsConfirmationDialogOpen(false)
    setLendAmount("")
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Lending Opportunity Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The lending opportunity you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/lend")} className="web3-button">
          Back to Lending Opportunities
        </Button>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to view and interact with this lending opportunity.
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
        <Button variant="ghost" className="mb-4 hover:bg-slate-800/50" onClick={() => router.push("/lend")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lending Opportunities
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
              {opportunity.asset.icon ? (
                <Image
                  src={opportunity.asset.icon || "/placeholder.svg"}
                  alt={opportunity.asset.name}
                  width={64}
                  height={64}
                />
              ) : (
                <div className="text-3xl font-bold">{opportunity.asset.symbol.charAt(0)}</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{opportunity.title}</h1>
              <div className="flex items-center gap-2 text-slate-400">
                <Wallet className="h-4 w-4" />
                <span>
                  {opportunity.asset.name} ({opportunity.asset.symbol})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`
                ${
                  opportunity.riskLevel === "low"
                    ? "bg-green-500/20 text-green-500 border-green-500/50"
                    : opportunity.riskLevel === "medium"
                      ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                      : "bg-red-500/20 text-red-500 border-red-500/50"
                } text-sm px-3 py-1
              `}
            >
              {opportunity.riskLevel.charAt(0).toUpperCase() + opportunity.riskLevel.slice(1)} Risk
            </Badge>

            <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/50 text-sm px-3 py-1">
              {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Interest Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">{opportunity.interestRate}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Interest rate info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Annual Percentage Yield (APY): {opportunity.apy}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">{opportunity.duration}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">{opportunity.totalAvailable.split(" ")[0]}</p>
              <p className="text-sm text-slate-400 mb-1">{opportunity.asset.symbol}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 bg-slate-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lender-profile">Lender Profile</TabsTrigger>
              <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Opportunity Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-slate-300 whitespace-pre-line">{opportunity.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Key Information</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Created On</p>
                          <p className="text-sm font-medium">{formatDate(opportunity.createdAt)}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Expires On</p>
                          <p className="text-sm font-medium">{formatDate(opportunity.expiresAt)}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Minimum Lending</p>
                          <p className="text-sm font-medium">{opportunity.minLendAmount}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Maximum Lending</p>
                          <p className="text-sm font-medium">{opportunity.maxLendAmount}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Borrowers</p>
                          <p className="text-sm font-medium">{opportunity.borrowersCount}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Lenders</p>
                          <p className="text-sm font-medium">{opportunity.lendersCount}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Utilization</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">
                            {opportunity.totalBorrowed} / {opportunity.totalAvailable}
                          </span>
                          <span>{opportunity.utilizationRate}</span>
                        </div>
                        <Progress value={Number.parseInt(opportunity.utilizationRate)} className="h-2 bg-slate-800" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Risk Assessment</h3>
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <p className="font-medium">
                            Risk Level: {opportunity.riskLevel.charAt(0).toUpperCase() + opportunity.riskLevel.slice(1)}
                          </p>
                        </div>
                        <p className="text-slate-300 mb-2">
                          This lending opportunity has been classified as{" "}
                          <span
                            className={
                              opportunity.riskLevel === "low"
                                ? "text-green-500 font-medium"
                                : opportunity.riskLevel === "medium"
                                  ? "text-yellow-500 font-medium"
                                  : "text-red-500 font-medium"
                            }
                          >
                            {opportunity.riskLevel} risk
                          </span>
                          . This assessment is based on the lender's profile, historical performance, and market
                          conditions.
                        </p>
                        {opportunity.riskLevel === "low" ? (
                          <p className="text-green-500 text-sm">
                            Low risk opportunities typically have verified lenders with strong history of successful
                            loans and stable assets.
                          </p>
                        ) : opportunity.riskLevel === "medium" ? (
                          <p className="text-yellow-500 text-sm">
                            Medium risk opportunities may have higher returns but come with increased volatility or less
                            established lenders.
                          </p>
                        ) : (
                          <p className="text-red-500 text-sm">
                            High risk opportunities offer the highest potential returns but have significant risk of
                            loss. Lend with extreme caution.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lender-profile" className="space-y-6">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Lender Profile</CardTitle>
                  <CardDescription>Information about the lender providing this opportunity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="w-24 h-24 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {opportunity.lenderProfile.avatar ? (
                          <Image
                            src={opportunity.lenderProfile.avatar || "/placeholder.svg"}
                            alt={opportunity.lenderProfile.name}
                            width={96}
                            height={96}
                          />
                        ) : (
                          <div className="text-4xl font-bold">{opportunity.lenderProfile.name.charAt(0)}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{opportunity.lenderProfile.name}</h3>
                          {opportunity.lenderProfile.verificationStatus === "verified" && (
                            <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          Wallet: {opportunity.lenderProfile.address.slice(0, 8)}...
                          {opportunity.lenderProfile.address.slice(-8)}
                        </p>
                        <p className="text-sm text-slate-400">
                          Joined: {formatDate(opportunity.lenderProfile.joinedDate)}
                        </p>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(opportunity.lenderProfile.rating)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : i < opportunity.lenderProfile.rating
                                      ? "text-yellow-500 fill-yellow-500 opacity-50"
                                      : "text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{opportunity.lenderProfile.rating.toFixed(1)}</span>
                        </div>
                        {opportunity.lenderProfile.description && (
                          <p className="text-slate-300 mt-2">{opportunity.lenderProfile.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-sm text-slate-400">Total Lent</p>
                        <p className="text-lg font-bold">{opportunity.lenderProfile.totalLent}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-sm text-slate-400">Successful Loans</p>
                        <p className="text-lg font-bold">{opportunity.lenderProfile.successfulLoans}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-sm text-slate-400">Default Rate</p>
                        <p className="text-lg font-bold">{opportunity.lenderProfile.defaultRate}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-sm text-slate-400">Rating</p>
                        <p className="text-lg font-bold">{opportunity.lenderProfile.rating.toFixed(1)}/5.0</p>
                      </div>
                    </div>

                    {opportunity.lenderProfile.socialLinks && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Links</h3>
                        <div className="flex flex-wrap gap-3">
                          {opportunity.lenderProfile.socialLinks.website && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => window.open(opportunity.lenderProfile.socialLinks?.website, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" /> Website
                            </Button>
                          )}
                          {opportunity.lenderProfile.socialLinks.twitter && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => window.open(opportunity.lenderProfile.socialLinks?.twitter, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" /> Twitter
                            </Button>
                          )}
                          {opportunity.lenderProfile.socialLinks.telegram && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => window.open(opportunity.lenderProfile.socialLinks?.telegram, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" /> Telegram
                            </Button>
                          )}
                          {opportunity.lenderProfile.socialLinks.discord && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => window.open(opportunity.lenderProfile.socialLinks?.discord, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" /> Discord
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terms" className="space-y-6">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                  <CardDescription>Please review these terms before lending</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ul className="space-y-2">
                      {opportunity.termsAndConditions.map((term, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <p className="text-slate-300">{term}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="bg-slate-800/50 p-4 rounded-lg mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <p className="font-medium">Important Notice</p>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Lending cryptocurrencies involves risk. Past performance is not indicative of future results.
                        Please ensure you understand the risks involved before proceeding. By lending through this
                        platform, you acknowledge that you have read and agree to the terms and conditions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {opportunity.faq.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-slate-300">{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                    <AccordionItem value="item-general-1">
                      <AccordionTrigger className="text-left">
                        What happens if I want to withdraw early?
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Early withdrawal policies depend on the specific terms of this lending opportunity. For this{" "}
                        {opportunity.duration} opportunity, please refer to the Terms & Conditions tab for details on
                        any early withdrawal fees or restrictions.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-general-2">
                      <AccordionTrigger className="text-left">How are my funds secured?</AccordionTrigger>
                      <AccordionContent className="text-slate-300">
                        Your funds are secured through a combination of smart contract security, regular audits, and
                        insurance coverage. The platform implements industry-standard security practices to protect user
                        assets.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="web3-card sticky top-24">
            <CardHeader>
              <CardTitle>Lend {opportunity.asset.symbol}</CardTitle>
              <CardDescription>
                Earn {opportunity.interestRate} by lending your {opportunity.asset.symbol}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Asset</p>
                  <p className="text-sm font-medium">
                    {opportunity.asset.name} ({opportunity.asset.symbol})
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Interest Rate</p>
                  <p className="text-sm font-medium text-primary">{opportunity.interestRate}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">APY</p>
                  <p className="text-sm font-medium text-primary">{opportunity.apy}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Duration</p>
                  <p className="text-sm font-medium">{opportunity.duration}</p>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Minimum Lending</p>
                  <p className="text-sm font-medium">{opportunity.minLendAmount}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Maximum Lending</p>
                  <p className="text-sm font-medium">{opportunity.maxLendAmount}</p>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Utilization Rate</p>
                  <p className="text-sm font-medium">{opportunity.utilizationRate}</p>
                </div>
                <Progress value={Number.parseInt(opportunity.utilizationRate)} className="h-2 bg-slate-800" />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>
                    {opportunity.totalBorrowed} / {opportunity.totalAvailable}
                  </span>
                  <span>{opportunity.borrowersCount} borrowers</span>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Risk Level</p>
                  <p
                    className={`text-sm font-medium ${
                      opportunity.riskLevel === "low"
                        ? "text-green-500"
                        : opportunity.riskLevel === "medium"
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  >
                    {opportunity.riskLevel.charAt(0).toUpperCase() + opportunity.riskLevel.slice(1)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">Status</p>
                  <p className="text-sm font-medium">
                    {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setIsLendDialogOpen(true)}
                className="w-full web3-button"
                disabled={opportunity.status !== "active"}
              >
                Lend {opportunity.asset.symbol}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Lending Dialog */}
      <Dialog open={isLendDialogOpen} onOpenChange={setIsLendDialogOpen}>
        <DialogContent className="web3-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Lend {opportunity.asset.symbol}</DialogTitle>
            <DialogDescription>Enter the amount of {opportunity.asset.symbol} you want to lend.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount
                </Label>
                <span className="text-sm text-slate-400">
                  Min: {opportunity.minLendAmount} | Max: {opportunity.maxLendAmount}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  placeholder={`0.00 ${opportunity.asset.symbol}`}
                  value={lendAmount}
                  onChange={(e) => setLendAmount(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Transaction Overview</Label>
              <div className="bg-slate-800/70 rounded-lg p-4 space-y-2 backdrop-blur-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Interest Rate</span>
                  <span>{opportunity.interestRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span>{opportunity.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Returns</span>
                  <span>
                    {calculateReturns()} {opportunity.asset.symbol}
                  </span>
                </div>
                <Separator className="bg-slate-700 my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total to Lend</span>
                  <span>
                    {lendAmount || "0"} {opportunity.asset.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLendSubmit} className="web3-button">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="web3-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Confirm Lending</DialogTitle>
            <DialogDescription>Please review and confirm your lending transaction.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-slate-800/70 rounded-lg p-4 space-y-3 backdrop-blur-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Asset</span>
                <span>
                  {opportunity.asset.name} ({opportunity.asset.symbol})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span>
                  {lendAmount} {opportunity.asset.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interest Rate</span>
                <span>{opportunity.interestRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration</span>
                <span>{opportunity.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expected Returns</span>
                <span>
                  {calculateReturns()} {opportunity.asset.symbol}
                </span>
              </div>
              <Separator className="bg-slate-700 my-1" />
              <div className="flex justify-between font-medium">
                <span>Total to Lend</span>
                <span>
                  {lendAmount} {opportunity.asset.symbol}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300">
                  By confirming this transaction, you agree to the terms and conditions of this lending opportunity.
                  Your funds will be locked for the specified duration unless early withdrawal is permitted.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmLend} className="web3-button">
              Confirm Lending
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
