"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, AlertCircle, X, Check } from "lucide-react";
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
import {
	getPoolById,
	getAvailableAssetsForBorrower,
	getBorrowerByAddress,
} from "@/data/mock-data";
import { Pool } from "@/types/lending";

interface PoolDetailClientProps {
	params: { id: string };
	initialPool: Pool | null;
}

export default function PoolDetailClient({
	params,
	initialPool,
}: PoolDetailClientProps) {
	const router = useRouter();
	const { isConnected, connect, address } = useWallet();
	const [activeTab, setActiveTab] = useState("overview");

	// Get borrower data
	const borrower = address ? getBorrowerByAddress(address) : undefined;

	// Get available assets for the borrower
	const availableAssets = address
		? getAvailableAssetsForBorrower(address, params.id)
		: [];

	// Check if borrower is eligible for this pool
	const isEligible = borrower?.eligiblePools.includes(params.id) || false;

	if (!initialPool) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h1 className="text-3xl font-bold mb-6 gradient-text">
					Pool Not Found
				</h1>
				<p className="text-slate-400 mb-8 max-w-md mx-auto">
					The lending pool you're looking for doesn't exist or has
					been removed.
				</p>
				<Button
					onClick={() => router.push("/pools")}
					className="web3-button"
				>
					Back to Pools
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
					lending pool.
				</p>
				<Button onClick={connect} className="web3-button">
					Connect Wallet
				</Button>
			</div>
		);
	}

	const pool = initialPool;

	return (
		<div className="container mx-auto px-4 py-12">
			<div className="mb-8">
				<Button
					variant="ghost"
					className="mb-4 hover:bg-slate-800/50"
					onClick={() => router.push("/pools")}
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Pools
				</Button>

				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
							{pool.logoUrl ? (
								<Image
									src={pool.logoUrl || "/placeholder.svg"}
									alt={pool.name}
									width={64}
									height={64}
								/>
							) : (
								<div className="text-3xl font-bold">
									{pool.name.charAt(0)}
								</div>
							)}
						</div>
						<div>
							<h1 className="text-3xl font-bold gradient-text">
								{pool.name}
							</h1>
							<p className="text-slate-400">{pool.company}</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						{pool.riskLevel === "low" && (
							<Badge
								variant="outline"
								className="bg-green-500/20 text-green-500 border-green-500/50 text-sm px-3 py-1"
							>
								Low Risk
							</Badge>
						)}
						{pool.riskLevel === "medium" && (
							<Badge
								variant="outline"
								className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 text-sm px-3 py-1"
							>
								Medium Risk
							</Badge>
						)}
						{pool.riskLevel === "high" && (
							<Badge
								variant="outline"
								className="bg-red-500/20 text-red-500 border-red-500/50 text-sm px-3 py-1"
							>
								High Risk
							</Badge>
						)}

						{isEligible ? (
							<Badge
								variant="outline"
								className="bg-green-500/20 text-green-500 border-green-500/50 text-sm px-3 py-1"
							>
								Eligible
							</Badge>
						) : (
							<Badge
								variant="outline"
								className="bg-red-500/20 text-red-500 border-red-500/50 text-sm px-3 py-1"
							>
								Not Eligible
							</Badge>
						)}
					</div>
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-6 mb-8">
				<Card className="web3-card">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">
							Total Value Locked
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-end gap-2">
							<p className="text-3xl font-bold gradient-text">
								{pool.tvl}
							</p>
							<p className="text-sm text-slate-400 mb-1">USD</p>
						</div>
					</CardContent>
				</Card>

				<Card className="web3-card">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">
							Total Borrowed
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-end gap-2">
							<p className="text-3xl font-bold gradient-text">
								{pool.totalBorrowed}
							</p>
							<p className="text-sm text-slate-400 mb-1">USD</p>
						</div>
					</CardContent>
				</Card>

				<Card className="web3-card">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">
							Utilization Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-end gap-2 mb-2">
							<p className="text-3xl font-bold gradient-text">
								{pool.utilizationRate}
							</p>
						</div>
						<Progress
							value={Number.parseFloat(pool.utilizationRate)}
							className="h-2 bg-slate-800"
						/>
					</CardContent>
				</Card>
			</div>

			{!isEligible && (
				<Card className="web3-card mb-8 border-red-500/30">
					<CardHeader className="bg-red-500/10">
						<CardTitle className="text-red-400 flex items-center gap-2">
							<AlertCircle className="h-5 w-5" /> Not Eligible for
							This Pool
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<p className="text-slate-300 mb-4">
							You are not eligible to borrow from this pool due to
							the following requirements:
						</p>
						<div className="space-y-2">
							{pool.borrowerRequirements?.kycRequired &&
								!borrower?.kycVerified && (
									<div className="flex items-start gap-2">
										<X className="h-5 w-5 text-red-500 mt-0.5" />
										<div>
											<p className="font-medium">
												KYC Verification Required
											</p>
											<p className="text-sm text-slate-400">
												This pool requires KYC
												verification. Please complete
												the verification process.
											</p>
										</div>
									</div>
								)}
							{pool.borrowerRequirements?.whitelistRequired &&
								!borrower?.whitelisted && (
									<div className="flex items-start gap-2">
										<X className="h-5 w-5 text-red-500 mt-0.5" />
										<div>
											<p className="font-medium">
												Whitelist Required
											</p>
											<p className="text-sm text-slate-400">
												This pool is only available to
												whitelisted addresses.
											</p>
										</div>
									</div>
								)}
							{pool.borrowerRequirements?.minCollateral && (
								<div className="flex items-start gap-2">
									<X className="h-5 w-5 text-red-500 mt-0.5" />
									<div>
										<p className="font-medium">
											Minimum Collateral:{" "}
											{
												pool.borrowerRequirements
													.minCollateral
											}
										</p>
										<p className="text-sm text-slate-400">
											Your current collateral:{" "}
											{borrower?.collateralValue ||
												"$0.00"}
										</p>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			<Tabs
				defaultValue="overview"
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-8"
			>
				<TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 bg-slate-800/50">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="assets">Assets</TabsTrigger>
					<TabsTrigger value="proposals">Proposals</TabsTrigger>
					<TabsTrigger value="requirements">Requirements</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<Card className="web3-card">
						<CardHeader>
							<CardTitle>Pool Overview</CardTitle>
							<CardDescription>
								{pool.description}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								<div>
									<h3 className="text-lg font-medium mb-2">
										About {pool.company}
									</h3>
									<p className="text-slate-300">
										{pool.company} is a leading provider of
										decentralized financial services on the
										Lisk blockchain. This lending pool was
										created on{" "}
										{new Date(
											pool.createdAt
										).toLocaleDateString()}{" "}
										to provide liquidity for various assets
										with competitive interest rates.
									</p>
								</div>

								<div>
									<h3 className="text-lg font-medium mb-2">
										Pool Statistics
									</h3>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="bg-slate-800/50 p-4 rounded-lg">
											<p className="text-sm text-slate-400">
												Total Value Locked
											</p>
											<p className="text-xl font-bold gradient-text">
												{pool.tvl}
											</p>
										</div>
										<div className="bg-slate-800/50 p-4 rounded-lg">
											<p className="text-sm text-slate-400">
												Total Borrowed
											</p>
											<p className="text-xl font-bold gradient-text">
												{pool.totalBorrowed}
											</p>
										</div>
										<div className="bg-slate-800/50 p-4 rounded-lg">
											<p className="text-sm text-slate-400">
												Utilization Rate
											</p>
											<p className="text-xl font-bold gradient-text">
												{pool.utilizationRate}
											</p>
										</div>
										<div className="bg-slate-800/50 p-4 rounded-lg">
											<p className="text-sm text-slate-400">
												Risk Level
											</p>
											<p className="text-xl font-bold">
												{pool.riskLevel === "low" && (
													<span className="text-green-500">
														Low
													</span>
												)}
												{pool.riskLevel ===
													"medium" && (
													<span className="text-yellow-500">
														Medium
													</span>
												)}
												{pool.riskLevel === "high" && (
													<span className="text-red-500">
														High
													</span>
												)}
											</p>
										</div>
									</div>
								</div>

								<div>
									<h3 className="text-lg font-medium mb-2">
										Supported Assets
									</h3>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										{pool.assets.map((asset) => (
											<div
												key={asset.symbol}
												className="bg-slate-800/50 p-4 rounded-lg"
											>
												<div className="flex items-center gap-2 mb-2">
													<div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
														{asset.symbol.charAt(0)}
													</div>
													<div>
														<p className="font-medium">
															{asset.symbol}
														</p>
														<p className="text-xs text-slate-400">
															{asset.name}
														</p>
													</div>
												</div>
												<div className="text-sm text-slate-300">
													<p>
														Interest Rate:{" "}
														{asset.apr}%
													</p>
													<p>
														Available:{" "}
														{asset.available}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="assets" className="space-y-6">
					<Card className="web3-card">
						<CardHeader>
							<CardTitle>My Assets</CardTitle>
							<CardDescription>
								Manage your assets for this pool
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{availableAssets.length === 0 && (
									<p className="text-slate-400 text-center py-8">
										No assets available for borrowing in
										this pool.
									</p>
								)}

								{availableAssets.length > 0 && (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{availableAssets.map((asset) => (
											<div
												key={asset.symbol}
												className="bg-slate-800/50 p-4 rounded-lg"
											>
												<div className="flex items-center justify-between mb-2">
													<div className="flex items-center gap-2">
														<div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
															{asset.symbol.charAt(
																0
															)}
														</div>
														<div>
															<p className="font-medium">
																{asset.symbol}
															</p>
															<p className="text-xs text-slate-400">
																{asset.name}
															</p>
														</div>
													</div>
													<div className="text-right">
														<p className="text-sm text-slate-400">
															Available:{" "}
															{
																asset.availableAmount
															}
														</p>
														<p className="text-sm text-slate-400">
															Borrowed:{" "}
															{
																asset.borrowedAmount
															}
														</p>
													</div>
												</div>
												<div className="flex flex-col gap-1">
													<p className="text-sm text-slate-400">
														Interest Rate:{" "}
														{asset.apr}%
													</p>
													<p className="text-sm text-slate-400">
														Collateral Factor:{" "}
														{asset.collateralFactor}
													</p>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="proposals" className="space-y-6">
					<Card className="web3-card">
						<CardHeader>
							<CardTitle>Active Proposals</CardTitle>
							<CardDescription>
								Review and vote on active governance proposals
								related to this pool.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{pool.proposals && pool.proposals.length > 0 ? (
								<div className="space-y-4">
									{pool.proposals.map((proposal) => (
										<div
											key={proposal.id}
											className="bg-slate-800/50 p-4 rounded-lg"
										>
											<h4 className="font-medium mb-1">
												{proposal.title}
											</h4>
											<p className="text-sm text-slate-400 mb-2">
												{proposal.description}
											</p>
											<div className="flex justify-between items-center text-xs text-slate-500">
												<span>
													Ends:{" "}
													{new Date(
														proposal.endDate
													).toLocaleDateString()}
												</span>
												<span>
													Status: {proposal.status}
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-slate-400">
									No active proposals at the moment.
								</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="requirements" className="space-y-6">
					<Card className="web3-card">
						<CardHeader>
							<CardTitle>Borrower Requirements</CardTitle>
							<CardDescription>
								Understand the requirements to borrow from this
								pool.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
								<div className="flex items-center gap-3">
									{pool.borrowerRequirements?.kycRequired ? (
										<Check className="h-5 w-5 text-green-500" />
									) : (
										<X className="h-5 w-5 text-red-500" />
									)}
									<span>KYC Verification</span>
								</div>
								<Badge
									variant={
										pool.borrowerRequirements?.kycRequired
											? "default"
											: "destructive"
									}
									className={
										pool.borrowerRequirements?.kycRequired
											? "bg-green-500/20 text-green-500"
											: "bg-red-500/20 text-red-500"
									}
								>
									{pool.borrowerRequirements?.kycRequired
										? "Required"
										: "Not Required"}
								</Badge>
							</div>

							<div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
								<div className="flex items-center gap-3">
									{pool.borrowerRequirements
										?.whitelistRequired ? (
										<Check className="h-5 w-5 text-green-500" />
									) : (
										<X className="h-5 w-5 text-red-500" />
									)}
									<span>Whitelist</span>
								</div>
								<Badge
									variant={
										pool.borrowerRequirements
											?.whitelistRequired
											? "default"
											: "destructive"
									}
									className={
										pool.borrowerRequirements
											?.whitelistRequired
											? "bg-green-500/20 text-green-500"
											: "bg-red-500/20 text-red-500"
									}
								>
									{pool.borrowerRequirements
										?.whitelistRequired
										? "Required"
										: "Not Required"}
								</Badge>
							</div>

							{pool.borrowerRequirements?.minCollateral && (
								<div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
									<div className="flex items-center gap-3">
										<Check className="h-5 w-5 text-green-500" />
										<span>Minimum Collateral</span>
									</div>
									<Badge
										variant="default"
										className="bg-blue-500/20 text-blue-500"
									>
										{
											pool.borrowerRequirements
												.minCollateral
										}
									</Badge>
								</div>
							)}
							{availableAssets.length > 0 && isEligible && (
								<div className="mt-8">
									<h3 className="text-xl font-semibold mb-4 gradient-text">
										Available Assets for You
									</h3>
									<div className="grid md:grid-cols-2 gap-4">
										{availableAssets.map((asset) => (
											<Card
												key={asset.symbol}
												className="web3-card"
											>
												<CardHeader className="flex flex-row items-center justify-between pb-2">
													<CardTitle className="text-lg">
														{asset.name} (
														{asset.symbol})
													</CardTitle>
													{/* Placeholder for asset logo if available */}
												</CardHeader>
												<CardContent>
													<p className="text-sm text-slate-400">
														Interest Rate:{" "}
														{asset.apr}%
													</p>
													<p className="text-sm text-slate-400">
														Available to Borrow:{" "}
														{asset.available}
													</p>
													<Button
														className="w-full mt-4 web3-button"
														onClick={() =>
															router.push(
																`/borrow/${params.id}?asset=${asset.symbol}`
															)
														}
													>
														Borrow {asset.symbol}
													</Button>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
