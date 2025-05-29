"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	Search,
	ArrowRight,
	TrendingUp,
	Calendar,
	Wallet,
	Shield,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	getActiveBusinessProposals,
	fetchBusinessProposals,
} from "@/data/business-proposals";
import type { BusinessProposal } from "@/types/business-proposal";

export default function BusinessProposals() {
	const [searchTerm, setSearchTerm] = useState("");
	const [tokenFilter, setTokenFilter] = useState<string | null>(null);
	const [proposals, setProposals] = useState<BusinessProposal[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadProposals = async () => {
			try {
				const data = await fetchBusinessProposals();
				setProposals(data);
			} catch (error) {
				console.error("Error loading proposals:", error);
			} finally {
				setLoading(false);
			}
		};

		loadProposals();
	}, []);

	// Filter proposals based on search term and token filter
	const filteredProposals = proposals.filter(
		(proposal) =>
			(tokenFilter === null || proposal.accepted_token === tokenFilter) &&
			(proposal.company_name
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
				proposal.short_description
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				proposal.accepted_token
					.toLowerCase()
					.includes(searchTerm.toLowerCase()))
	);

	// Get unique tokens for filter
	const uniqueTokens = Array.from(
		new Set(proposals.map((proposal) => proposal.accepted_token))
	);

	if (loading) {
		return <div>Loading proposals...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold gradient-text">
						Business Proposals
					</h2>
					<p className="text-slate-400">
						Companies seeking funding for their business ventures
					</p>
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
							variant={
								tokenFilter === null ? "default" : "outline"
							}
							size="sm"
							onClick={() => setTokenFilter(null)}
							className={
								tokenFilter === null ? "web3-button" : ""
							}
						>
							All
						</Button>
						{uniqueTokens.map((token) => (
							<Button
								key={token}
								variant={
									tokenFilter === token
										? "default"
										: "outline"
								}
								size="sm"
								onClick={() => setTokenFilter(token)}
								className={
									tokenFilter === token ? "web3-button" : ""
								}
							>
								{token}
							</Button>
						))}
					</div>
				</div>
			</div>

			{filteredProposals.length > 0 ? (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredProposals.map((proposal) => (
						<Card
							key={proposal.id}
							className="web3-card overflow-hidden group hover:scale-[1.02] transition-all duration-300"
						>
							<CardHeader className="pb-2 relative">
								<div className="absolute top-3 right-3">
									<Badge
										variant="outline"
										className={`
                      ${
							proposal.wallet_analysis?.risk_level === "low"
								? "bg-green-500/20 text-green-500 border-green-500/50"
								: proposal.wallet_analysis?.risk_level ===
								  "medium"
								? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
								: "bg-red-500/20 text-red-500 border-red-500/50"
						}
                    `}
									>
										{(
											proposal.wallet_analysis
												?.risk_level || "unknown"
										)
											.charAt(0)
											.toUpperCase() +
											(
												proposal.wallet_analysis
													?.risk_level || "unknown"
											).slice(1)}{" "}
										Risk
									</Badge>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
										{proposal.logo ? (
											<Image
												src={
													proposal.logo ||
													"/placeholder.svg"
												}
												alt={proposal.company_name}
												width={48}
												height={48}
											/>
										) : (
											<div className="text-2xl font-bold">
												{proposal.company_name.charAt(
													0
												)}
											</div>
										)}
									</div>
									<div>
										<CardTitle className="text-lg gradient-text">
											{proposal.company_name}
										</CardTitle>
										<CardDescription className="flex items-center gap-1">
											<Wallet className="h-3 w-3" />{" "}
											Accepts {proposal.accepted_token}{" "}
											Only
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
											<Shield className="h-3 w-3" /> Pool
										</div>
										<p className="text-sm font-medium">
											{proposal.total_pooled}
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
										<span>
											{proposal.investor_count} investors
										</span>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Link
									href={`/lend/${proposal.id}`}
									className="w-full"
								>
									<Button className="w-full web3-button group">
										View Proposal{" "}
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
						No Matching Proposals
					</CardTitle>
					<CardDescription className="text-slate-400 mb-6">
						{searchTerm || tokenFilter
							? "No proposals match your current search criteria. Try adjusting your filters."
							: "There are no active business proposals at the moment. Check back later."}
					</CardDescription>
					{(searchTerm || tokenFilter) && (
						<Button
							onClick={() => {
								setSearchTerm("");
								setTokenFilter(null);
							}}
							className="web3-button"
						>
							Clear Filters
						</Button>
					)}
				</Card>
			)}
		</div>
	);
}
