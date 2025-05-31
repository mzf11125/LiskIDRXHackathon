"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Calendar,
  Wallet,
  AlertCircle,
  DollarSign,
  Lock,
  Percent,
  ChevronRight,
  BarChart3,
  FileText,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { lendingABI } from "@/contracts/lendingABI";
import { contractAddress } from "@/data/mock-data";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/components/wallet-provider";
import WalletAnalytics from "@/components/wallet-analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RepayLoanForm from "@/components/repay-loan-form";
import {
  fetchBusinessProposals,
  getUserProposals,
} from "@/data/business-proposals";
import type { BusinessProposal } from "@/types/business-proposal";
import CreateProposalForm from "./create-proposal-form";
import { pools } from "@/data/mock-data";
import BorrowCryptoForm from "./borrow-crypto-form";
import { useProfile } from "@/components/ui/use-profile";
import { checkProfileCompletion } from "@/data/business-proposals";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, AlertTriangle } from "lucide-react";
import useAxios from "@/hooks/use-axios";
import { useToast } from "@/hooks/use-toast";

export default function BorrowPage() {
  const { isConnected, connect, address } = useWallet();
  const { profile, fetchProfile, isProfileComplete } = useProfile();
  const router = useRouter();
  const { toast } = useToast();
  const api = useAxios();

  // Add hooks for contract data
  const { data: totalCollateralValue } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: lendingABI,
    functionName: "getTotalCollateralValueInDebtToken",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 5 seconds
    },
  });

  const { data: loanInfo } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: lendingABI,
    functionName: "getLoanInfo",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 5 seconds
    },
    account: address ? (address as `0x${string}`) : undefined
  });

  const calculateHealthFactorBps = () => {
    if (!totalCollateralValue || !loanInfo) return null;

    const collateralValue = totalCollateralValue;
    const debtValue = loanInfo.debt - loanInfo.repaid;

    if (debtValue === 0n) return 0;

    // Apply LTV to collateral first (10000 is BPS_DENOMINATOR from contract)
    const riskAdjustedCollateral = (collateralValue * BigInt(7000)) / BigInt(10000);

    // Then calculate health factor
    const healthFactorBps = (riskAdjustedCollateral * BigInt(10000)) / BigInt(debtValue);

    return Number(healthFactorBps);
  };

  const healthFactor = calculateHealthFactorBps();
  const healthFactorPercentage = !healthFactor
    ? "No Active Loans"
    : (healthFactor / 100).toFixed(2);


  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] =
    useState<BusinessProposal | null>(null);
  const [proposals, setProposals] = useState<BusinessProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<{
    complete: boolean;
    missingFields: string[];
  }>({
    complete: false,
    missingFields: [],
  });
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false);

  useEffect(() => {
    const loadProposals = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        // Use the new getUserProposals function
        const userProposals = await getUserProposals();
        setProposals(userProposals);
      } catch (error) {
        console.error("Error loading proposals:", error);
        setProposals([]);
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, [isConnected, address]);

  // Check profile completion on mount
  useEffect(() => {
    if (isConnected && address) {
      const checkProfile = async () => {
        setIsCheckingProfile(true);
        try {
          await fetchProfile();
          const status = await checkProfileCompletion();
          setProfileStatus(status);
        } catch (error) {
          console.error("Error checking profile:", error);
        } finally {
          setIsCheckingProfile(false);
        }
      };

      checkProfile();
    } else {
      setIsCheckingProfile(false);
    }
  }, [isConnected, address, fetchProfile]);

  // Remove the filtering since we're now getting user-specific proposals from API
  const userProposals = proposals;

  // Filter proposals based on search term
  const filteredProposals = userProposals.filter(
    (proposal) =>
      proposal.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.short_description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proposal.accepted_token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProposal = (proposal: BusinessProposal) => {
    setEditingProposal(proposal);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!address) return;

    try {
      await api.delete(`/proposals/${proposalId}`);

      // Refresh proposals list
      const response = await api.get(`/proposals/by-wallet/${address}`);
      setProposals(response.data.proposals || []);

      toast({
        title: "Proposal Deleted",
        description: "Your proposal has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting your proposal.",
        variant: "destructive",
      });
    }
  };

  const handleProposalSuccess = async () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingProposal(null);

    // Refresh proposals list
    if (address) {
      try {
        const userProposals = await getUserProposals();
        setProposals(userProposals);
      } catch (error) {
        console.error("Error refreshing proposals:", error);
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">
          Connect Your Wallet
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to access the borrowing features.
        </p>
        <Button onClick={connect} className="web3-button">
          Connect Wallet
        </Button>
      </div>
    );
  }

  // Show profile completion requirement
  if (!isCheckingProfile && !profileStatus.complete) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="web3-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl gradient-text">
                    Complete Your Profile
                  </CardTitle>
                  <p className="text-slate-400 mt-2">
                    You need to complete your business profile before creating
                    proposals.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Missing required fields:{" "}
                  {profileStatus.missingFields.join(", ")}
                </AlertDescription>
              </Alert>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Required Information:</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Display Name</li>
                  <li>• Email Address</li>
                  <li>• Company Name</li>
                  <li>• Your Position in Company</li>
                  <li>• Company Website</li>
                  <li>• Company Description</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/profile")}
                  className="web3-button flex-1"
                >
                  Complete Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Loading...</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Fetching your business proposals...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Borrow</h1>
          <p className="text-slate-400 mt-2">
            Borrow crypto assets or create business funding proposals
          </p>
        </div>
        <div className="flex gap-3">
          <Card className="web3-card p-4 flex items-center gap-3">
            <AlertCircle className="text-yellow-500 h-5 w-5" />
            <p className="text-sm">
              Your wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="crypto" className="space-y-8">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="crypto">Borrow Crypto</TabsTrigger>
          <TabsTrigger value="proposals">My Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="web3-card col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="gradient-text">
                  Borrow Crypto with Collateral
                </CardTitle>
                <CardDescription>
                  Borrow cryptocurrency by providing collateral assets. Monitor
                  your positions and manage your risk.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" /> Total Debt:
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold gradient-text">
                        {loanInfo ?
                          `${Number(formatUnits(loanInfo.debt - loanInfo.repaid, 2))} IDRX`
                          : "0 IDRX"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center">
                        <Lock className="h-4 w-4 mr-1" /> Your Collateral
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold gradient-text">
                        {totalCollateralValue && `${formatUnits(totalCollateralValue, 2)} IDRX`}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center">
                        <Plus className="h-4 w-4 mr-1" /> Health Factor
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold gradient-text">
                        {healthFactorPercentage}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Dialog
                    open={isBorrowDialogOpen}
                    onOpenChange={setIsBorrowDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="web3-button">
                        <DollarSign className="mr-2 h-4 w-4" /> Borrow Crypto
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="web3-card sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
                      style={{ position: "fixed" }}
                    >
                      <DialogHeader>
                        <DialogTitle className="gradient-text text-xl">
                          Borrow Cryptocurrency
                        </DialogTitle>
                        <DialogDescription>
                          Borrow crypto assets by providing collateral. Monitor
                          your health factor to avoid liquidation.
                        </DialogDescription>
                      </DialogHeader>
                      <BorrowCryptoForm
                        onSuccess={() => setIsBorrowDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isRepayDialogOpen}
                    onOpenChange={setIsRepayDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="web3-button">
                        <DollarSign className="mr-2 h-4 w-4" /> Repay Loan
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="web3-card sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
                      style={{ position: "fixed" }}
                    >
                      <DialogHeader>
                        <DialogTitle className="gradient-text text-xl">
                          Repay Cryptocurrency Loan
                        </DialogTitle>
                        <DialogDescription>
                          Repay your outstanding loan and reduce your debt position.
                        </DialogDescription>
                      </DialogHeader>
                      <RepayLoanForm onSuccess={() => setIsRepayDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isAnalyticsDialogOpen}
                    onOpenChange={setIsAnalyticsDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-slate-800 border-slate-700"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" /> View Analytics
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="web3-card sm:max-w-[1000px] max-h-[90vh] overflow-y-auto"
                      style={{ position: "fixed" }}
                    >
                      <DialogHeader>
                        <DialogTitle className="gradient-text text-xl">
                          Wallet & Credit Analytics
                        </DialogTitle>
                        <DialogDescription>
                          Comprehensive analysis of your wallet activity and
                          creditworthiness
                        </DialogDescription>
                      </DialogHeader>
                      <WalletAnalytics />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <Card className="web3-card">
              <CardHeader>
                <CardTitle className="gradient-text">
                  Borrowing Markets
                </CardTitle>
                <CardDescription>
                  Available assets for borrowing with current rates and
                  liquidity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pools[0].assets
                  .filter((asset) => asset.borrowEnabled) // Only show borrowable assets (IDRX)
                  .map((asset) => (
                    <div
                      key={asset.symbol}
                      className="flex justify-between items-center p-3 bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                          <Image
                            src={`/placeholder.svg?height=32&width=32`}
                            alt={asset.symbol}
                            width={32}
                            height={32}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-xs text-slate-400">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">2%</div>
                        <div className="text-xs text-slate-400">
                          Fixed APR
                        </div>
                      </div>
                    </div>
                  ))}
                <div className="pt-2">
                  <div className="text-sm text-slate-400 p-2 bg-slate-800/50 rounded-lg">
                    📢 Only IDRX is available for borrowing. Other assets (BTC,
                    ETH, USDT, etc.) can be used as collateral to secure your
                    loans.
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href="/markets"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    View all markets <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 w-full"
              />
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="web3-button">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="web3-card sm:max-w-[800px] max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="gradient-text text-xl">
                    Create Business Proposal
                  </DialogTitle>
                  <DialogDescription>
                    Fill out the form below to create a new business proposal
                    for funding.
                  </DialogDescription>
                </DialogHeader>
                <CreateProposalForm onSuccess={handleProposalSuccess} />
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="active" className="space-y-8">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="active">Active Proposals</TabsTrigger>
              <TabsTrigger value="funded">Funded Proposals</TabsTrigger>
              <TabsTrigger value="expired">Expired/Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {filteredProposals.filter((p) => p.status === "active").length >
                0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProposals
                    .filter((p) => p.status === "active")
                    .map((proposal) => (
                      <Card
                        key={proposal.id}
                        className="web3-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                      >
                        <CardHeader className="pb-2 relative">
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant="outline"
                              className="bg-blue-500/20 text-blue-500 border-blue-500/50"
                            >
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                              {proposal.logo ? (
                                <Image
                                  src={proposal.logo || "/placeholder.svg"}
                                  alt={proposal.company_name}
                                  width={48}
                                  height={48}
                                />
                              ) : (
                                <div className="text-2xl font-bold">
                                  {proposal.company_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg gradient-text">
                                {proposal.company_name}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> Requesting{" "}
                                {proposal.accepted_token}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-300 mb-4">
                            {proposal.short_description}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <TrendingUp className="h-3 w-3" /> Return
                              </div>
                              <p className="text-sm font-medium gradient-text">
                                {proposal.expected_return}
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <Wallet className="h-3 w-3" /> Target
                              </div>
                              <p className="text-sm font-medium">
                                {proposal.target_funding}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">
                                Funding Progress
                              </span>
                              <span>
                                {(
                                  (Number.parseFloat(
                                    proposal.current_funding.replace(
                                      /[^0-9.-]+/g,
                                      ""
                                    )
                                  ) /
                                    Number.parseFloat(
                                      proposal.target_funding.replace(
                                        /[^0-9.-]+/g,
                                        ""
                                      )
                                    )) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                (Number.parseFloat(
                                  proposal.current_funding.replace(
                                    /[^0-9.-]+/g,
                                    ""
                                  )
                                ) /
                                  Number.parseFloat(
                                    proposal.target_funding.replace(
                                      /[^0-9.-]+/g,
                                      ""
                                    )
                                  )) *
                                100
                              }
                              className="h-1.5 bg-slate-800"
                            />
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>
                                {proposal.current_funding} /{" "}
                                {proposal.target_funding}
                              </span>
                              <span>{proposal.investor_count} investors</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                          <div className="flex justify-between w-full gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-slate-800 border-slate-700 flex-1"
                              onClick={() => handleEditProposal(proposal)}
                            >
                              <Edit className="mr-1 h-4 w-4" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-900/20 border-red-800/30 hover:bg-red-900/40 text-red-400 flex-1"
                              onClick={() => handleDeleteProposal(proposal.id)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> Delete
                            </Button>
                          </div>
                          <Link href={`/borrow/${proposal.id}`} className="w-full">
                            <Button className="w-full web3-button group">
                              View Details{" "}
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card className="web3-card p-8 text-center">
                  <CardTitle className="mb-4 gradient-text">
                    No Active Proposals
                  </CardTitle>
                  <CardDescription className="text-slate-400 mb-6">
                    {searchTerm
                      ? "No proposals match your search criteria. Try adjusting your search."
                      : "You don't have any active business proposals. Create a new proposal to get started."}
                  </CardDescription>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="web3-button"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Proposal
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="funded" className="space-y-6">
              {filteredProposals.filter((p) => p.status === "funded").length >
                0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProposals
                    .filter((p) => p.status === "funded")
                    .map((proposal) => (
                      <Card
                        key={proposal.id}
                        className="web3-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                      >
                        <CardHeader className="pb-2 relative">
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant="outline"
                              className="bg-green-500/20 text-green-500 border-green-500/50"
                            >
                              Funded
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                              {proposal.logo ? (
                                <Image
                                  src={proposal.logo || "/placeholder.svg"}
                                  alt={proposal.company_name}
                                  width={48}
                                  height={48}
                                />
                              ) : (
                                <div className="text-2xl font-bold">
                                  {proposal.company_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg gradient-text">
                                {proposal.company_name}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> Funded with{" "}
                                {proposal.accepted_token}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-300 mb-4">
                            {proposal.short_description}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <TrendingUp className="h-3 w-3" /> Return
                              </div>
                              <p className="text-sm font-medium gradient-text">
                                {proposal.expected_return}
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <Wallet className="h-3 w-3" /> Raised
                              </div>
                              <p className="text-sm font-medium">
                                {proposal.target_funding}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Progress
                              value={100}
                              className="h-1.5 bg-slate-800"
                            />
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>Fully Funded</span>
                              <span>{proposal.investor_count} investors</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link
                            href={`/borrow/${proposal.id}`}
                            className="w-full"
                          >
                            <Button className="w-full web3-button group">
                              View Details{" "}
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card className="web3-card p-8 text-center">
                  <CardTitle className="mb-4 gradient-text">
                    No Funded Proposals
                  </CardTitle>
                  <CardDescription className="text-slate-400 mb-6">
                    You don't have any funded business proposals yet.
                  </CardDescription>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="web3-button"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Proposal
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="expired" className="space-y-6">
              {filteredProposals.filter(
                (p) => p.status === "expired" || p.status === "cancelled"
              ).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProposals
                    .filter(
                      (p) => p.status === "expired" || p.status === "cancelled"
                    )
                    .map((proposal) => (
                      <Card
                        key={proposal.id}
                        className="web3-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                      >
                        <CardHeader className="pb-2 relative">
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant="outline"
                              className="bg-red-500/20 text-red-500 border-red-500/50"
                            >
                              {proposal.status.charAt(0).toUpperCase() +
                                proposal.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                              {proposal.logo ? (
                                <Image
                                  src={proposal.logo || "/placeholder.svg"}
                                  alt={proposal.company_name}
                                  width={48}
                                  height={48}
                                />
                              ) : (
                                <div className="text-2xl font-bold">
                                  {proposal.company_name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg gradient-text">
                                {proposal.company_name}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> Requested{" "}
                                {proposal.accepted_token}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-slate-300 mb-4">
                            {proposal.short_description}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <TrendingUp className="h-3 w-3" /> Return
                              </div>
                              <p className="text-sm font-medium gradient-text">
                                {proposal.expected_return}
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                                <Wallet className="h-3 w-3" /> Target
                              </div>
                              <p className="text-sm font-medium">
                                {proposal.target_funding}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Progress
                              value={
                                (Number.parseFloat(
                                  proposal.current_funding.replace(
                                    /[^0-9.-]+/g,
                                    ""
                                  )
                                ) /
                                  Number.parseFloat(
                                    proposal.target_funding.replace(
                                      /[^0-9.-]+/g,
                                      ""
                                    )
                                  )) *
                                100
                              }
                              className="h-1.5 bg-slate-800"
                            />
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>
                                {proposal.current_funding} /{" "}
                                {proposal.target_funding}
                              </span>
                              <span>{proposal.investor_count} investors</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex w-full gap-3">
                          <Link
                            href={`/borrow/${proposal.id}`}
                            className="w-full"
                          >
                            <Button className="w-full web3-button group">
                              View Details{" "}
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card className="web3-card p-8 text-center">
                  <CardTitle className="mb-4 gradient-text">
                    No Expired or Cancelled Proposals
                  </CardTitle>
                  <CardDescription className="text-slate-400 mb-6">
                    You don't have any expired or cancelled business proposals.
                  </CardDescription>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="web3-button"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Proposal
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Edit Proposal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="web3-card sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">
              Edit Business Proposal
            </DialogTitle>
            <DialogDescription>
              Update your business proposal details.
            </DialogDescription>
          </DialogHeader>
          {editingProposal && (
            <CreateProposalForm
              onSuccess={handleProposalSuccess}
              initialData={editingProposal}
              isEditing={true}
              proposalId={editingProposal.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Repay Loan Dialog */}
      <Dialog open={isRepayDialogOpen} onOpenChange={setIsRepayDialogOpen}>
        <DialogContent className="web3-card sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">
              Repay Loan
            </DialogTitle>
            <DialogDescription>
              Repay your outstanding loan amount.
            </DialogDescription>
          </DialogHeader>
          <RepayLoanForm onSuccess={() => setIsRepayDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
