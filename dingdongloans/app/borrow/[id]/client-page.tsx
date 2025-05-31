"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useWallet } from "@/components/wallet-provider";
import { useToast } from "@/hooks/use-toast";
import { contractAddress } from "@/data/mock-data";
import { lendingABI } from "@/contracts/lendingABI";
import { useReadContract, useWriteContract, useReadContracts, useWaitForTransactionReceipt, useAccount } from "wagmi";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast as useCustomToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIWalletAnalysisComponent } from "@/components/ai-wallet-analysis";
import { getAIWalletAnalysis } from "@/data/ai-wallet-analysis";
import { getOrAnalyzeWallet } from "@/data/wallet-analysis-api";
import { useAxios } from "@/hooks/use-axios";
import CreateProposalForm from "../create-proposal-form";
import { AIWalletAnalysis, APIWalletAnalysis } from "@/types/wallet-analysis";
import { BusinessProposal } from "@/types/business-proposal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { pools } from "@/data/mock-data";
import { config } from "@/lib/client-config";
import { erc20Abi, parseUnits, formatUnits } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { decodeErrorResult } from "viem";
import { getTransactionError, getUserFriendlyError } from "@/lib/errorHandling";


interface LendingOpportunityPageProps {
  opportunity: any; // Replace with proper type
}
interface ProcessedFunderInfo {
  address: `0x${string}`;
  amount: bigint;
  reward: bigint;
}

interface ProcessedCollateralRaisingInfo {
  isOpen: boolean;
  collateralToken: `0x${string}`;
  target: bigint;
  raised: bigint;
  interestRateInBPS: bigint;
  funders: ProcessedFunderInfo[];
}

function processCollateralRaisingInfo(
  data: CollateralRaisingInfo | undefined
): ProcessedCollateralRaisingInfo | undefined {
  if (!data) return undefined;

  // Process each funder info to convert from tuple to object
  const typedFunderInfo = data[6].map((funder, index) => ({
    address: data[5][index],
    amount: funder.amount,
    reward: funder.reward,
  }));

  // Return a properly typed object for easier access
  return {
    isOpen: data[0],
    collateralToken: data[1],
    target: data[2],
    raised: data[3],
    interestRateInBPS: data[4],
    funders: typedFunderInfo,
  };
}

export type FunderInfo = readonly [amount: bigint, reward: bigint];

export type CollateralRaisingInfo = readonly [
  isOpen: boolean,
  collateralToken: `0x${string}`,
  target: bigint,
  raised: bigint,
  interestRateInBPS: bigint,
  funders: readonly `0x${string}`[],
  funderInfo: FunderInfo[]
];

export type Loan = readonly [debt: bigint, repaid: bigint, dueDate: bigint];


interface BusinessProposalClientPageProps {
  params: { id: string };
  initialProposal: BusinessProposal;
}

export default function BusinessProposalClientPage({
  params,
  initialProposal: proposal,
}: BusinessProposalClientPageProps) {
  const router = useRouter();
  const { isConnected, connect, address: walletAddress } = useWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [documents, setDocuments] = useState(proposal?.documents || []);
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useAxios();
  const { address } = useAccount();

  // Get AI wallet analysis
  const [walletAnalysis, setWalletAnalysis] = useState<AIWalletAnalysis | null>(null);

  // Get API wallet analysis
  const [apiWalletAnalysis, setApiWalletAnalysis] =
    useState<APIWalletAnalysis | null>(null);

  // Get collateral raising info
  const {
    data: collateralRaisingInfoData,
    isLoading: isCollateralRaisingInfoDataLoading,
    error: collateralRaisingInfoError,
  } = useReadContract({
    address: contractAddress,
    abi: lendingABI,
    functionName: "getUserCollateralRaisingInfo",
    args: [proposal.proposer_wallet as `0x${string}`],
    account: proposal.proposer_wallet as `0x${string}`,
    query: {
      enabled: !!proposal.proposer_wallet && !!contractAddress,
    },
  });

  // Process the collateral raising data
  const [processedRaisingInfo, setProcessedRaisingInfo] = useState<ProcessedCollateralRaisingInfo | undefined>(undefined);
  const [currentInvestorCount, setCurrentInvestorCount] = useState(0);
  const [currentFundingAmount, setCurrentFundingAmount] = useState("0");

  // Update processed raising info when data changes
  useEffect(() => {
    const processed = processCollateralRaisingInfo(
      collateralRaisingInfoData as unknown as CollateralRaisingInfo
    );
    setProcessedRaisingInfo(processed);

    if (processed) {
      // Update investor count and current funding
      setCurrentInvestorCount(processed.funders.length);
      const totalRaised = parseFloat(formatUnits(processed.raised, 2));
      setCurrentFundingAmount(totalRaised.toString());
    }
  }, [collateralRaisingInfoData]);

  useEffect(() => {
    if (proposal?.proposer_wallet) {
      // Fetch AI wallet analysis
      getAIWalletAnalysis(proposal.proposer_wallet)
        .then(setWalletAnalysis)
        .catch(console.error);

      // Fetch API wallet analysis
      getOrAnalyzeWallet(proposal.proposer_wallet)
        .then(setApiWalletAnalysis)
        .catch(console.error);
    }
  }, [proposal?.proposer_wallet]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-400" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-400" />;
      case "spreadsheet":
        return <Table className="h-5 w-5 text-green-400" />;
      case "presentation":
        return <Presentation className="h-5 w-5 text-yellow-400" />;
      case "contract":
        return <FileText className="h-5 w-5 text-purple-400" />;
      default:
        return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const handleDeleteProposal = async () => {
    if (!walletAddress || isDeleting) return;

    setIsDeleting(true);
    try {
      await api.delete(`/proposals/${walletAddress}`);

      toast({
        title: "Proposal Deleted",
        description: "Your business proposal has been deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
      router.push("/borrow");
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting your proposal.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await api.delete(`/proposals/${proposal.id}/documents/${documentId}`);

      // Update local documents state
      setDocuments(documents.filter((doc) => doc.id !== documentId));

      toast({
        title: "Document Deleted",
        description: "Document has been removed from your proposal.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the document.",
        variant: "destructive",
      });
    }
  };

  const handleAddDocument = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("type", file.type.split("/")[1] || "document");

      try {
        const response = await api.post(
          `/proposals/${proposal.id}/documents`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error;
      }
    });

    try {
      const newDocuments = await Promise.all(uploadPromises);
      setDocuments([...documents, ...newDocuments]);

      toast({
        title: "Documents Uploaded",
        description: `${newDocuments.length} document(s) added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Some documents failed to upload.",
        variant: "destructive",
      });
    }
  };

  const {
    data: regularTxHash,
    isPending: isRegularTxPending,
    writeContractAsync: writeRegularTx,
    error: regularTxError,
  } = useWriteContract();

  // Regular transaction confirmation
  const {
    isLoading: isRegularTxConfirming,
    isSuccess: isRegularTxConfirmed,
    isError: isRegularTxFailed,
  } = useWaitForTransactionReceipt({
    hash: regularTxHash,
  });


  const handleRepayFunder = async (funderAddress: `0x${string}`, amount: string) => {
    if (!address) return;
    console.log(amount);
    const expectedInterest = Number.parseFloat(proposal.expected_return) / 100 * Number.parseFloat(amount.replace(/[^0-9.-]+/g, ""));
    const interestAmount = expectedInterest.toString();

    try {
      // Get token address from the accepted_token
      const tokenAddress = pools[0].assets.find(a => a.symbol === proposal.accepted_token)?.tokenAddress;
      if (!tokenAddress || !tokenAddress.startsWith('0x')) {
        throw new Error("Invalid token address");
      }

      // Send approval transaction
      const approveResult = await writeRegularTx({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [contractAddress, parseUnits(interestAmount, 2)],
      });

      if (!approveResult) {
        console.error("Failed to submit approval transaction");
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: "Failed to submit approval transaction"
        });
        return;
      }

      toast({
        title: "Approval submitted",
        description: "Waiting for confirmation..."
      });

      console.log("Approval transaction submitted:", approveResult);

      // Wait for the approval transaction to be confirmed
      const approvalReceipt = await waitForTransactionReceipt(config, {
        hash: approveResult,
      });

      console.log("Approval confirmed in block:", approvalReceipt.blockNumber);

      toast({
        title: "Approval confirmed",
        description: "Proceeding with repayment..."
      });

      // Send repayFunder transaction
      const repayResult = await writeRegularTx({
        address: contractAddress,
        abi: lendingABI,
        functionName: "repayFunder",
        args: [
          funderAddress,
          parseUnits(amount, 2),
          parseUnits(interestAmount, 2),
        ],
      });

      if (!repayResult) {
        console.error("Failed to submit repay transaction");
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: "Failed to submit repay transaction",
        });
        return;
      }

      toast({
        title: "Repayment submitted",
        description: "Waiting for confirmation..."
      });

      console.log("Repay transaction submitted:", repayResult);

      // Wait for repay transaction to be confirmed
      const repayReceipt = await waitForTransactionReceipt(config, {
        hash: repayResult,
      });

      console.log("Repay confirmed in block:", repayReceipt.blockNumber);

      toast({
        title: "Repayment successful!",
        description: `Successfully repaid ${amount} ${proposal.accepted_token} with ${interestAmount} ${proposal.accepted_token} interest to funder.`
      });

    } catch (error) {
      console.error("Transaction failed:", error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      const match = errorMessage.match(/data="([^"]+)"/);

      if (match && match[1]) {
        const parsedError = match[1].split(",")[0];
        try {
          const decodedError = decodeErrorResult({
            abi: lendingABI,
            data: parsedError as `0x${string}`,
          });

          // Get user-friendly error message based on error name
          const userMessage = getUserFriendlyError(decodedError.errorName);

          console.error("Transaction failed:", {
            errorName: decodedError.errorName,
            args: decodedError.args,
            userMessage,
          });

          toast({
            variant: "destructive",
            title: "Transaction failed",
            description: userMessage,
          });
        } catch (decodeError) {
          console.error("Failed to decode contract error:", {
            original: errorMessage,
            parsed: parsedError,
            decodeError,
          });
          toast({
            variant: "destructive",
            title: "Transaction failed",
            description: "Failed to decode contract error"
          });
        }
      } else {
        // Handle non-contract errors (e.g. network errors, user rejected, etc)
        const friendlyMessage = getTransactionError(errorMessage);
        console.error("Transaction failed:", friendlyMessage);

        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: friendlyMessage
        });
      }
    }
  };

  const closeCollateralRaising = async () => {
    if (!address) return;

    try {
      const result = await writeRegularTx({
        address: contractAddress,
        abi: lendingABI,
        functionName: "closeCollateralRaising",
        args: [],
      });

      if (!result) {
        console.error("Failed to submit close collateral raising transaction");
        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: "Failed to submit transaction"
        });
        return;
      }

      toast({
        title: "Transaction submitted",
        description: "Waiting for confirmation..."
      });

      console.log("Close collateral raising transaction submitted:", result);

      // Wait for transaction to be confirmed
      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      console.log("Transaction confirmed in block:", receipt.blockNumber);

      toast({
        title: "Success!",
        description: "Collateral raising has been closed successfully."
      });

    } catch (error) {
      console.error("Transaction failed:", error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      const match = errorMessage.match(/data="([^"]+)"/);

      if (match && match[1]) {
        const parsedError = match[1].split(",")[0];
        try {
          const decodedError = decodeErrorResult({
            abi: lendingABI,
            data: parsedError as `0x${string}`,
          });

          // Get user-friendly error message based on error name
          const userMessage = getUserFriendlyError(decodedError.errorName);

          console.error("Transaction failed:", {
            errorName: decodedError.errorName,
            args: decodedError.args,
            userMessage,
          });

          toast({
            variant: "destructive",
            title: "Transaction failed",
            description: userMessage,
          });
        } catch (decodeError) {
          console.error("Failed to decode contract error:", {
            original: errorMessage,
            parsed: parsedError,
            decodeError,
          });
          toast({
            variant: "destructive",
            title: "Transaction failed",
            description: "Failed to decode contract error"
          });
        }
      } else {
        // Handle non-contract errors (e.g. network errors, user rejected, etc)
        const friendlyMessage = getTransactionError(errorMessage);
        console.error("Transaction failed:", friendlyMessage);

        toast({
          variant: "destructive",
          title: "Transaction failed",
          description: friendlyMessage
        });
      }
    }
  }

  if (!proposal) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">
          Proposal Not Found
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The business proposal you're looking for doesn't exist or has been
          removed.
        </p>
        <Button onClick={() => router.push("/borrow")} className="web3-button">
          Back to Proposals
        </Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">
          Connect Your Wallet
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to view and interact with this business
          proposal.
        </p>
        <Button onClick={connect} className="web3-button">
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4 hover:bg-slate-800/50"
          onClick={() => router.push("/borrow")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Proposals
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
              {proposal.logo ? (
                <Image
                  src={proposal.logo || "/placeholder.svg"}
                  alt={proposal.company_name}
                  width={64}
                  height={64}
                />
              ) : (
                <div className="text-3xl font-bold">
                  {proposal.company_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                {proposal.company_name}
              </h1>
              <div className="flex items-center gap-2 text-slate-400">
                <Wallet className="h-4 w-4" />
                <span>Accepts {proposal.accepted_token} Only</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`
                ${proposal.wallet_analysis?.risk_level === "low"
                  ? "bg-green-500/20 text-green-500 border-green-500/50"
                  : proposal.wallet_analysis?.risk_level === "medium"
                    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                    : "bg-red-500/20 text-red-500 border-red-500/50"
                } text-sm px-3 py-1
              `}
            >
              {proposal.wallet_analysis.risk_level.charAt(0).toUpperCase() +
                proposal.wallet_analysis.risk_level.slice(1)}{" "}
              Risk
            </Badge>

            <Badge
              variant="outline"
              className="bg-blue-500/20 text-blue-500 border-blue-500/50 text-sm px-3 py-1"
            >
              {proposal.status.charAt(0).toUpperCase() +
                proposal.status.slice(1)}
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
              <p className="text-3xl font-bold gradient-text">
                {proposal.target_funding}
              </p>
              <p className="text-sm text-slate-400 mb-1">
                {proposal.accepted_token}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">
                {proposal.duration || "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Expected Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold gradient-text">
                {proposal.expected_return}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <Badge
                    variant="outline"
                    className={`mb-4
                        ${proposal?.wallet_analysis?.risk_level === "low"
                        ? "bg-green-500/20 text-green-500 border-green-500/50"
                        : proposal?.wallet_analysis?.risk_level === "medium"
                          ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                          : "bg-red-500/20 text-red-500 border-red-500/50"
                      }
                      `}
                  >
                    {(proposal.wallet_analysis?.risk_level || "unknown")
                      .charAt(0)
                      .toUpperCase() +
                      (
                        proposal.wallet_analysis?.risk_level || "unknown"
                      ).slice(1)}{" "}
                    Risk
                  </Badge>
                  <p className="text-sm text-slate-400">
                    {proposal.short_description}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      Expected Return
                    </div>
                    <p className="text-sm font-medium">
                      {proposal.expected_return}%
                    </p>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Duration
                    </div>
                    <p className="text-sm font-medium">
                      {proposal.duration || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      <Target className="h-3 w-3 inline mr-1" />
                      Target
                    </div>
                    <p className="text-sm font-medium">
                      {proposal.target_funding}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      <Users className="h-3 w-3 inline mr-1" />Investors
                    </div>
                    <p className="text-sm font-medium">
                      {isCollateralRaisingInfoDataLoading ? "Loading..." : currentInvestorCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:w-80">
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">
                Funding Progress
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">
                  {isCollateralRaisingInfoDataLoading
                    ? "Loading..."
                    : `${currentFundingAmount} ${proposal.accepted_token}`}
                </span>
                <span className="text-slate-400">
                  of {proposal.target_funding}
                </span>
              </div>
              <Progress
                value={
                  isCollateralRaisingInfoDataLoading
                    ? 0
                    : (Number(currentFundingAmount) / Number.parseFloat(proposal.target_funding.replace(/[^0-9.-]+/g, ""))) * 100
                }
                className="h-2"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Minimum Investment</span>
                <span>{proposal.minimum_investment}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Maximum Investment</span>
                <span>{proposal.maximum_investment}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Pooled</span>
                <span>{proposal.total_pooled}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="md:col-span-2">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-5 bg-slate-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="business-plan">Business Plan</TabsTrigger>
              <TabsTrigger value="wallet-analysis">Wallet Analysis</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="investors">Investors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overview tab content */}
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>About the Company</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-400">
                  <p>{proposal.full_description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business-plan" className="space-y-6">
              {/* Business Plan tab content */}
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Business Plan</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-400">
                  <p>{proposal.business_plan}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet-analysis" className="space-y-6">
              {/* Wallet Analysis tab content */}
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Wallet Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {walletAnalysis ? (
                    <AIWalletAnalysisComponent analysis={walletAnalysis} />
                  ) : (
                    <p className="text-slate-400">
                      No wallet analysis available for this proposal.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {/* Documents tab content */}
              <Card className="web3-card">
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {proposal.documents && proposal.documents.length > 0 ? (
                    proposal.documents.map((doc: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          {getDocumentIcon(doc.type)}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {doc.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDate(doc.uploadDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-slate-400 hover:text-slate-200"
                            onClick={() => {
                              /* Download document */
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-slate-400 hover:text-slate-200"
                            onClick={() => {
                              /* View document */
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">
                      No documents available for this proposal.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="investors" className="space-y-6">
              <Card className="web3-card">
                <CardHeader>
                  <div className="flex justify-between items-center w-full">
                    <CardTitle>
                      Investors
                    </CardTitle>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={closeCollateralRaising}
                    >
                      Close Collateral Raising
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        if (processedRaisingInfo?.funders) {
                          processedRaisingInfo.funders.forEach(funder => {
                            handleRepayFunder(funder.address, formatUnits(funder.amount, 2));
                          });
                        }
                      }}
                    >
                      Repay All Funders
                    </Button>

                  </div>
                  <CardDescription>
                    {isCollateralRaisingInfoDataLoading
                      ? "Loading investors..."
                      : `${currentInvestorCount} active investor${currentInvestorCount !== 1 ? 's' : ''}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCollateralRaisingInfoDataLoading ? (
                    <div className="text-slate-400">Loading investor data...</div>
                  ) : processedRaisingInfo?.funders && processedRaisingInfo.funders.length > 0 ? (
                    <div className="space-y-4">
                      {processedRaisingInfo.funders.map((funder, index) => (<div
                        key={funder.address}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {funder.address}
                            </span>
                            <span className="text-xs text-slate-400">
                              Invested: {formatUnits(funder.amount, 2)} {proposal.accepted_token}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-slate-400">
                            Expected Return: {formatUnits(funder.reward, 2)} {proposal.accepted_token}
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRepayFunder(funder.address, formatUnits(funder.amount, 2))}
                          >
                            Repay
                          </Button>
                        </div>
                      </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400">No investors yet.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="space-y-6">


        {/* Risk Badge and Project Stats */}




        {/* Edit Proposal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="web3-card sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="gradient-text text-xl">
                Edit Proposal
              </DialogTitle>
              <DialogDescription>
                Update your business proposal details.
              </DialogDescription>
            </DialogHeader>
            <CreateProposalForm
              onSuccess={() => {
                setIsEditDialogOpen(false);
                // Refresh page or update proposal data
                window.location.reload();
              }}
              initialData={proposal}
              isEditing={true}
              proposalId={proposal.id}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Proposal</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this business proposal? This
                action cannot be undone and will remove all associated
                documents.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProposal}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Proposal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
