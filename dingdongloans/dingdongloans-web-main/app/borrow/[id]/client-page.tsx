"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { useWallet } from "@/components/wallet-provider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
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

interface BusinessProposalClientPageProps {
	params: { id: string };
	initialProposal: any; // Replace with proper type from your data
}

export default function BusinessProposalClientPage({
	params,
	initialProposal: proposal,
}: BusinessProposalClientPageProps) {
	const router = useRouter();
	const { isConnected, connect } = useWallet();
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState("overview");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	// Get AI wallet analysis
	const walletAnalysis = proposal
		? getAIWalletAnalysis(proposal.proposerWallet)
		: null;

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

	const handleDelete = () => {
		toast({
			title: "Proposal Deleted",
			description: `Your business proposal has been deleted.`,
		});

		setIsDeleteDialogOpen(false);
		router.push("/borrow");
	};

	if (!proposal) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h1 className="text-3xl font-bold mb-6 gradient-text">
					Proposal Not Found
				</h1>
				<p className="text-slate-400 mb-8 max-w-md mx-auto">
					The business proposal you're looking for doesn't exist or
					has been removed.
				</p>
				<Button
					onClick={() => router.push("/borrow")}
					className="web3-button"
				>
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
					Please connect your wallet to view and interact with this
					business proposal.
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
									alt={proposal.companyName}
									width={64}
									height={64}
								/>
							) : (
								<div className="text-3xl font-bold">
									{proposal.companyName.charAt(0)}
								</div>
							)}
						</div>
						<div>
							<h1 className="text-3xl font-bold gradient-text">
								{proposal.companyName}
							</h1>
							<div className="flex items-center gap-2 text-slate-400">
								<Wallet className="h-4 w-4" />
								<span>
									Accepts {proposal.acceptedToken} Only
								</span>
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
							{proposal.walletAnalysis.riskLevel
								.charAt(0)
								.toUpperCase() +
								proposal.walletAnalysis.riskLevel.slice(1)}{" "}
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
						<CardTitle className="text-lg">
							Target Funding
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-end gap-2">
							<p className="text-3xl font-bold gradient-text">
								{proposal.targetFunding}
							</p>
							<p className="text-sm text-slate-400 mb-1">
								{proposal.acceptedToken}
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
								{proposal.duration}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="web3-card">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">
							Expected Return
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-end gap-2">
							<p className="text-3xl font-bold gradient-text">
								{proposal.expectedReturn}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				<div className="md:col-span-2">
					<Tabs
						defaultValue="overview"
						value={activeTab}
						onValueChange={setActiveTab}
						className="space-y-8"
					>
						<TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-5 bg-slate-800/50">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="business-plan">
								Business Plan
							</TabsTrigger>
							<TabsTrigger value="wallet-analysis">
								Wallet Analysis
							</TabsTrigger>
							<TabsTrigger value="documents">
								Documents
							</TabsTrigger>
							<TabsTrigger value="investors">
								Investors
							</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-6">
							{/* Overview tab content */}
							<Card className="web3-card">
								<CardHeader>
									<CardTitle>About the Company</CardTitle>
								</CardHeader>
								<CardContent className="text-slate-400">
									<p>{proposal.companyDescription}</p>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value="business-plan"
							className="space-y-6"
						>
							{/* Business Plan tab content */}
							<Card className="web3-card">
								<CardHeader>
									<CardTitle>Business Plan</CardTitle>
								</CardHeader>
								<CardContent className="text-slate-400">
									<p>{proposal.businessPlan}</p>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value="wallet-analysis"
							className="space-y-6"
						>
							{/* Wallet Analysis tab content */}
							<Card className="web3-card">
								<CardHeader>
									<CardTitle>Wallet Analysis</CardTitle>
								</CardHeader>
								<CardContent>
									{walletAnalysis ? (
										<AIWalletAnalysisComponent
											analysis={walletAnalysis}
										/>
									) : (
										<p className="text-slate-400">
											No wallet analysis available for
											this proposal.
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
									{proposal.documents &&
									proposal.documents.length > 0 ? (
										proposal.documents.map(
											(doc: any, index: number) => (
												<div
													key={index}
													className="flex items-center justify-between p-4 rounded-lg bg-slate-800"
												>
													<div className="flex items-center gap-3">
														{getDocumentIcon(
															doc.type
														)}
														<div className="flex flex-col">
															<span className="text-sm font-medium">
																{doc.name}
															</span>
															<span className="text-xs text-slate-400">
																{formatDate(
																	doc.uploadDate
																)}
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
											)
										)
									) : (
										<p className="text-slate-400">
											No documents available for this
											proposal.
										</p>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="investors" className="space-y-6">
							{/* Investors tab content */}
							<Card className="web3-card">
								<CardHeader>
									<CardTitle>Investors</CardTitle>
								</CardHeader>
								<CardContent className="text-slate-400">
									<p>{proposal.investors}</p>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
