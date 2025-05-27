"use client";

import type React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Upload, X, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import type {
	BusinessProposal,
	Document,
	SocialMediaLinks,
} from "@/types/business-proposal";

const formSchema = z.object({
	company_name: z.string().min(2, {
		message: "Company name must be at least 2 characters.",
	}),
	accepted_token: z.string({
		required_error: "Please select a token.",
	}),
	short_description: z
		.string()
		.min(10, {
			message: "Short description must be at least 10 characters.",
		})
		.max(150, {
			message: "Short description must not exceed 150 characters.",
		}),
	full_description: z.string().min(50, {
		message: "Full description must be at least 50 characters.",
	}),
	business_plan: z.string().min(50, {
		message: "Business plan must be at least 50 characters.",
	}),
	expected_return: z.string().min(1, {
		message: "Expected return is required.",
	}),
	duration: z.string().min(1, {
		message: "Duration is required.",
	}),
	target_funding: z.string().min(1, {
		message: "Target funding amount is required.",
	}),
	minimum_investment: z.string().min(1, {
		message: "Minimum investment amount is required.",
	}),
	maximum_investment: z.string().min(1, {
		message: "Maximum investment amount is required.",
	}),
	deadline: z.date({
		required_error: "Please select a deadline.",
	}),
	proposer_wallet: z.string().min(1, {
		message: "Proposer wallet address is required.",
	}),
	website: z.string().url().optional(),
	social_media: z
		.object({
			twitter: z.string().url().optional(),
			linkedin: z.string().url().optional(),
			telegram: z.string().url().optional(),
			facebook: z.string().url().optional(),
			discord: z.string().url().optional(),
			github: z.string().url().optional(),
		})
		.optional(),
	logo: z.string().optional(),
	tags: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateProposalFormProps {
	onSuccess: () => void;
}

export default function CreateProposalForm({
	onSuccess,
}: CreateProposalFormProps) {
	const { toast } = useToast();
	const [documents, setDocuments] = useState<
		{ name: string; type: string; size: string }[]
	>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");

	const form = useForm<FormValues>({
		mode: "onBlur",
		resolver: zodResolver(formSchema),
		defaultValues: {
      company_name: "",
      accepted_token: "",
      short_description: "",
      full_description: "",
      business_plan: "",
      expected_return: "",
      duration: "",
      target_funding: "",
      minimum_investment: "",
      maximum_investment: "",
      proposer_wallet: "",
      website: "",
      social_media: {
        twitter: "",
        linkedin: "",
        telegram: "",
        facebook: "",
        discord: "",
        github: "",
      },
      tags: [],
    } as unknown as FormValues,
	});

	async function onSubmit(values: FormValues) {
		const proposal: Partial<BusinessProposal> = {
			...values,
			status: "active",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			investor_count: 0,
			current_funding: "0",
			proposed_at: new Date().toISOString(),
			documents: documents.map((doc, index) => ({
				id: `doc-${index}`,
				proposal_id: "", // Will be set by backend
				title: doc.name,
				type: doc.type as
					| "pdf"
					| "image"
					| "spreadsheet"
					| "presentation"
					| "contract",
				url: "", // Will be set by backend after upload
				size: doc.size,
				uploaded_at: new Date().toISOString(),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})),
		};

		console.log("Submitting proposal:", proposal);
		toast({
			title: "Proposal Created",
			description:
				"Your business proposal has been submitted successfully.",
		});

		onSuccess();
	}

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const newDocuments = Array.from(files).map((file) => ({
				name: file.name,
				type: file.type.split("/")[1] || "document",
				size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
			}));

			setDocuments([...documents, ...newDocuments]);
		}
	};

	const removeDocument = (index: number) => {
		const newDocuments = [...documents];
		newDocuments.splice(index, 1);
		setDocuments(newDocuments);
	};

	const addTag = () => {
		if (tagInput && !tags.includes(tagInput)) {
			setTags([...tags, tagInput]);
			setTagInput("");
		}
	};

	const removeTag = (tag: string) => {
		setTags(tags.filter((t) => t !== tag));
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8"
				style={{ position: "relative" }}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-6">
						<FormField
							control={form.control}
							name="company_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Company Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter your company name"
											{...field}
											className="bg-slate-800 border-slate-700"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="accepted_token"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Accepted Token</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="bg-slate-800 border-slate-700">
												<SelectValue placeholder="Select token" />
											</SelectTrigger>
										</FormControl>
										<SelectContent className="bg-slate-800 border-slate-700">
											<SelectItem value="BTC">
												Bitcoin (BTC)
											</SelectItem>
											<SelectItem value="ETH">
												Ethereum (ETH)
											</SelectItem>
											<SelectItem value="LSK">
												Lisk (LSK)
											</SelectItem>
											<SelectItem value="IDRX">
												IDRX Token
											</SelectItem>
											<SelectItem value="USDC">
												USD Coin (USDC)
											</SelectItem>
											<SelectItem value="DAI">
												Dai (DAI)
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="short_description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Short Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Brief description of your business proposal"
											{...field}
											className="bg-slate-800 border-slate-700 resize-none"
										/>
									</FormControl>
									<FormDescription>
										This will appear in the proposal cards.
										Max 150 characters.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="expected_return"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Expected Return</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., 15-20% APY"
												{...field}
												className="bg-slate-800 border-slate-700"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="duration"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Duration</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., 12 months"
												{...field}
												className="bg-slate-800 border-slate-700"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="target_funding"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Target Funding</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., 100 BTC"
												{...field}
												className="bg-slate-800 border-slate-700"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="deadline"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Deadline</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"pl-3 text-left font-normal bg-slate-800 border-slate-700",
															!field.value &&
																"text-muted-foreground"
														)}
													>
														{field.value ? (
															format(
																field.value,
																"PPP"
															)
														) : (
															<span>
																Pick a date
															</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0 bg-slate-800 border-slate-700"
												align="start"
											>
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date < new Date() ||
														date >
															new Date(
																new Date().setFullYear(
																	new Date().getFullYear() +
																		2
																)
															)
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="minimum_investment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Minimum Investment
										</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., 0.1 BTC"
												{...field}
												className="bg-slate-800 border-slate-700"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="maximum_investment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Maximum Investment
										</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., 10 BTC"
												{...field}
												className="bg-slate-800 border-slate-700"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="space-y-6">
						<FormField
							control={form.control}
							name="full_description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Detailed description of your business"
											{...field}
											className="bg-slate-800 border-slate-700 min-h-[120px]"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="business_plan"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Business Plan</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Outline your business model, revenue streams, and growth strategy"
											{...field}
											className="bg-slate-800 border-slate-700 min-h-[120px]"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div>
							<div className="flex justify-between items-center mb-2">
								<Label className="text-sm font-medium">
									Documents
								</Label>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className="h-4 w-4 text-slate-400" />
										</TooltipTrigger>
										<TooltipContent className="bg-slate-800 border-slate-700">
											<p className="max-w-xs">
												Upload business plans, financial
												projections, legal documents,
												etc.
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<div className="border border-dashed border-slate-700 rounded-lg p-4 bg-slate-800/50">
								<div className="flex flex-col items-center justify-center gap-2">
									<Upload className="h-8 w-8 text-slate-400" />
									<p className="text-sm text-slate-400">
										Drag and drop files or click to upload
									</p>
									<Input
										type="file"
										className="hidden"
										id="file-upload"
										multiple
										onChange={handleFileUpload}
									/>
									<label htmlFor="file-upload">
										<Button
											type="button"
											variant="outline"
											className="mt-2 bg-slate-800 border-slate-700"
										>
											Select Files
										</Button>
									</label>
								</div>
							</div>
							{documents.length > 0 && (
								<div className="mt-4 space-y-2">
									{documents.map((doc, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-2 bg-slate-800 rounded-md"
										>
											<div className="flex items-center gap-2">
												<div className="text-xs font-medium">
													{doc.name}
												</div>
												<div className="text-xs text-slate-400">
													{doc.size}
												</div>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() =>
													removeDocument(index)
												}
												className="h-6 w-6 p-0"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</div>

						<div>
							<div className="flex flex-col space-y-2">
								<Label
									htmlFor="tags"
									className="text-sm font-medium"
								>
									Tags
								</Label>
								<div className="flex gap-2">
									<Input
										id="tags"
										placeholder="Add tags (e.g., AI, Finance)"
										value={tagInput}
										onChange={(e) =>
											setTagInput(e.target.value)
										}
										className="bg-slate-800 border-slate-700"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												addTag();
											}
										}}
									/>
									<Button
										type="button"
										variant="outline"
										onClick={addTag}
										className="bg-slate-800 border-slate-700"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								{tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-3">
										{tags.map((tag) => (
											<div
												key={tag}
												className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md text-xs"
											>
												{tag}
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														removeTag(tag)
													}
													className="h-4 w-4 p-0"
												>
													<X className="h-3 w-3" />
												</Button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<Separator className="bg-slate-800" />

				<div>
					<h3 className="text-sm font-medium mb-3">
						Social Media & Website (Optional)
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<FormField
							control={form.control}
							name="proposer_wallet"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Proposer Wallet Address
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter your wallet address"
											{...field}
											className="bg-slate-800 border-slate-700"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="website"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Website</FormLabel>
									<FormControl>
										<Input
											placeholder="https://your-company.com"
											{...field}
											className="bg-slate-800 border-slate-700"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-y-4">
							<FormLabel>Social Media Links</FormLabel>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="social_media.twitter"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Twitter URL"
													{...field}
													className="bg-slate-800 border-slate-700"
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="social_media.linkedin"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="LinkedIn URL"
													{...field}
													className="bg-slate-800 border-slate-700"
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="social_media.telegram"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Telegram URL"
													{...field}
													className="bg-slate-800 border-slate-700"
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="social_media.facebook"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Facebook URL"
													{...field}
													className="bg-slate-800 border-slate-700"
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="social_media.discord"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Discord URL"
													{...field}
													className="bg-slate-800 border-slate-700"
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="social_media.github"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="GitHub URL"
													{...field}
													className="bg-slate-800 border-slate-700"
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-3">
					<Button type="button" variant="outline" onClick={onSuccess}>
						Cancel
					</Button>
					<Button type="submit" className="web3-button">
						Submit Proposal
					</Button>
				</div>
			</form>
		</Form>
	);
}
