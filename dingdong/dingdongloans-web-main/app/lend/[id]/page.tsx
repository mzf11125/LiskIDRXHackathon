import { Suspense } from "react";
import LendingOpportunityPage from "./client-page";
import { getLendingProposalById } from "@/data/lending-proposal";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/components/wallet-provider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";

export default async function Page({ params }: { params: { id: string } }) {
	const opportunity = await getLendingProposalById(params.id);

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LendingOpportunityPage opportunity={opportunity} />
		</Suspense>
	);

	// Get lending proposal data
	const opportunity = await getLendingProposalById(params.id);

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Calculate expected returns
	const calculateReturns = () => {
		if (!lendAmount || isNaN(Number.parseFloat(lendAmount))) return "0";

		const principal = Number.parseFloat(lendAmount);
		const rate =
			Number.parseFloat(
				opportunity?.expected_return.replace("%", "") || "0"
			) / 100;
		let returns = principal * rate;

		// If duration is in days, adjust the returns
		if (opportunity?.duration.includes("day")) {
			const days = Number.parseInt(opportunity.duration.split("-")[0]);
			returns = (principal * rate * days) / 365;
		}

		return returns.toFixed(2);
	};

	const handleLendSubmit = () => {
		if (!lendAmount || Number.parseFloat(lendAmount) <= 0) {
			toast({
				variant: "destructive",
				title: "Invalid amount",
				description: "Please enter a valid amount to lend.",
			});
			return;
		}

		// Check min/max limits
		const amount = Number.parseFloat(lendAmount);
		const minAmount = Number.parseFloat(
			opportunity?.minimum_investment.split(" ")[0].replace(/,/g, "") ||
				"0"
		);
		const maxAmount = Number.parseFloat(
			opportunity?.maximum_investment.split(" ")[0].replace(/,/g, "") ||
				"0"
		);

		if (amount < minAmount) {
			toast({
				variant: "destructive",
				title: "Amount too low",
				description: `The minimum investment amount is ${opportunity?.minimum_investment}.`,
			});
			return;
		}

		if (amount > maxAmount) {
			toast({
				variant: "destructive",
				title: "Amount too high",
				description: `The maximum investment amount is ${opportunity?.maximum_investment}.`,
			});
			return;
		}

		// Close the input dialog and open confirmation dialog
		setIsLendDialogOpen(false);
		setIsConfirmationDialogOpen(true);
	};

	const handleConfirmLend = () => {
		toast({
			title: "Investment successful",
			description: `You have successfully invested ${lendAmount} ${opportunity?.accepted_token}.`,
		});
		setIsConfirmationDialogOpen(false);
		setLendAmount("");
	};

	if (!opportunity) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h1 className="text-3xl font-bold mb-6 gradient-text">
					Business Proposal Not Found
				</h1>
				<p className="text-slate-400 mb-8 max-w-md mx-auto">
					The business proposal you're looking for doesn't exist or
					has been removed.
				</p>
				<Button
					onClick={() => router.push("/lend")}
					className="web3-button"
				>
					Back to Business Proposals
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
					lending opportunity.
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
					onClick={() => router.push("/lend")}
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Business
					Proposals
				</Button>

				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
							{opportunity.logo ? (
								<Image
									src={opportunity.logo}
									alt={opportunity.company_name}
									width={64}
									height={64}
								/>
							) : (
								<div className="text-3xl font-bold">
									{opportunity.company_name.charAt(0)}
								</div>
							)}
						</div>
						<div>
							<h1 className="text-3xl font-bold gradient-text">
								{opportunity.company_name}
							</h1>
							<div className="flex items-center gap-2 text-slate-400">
								<Wallet className="h-4 w-4" />
								<span>{opportunity.accepted_token}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Badge
							variant="outline"
							className="bg-blue-500/20 text-blue-500 border-blue-500/50 text-sm px-3 py-1"
						>
							{opportunity.status.charAt(0).toUpperCase() +
								opportunity.status.slice(1)}
						</Badge>
					</div>
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-6 mb-8">
				<Card className="web3-card">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">
							Expected Return
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-end gap-2">
							<p className="text-3xl font-bold gradient-text">
								{opportunity.expected_return}
							</p>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 rounded-full"
										>
											<HelpCircle className="h-4 w-4" />
											<span className="sr-only">
												Interest rate info
											</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											Annual Percentage Yield (APY):{" "}
											{opportunity.apy}
										</p>
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
							<p className="text-3xl font-bold gradient-text">
								{opportunity.duration}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="web3-card">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">
							Total Funding Required
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-end gap-2">
							<p className="text-3xl font-bold gradient-text">
								{opportunity.target_funding}
							</p>
							<p className="text-sm text-slate-400 mb-1">
								{opportunity.accepted_token}
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
						<TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 bg-slate-800/50">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="business-plan">
								Business Plan
							</TabsTrigger>
							<TabsTrigger value="documents">
								Documents
							</TabsTrigger>
							<TabsTrigger value="analysis">Analysis</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-6">
							<Card className="web3-card">
								<CardHeader>
									<CardTitle>
										Business Proposal Overview
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										<div>
											<h3 className="text-lg font-medium mb-2">
												Description
											</h3>
											<p className="text-slate-300 whitespace-pre-line">
												{opportunity.full_description}
											</p>
										</div>

										<div>
											<h3 className="text-lg font-medium mb-2">
												Key Information
											</h3>
											<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
												<div className="bg-slate-800/50 p-4 rounded-lg">
													<p className="text-sm text-slate-400">
														Proposed On
													</p>
													<p className="text-sm font-medium">
														{formatDate(
															opportunity.proposed_at
														)}
													</p>
												</div>
												<div className="bg-slate-800/50 p-4 rounded-lg">
													<p className="text-sm text-slate-400">
														Deadline
													</p>
													<p className="text-sm font-medium">
														{formatDate(
															opportunity.deadline
														)}
													</p>
												</div>
												<div className="bg-slate-800/50 p-4 rounded-lg">
													<p className="text-sm text-slate-400">
														Minimum Investment
													</p>
													<p className="text-sm font-medium">
														{
															opportunity.minimum_investment
														}
													</p>
												</div>
												<div className="bg-slate-800/50 p-4 rounded-lg">
													<p className="text-sm text-slate-400">
														Maximum Investment
													</p>
													<p className="text-sm font-medium">
														{
															opportunity.maximum_investment
														}
													</p>
												</div>
												<div className="bg-slate-800/50 p-4 rounded-lg">
													<p className="text-sm text-slate-400">
														Current Investors
													</p>
													<p className="text-sm font-medium">
														{
															opportunity.investor_count
														}
													</p>
												</div>
												<div className="bg-slate-800/50 p-4 rounded-lg">
													<p className="text-sm text-slate-400">
														Expected Return
													</p>
													<p className="text-sm font-medium">
														{
															opportunity.expected_return
														}
													</p>
												</div>
											</div>
										</div>

										<div>
											<h3 className="text-lg font-medium mb-2">
												Funding Progress
											</h3>
											<div className="space-y-2">
												<div className="flex justify-between">
													<span className="text-slate-400">
														{
															opportunity.current_funding
														}{" "}
														/{" "}
														{
															opportunity.target_funding
														}{" "}
														{
															opportunity.accepted_token
														}
													</span>
													<span>
														{(
															(Number(
																opportunity.current_funding
															) /
																Number(
																	opportunity.target_funding
																)) *
															100
														).toFixed(2)}
														%
													</span>
												</div>
												<Progress
													value={
														(Number(
															opportunity.current_funding
														) /
															Number(
																opportunity.target_funding
															)) *
														100
													}
													className="h-2 bg-slate-800"
												/>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value="business-plan"
							className="space-y-6"
						>
							<Card className="web3-card">
								<CardHeader>
									<CardTitle>Business Plan</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="prose prose-invert max-w-none">
										{opportunity.business_plan}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="documents" className="space-y-6">
							<Card className="web3-card">
								<CardHeader>
									<CardTitle>Documents</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{opportunity.documents.map((doc) => (
											<Card
												key={doc.id}
												className="bg-slate-800/50"
											>
												<CardHeader className="pb-2">
													<CardTitle className="text-lg">
														{doc.title}
													</CardTitle>
													<CardDescription>
														{doc.type
															.charAt(0)
															.toUpperCase() +
															doc.type.slice(
																1
															)}{" "}
														• {doc.size}
													</CardDescription>
												</CardHeader>
												<CardContent>
													<Button
														variant="outline"
														className="w-full"
														onClick={() =>
															window.open(
																doc.url,
																"_blank"
															)
														}
													>
														View Document
													</Button>
												</CardContent>
											</Card>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="analysis" className="space-y-6">
							{opportunity.wallet_analysis && (
								<Card className="web3-card">
									<CardHeader>
										<CardTitle>Wallet Analysis</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-6">
											<div>
												<h3 className="text-lg font-medium mb-2">
													Scoring Breakdown
												</h3>
												<div className="space-y-2">
													{opportunity.wallet_analysis.scoring_breakdown.map(
														(score, index) => (
															<div
																key={index}
																className="bg-slate-800/50 p-4 rounded-lg"
															>
																<div className="flex justify-between mb-1">
																	<span className="font-medium">
																		{
																			score.criteria
																		}
																	</span>
																	<span
																		className={
																			score.score_delta >=
																			0
																				? "text-green-500"
																				: "text-red-500"
																		}
																	>
																		{score.score_delta >=
																		0
																			? "+"
																			: ""}
																		{
																			score.score_delta
																		}
																	</span>
																</div>
																<p className="text-sm text-slate-400">
																	{
																		score.reason
																	}
																</p>
															</div>
														)
													)}
												</div>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<h3 className="text-lg font-medium mb-2">
														Wallet Metadata
													</h3>
													<div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
														<div className="flex justify-between">
															<span className="text-slate-400">
																First Seen
															</span>
															<span>
																{formatDate(
																	opportunity
																		.wallet_analysis
																		.wallet_metadata
																		.first_seen
																)}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-slate-400">
																Last Seen
															</span>
															<span>
																{formatDate(
																	opportunity
																		.wallet_analysis
																		.wallet_metadata
																		.last_seen
																)}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-slate-400">
																Total
																Transactions
															</span>
															<span>
																{
																	opportunity
																		.wallet_analysis
																		.wallet_metadata
																		.total_transactions
																}
															</span>
														</div>
													</div>
												</div>

												<div>
													<h3 className="text-lg font-medium mb-2">
														Behavioral Patterns
													</h3>
													<div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
														{opportunity
															.wallet_analysis
															.behavioral_patterns
															.transaction_anomalies
															.length > 0 && (
															<div>
																<p className="text-sm text-red-500 mb-1">
																	Transaction
																	Anomalies:
																</p>
																<ul className="list-disc list-inside space-y-1">
																	{opportunity.wallet_analysis.behavioral_patterns.transaction_anomalies.map(
																		(
																			anomaly,
																			index
																		) => (
																			<li
																				key={
																					index
																				}
																				className="text-sm text-slate-400"
																			>
																				{
																					anomaly
																				}
																			</li>
																		)
																	)}
																</ul>
															</div>
														)}
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							)}
						</TabsContent>
					</Tabs>
				</div>

				<div>
					<Card className="web3-card sticky top-24">
						<CardHeader>
							<CardTitle>
								Invest in {opportunity.company_name}
							</CardTitle>
							<CardDescription>
								Expected return: {opportunity.expected_return}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between">
									<p className="text-sm text-slate-400">
										Token
									</p>
									<p className="text-sm font-medium">
										{opportunity.accepted_token}
									</p>
								</div>
								<div className="flex justify-between">
									<p className="text-sm text-slate-400">
										Expected Return
									</p>
									<p className="text-sm font-medium text-primary">
										{opportunity.expected_return}
									</p>
								</div>
								<div className="flex justify-between">
									<p className="text-sm text-slate-400">
										Duration
									</p>
									<p className="text-sm font-medium">
										{opportunity.duration}
									</p>
								</div>
							</div>

							<Separator className="bg-slate-800" />

							<div className="space-y-2">
								<div className="flex justify-between">
									<p className="text-sm text-slate-400">
										Min Investment
									</p>
									<p className="text-sm font-medium">
										{opportunity.minimum_investment}
									</p>
								</div>
								<div className="flex justify-between">
									<p className="text-sm text-slate-400">
										Max Investment
									</p>
									<p className="text-sm font-medium">
										{opportunity.maximum_investment}
									</p>
								</div>
							</div>

							<Separator className="bg-slate-800" />

							<div className="space-y-2">
								<div className="flex justify-between">
									<p className="text-sm text-slate-400">
										Progress
									</p>
									<p className="text-sm font-medium">
										{(
											(Number(
												opportunity.current_funding
											) /
												Number(
													opportunity.target_funding
												)) *
											100
										).toFixed(2)}
										%
									</p>
								</div>
								<Progress
									value={
										(Number(opportunity.current_funding) /
											Number(
												opportunity.target_funding
											)) *
										100
									}
									className="h-2 bg-slate-800"
								/>
								<div className="flex justify-between text-xs text-slate-400">
									<span>
										{opportunity.current_funding} /{" "}
										{opportunity.target_funding}
									</span>
									<span>
										{opportunity.investor_count} investors
									</span>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={() => setIsLendDialogOpen(true)}
								className="w-full web3-button"
								disabled={opportunity.status !== "active"}
							>
								Invest Now
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>

			{/* Investment Dialog */}
			<Dialog open={isLendDialogOpen} onOpenChange={setIsLendDialogOpen}>
				<DialogContent className="web3-card sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="gradient-text">
							Invest in {opportunity.company_name}
						</DialogTitle>
						<DialogDescription>
							Enter the amount you want to invest.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						<div className="space-y-2">
							<div className="flex justify-between">
								<Label
									htmlFor="amount"
									className="text-sm font-medium"
								>
									Amount
								</Label>
								<span className="text-sm text-slate-400">
									Min: {opportunity.minimum_investment} | Max:{" "}
									{opportunity.maximum_investment}
								</span>
							</div>
							<div className="flex gap-2">
								<Input
									id="amount"
									placeholder={`0.00 ${opportunity.accepted_token}`}
									value={lendAmount}
									onChange={(e) =>
										setLendAmount(e.target.value)
									}
									className="bg-slate-800 border-slate-700"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium">
								Investment Overview
							</Label>
							<div className="bg-slate-800/70 rounded-lg p-4 space-y-2 backdrop-blur-sm">
								<div className="flex justify-between">
									<span className="text-slate-400">
										Amount
									</span>
									<span>
										{lendAmount || "0.00"}{" "}
										{opportunity.accepted_token}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">
										Expected Return
									</span>
									<span className="text-primary">
										{calculateReturns()}{" "}
										{opportunity.accepted_token}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">
										Duration
									</span>
									<span>{opportunity.duration}</span>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsLendDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleLendSubmit}
							className="web3-button"
						>
							Continue
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Confirmation Dialog */}
			<Dialog
				open={isConfirmationDialogOpen}
				onOpenChange={setIsConfirmationDialogOpen}
			>
				<DialogContent className="web3-card sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="gradient-text">
							Confirm Investment
						</DialogTitle>
						<DialogDescription>
							Please review and confirm your investment.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						<div className="bg-slate-800/70 rounded-lg p-4 space-y-3 backdrop-blur-sm">
							<div className="flex justify-between">
								<span className="text-slate-400">
									Investment Amount
								</span>
								<span>
									{lendAmount} {opportunity.accepted_token}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-400">
									Expected Return
								</span>
								<span className="text-primary">
									{calculateReturns()}{" "}
									{opportunity.accepted_token}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-400">Duration</span>
								<span>{opportunity.duration}</span>
							</div>
						</div>

						<div className="bg-slate-800/50 p-4 rounded-lg">
							<p className="text-sm text-slate-400">
								By confirming this investment, you agree to the
								terms and conditions of this business proposal.
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsConfirmationDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmLend}
							className="web3-button"
						>
							Confirm Investment
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
