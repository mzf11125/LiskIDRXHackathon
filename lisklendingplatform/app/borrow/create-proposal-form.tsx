"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Upload, X, Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { useProfile } from "@/hooks/use-profile"
import { useProposals } from "@/hooks/use-proposals"
import { useWallet } from "@/components/wallet-provider"

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
    message: "Target funding is required.",
  }),
  minimum_investment: z.string().min(1, {
    message: "Minimum investment is required.",
  }),
  maximum_investment: z.string().min(1, {
    message: "Maximum investment is required.",
  }),
  deadline: z.date({
    required_error: "Deadline is required.",
  }),
  website: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  twitter: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  telegram: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface CreateProposalFormProps {
  onSuccess: () => void
}

export default function CreateProposalForm({ onSuccess }: CreateProposalFormProps) {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<{ name: string; type: string; size: string; url?: string }[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)

  const { profile, fetchProfile, updateProfile, isLoading: isProfileLoading } = useProfile()
  const { createProposal, isLoading: isProposalLoading } = useProposals()
  const { isConnected } = useWallet()

  // Check if user profile is complete
  useEffect(() => {
    if (isConnected) {
      const checkProfile = async () => {
        setIsCheckingProfile(true)
        await fetchProfile()
        setIsCheckingProfile(false)
      }

      checkProfile()
    }
  }, [isConnected, fetchProfile])

  // Check if profile is complete when profile data changes
  useEffect(() => {
    if (profile) {
      const requiredFields = [
        "display_name",
        "email",
        "company_name",
        "company_position",
        "company_website",
        "company_description",
      ]

      const isComplete = requiredFields.every((field) => !!profile[field])
      setIsProfileComplete(isComplete)

      if (!isComplete) {
        toast({
          variant: "destructive",
          title: "Profile Incomplete",
          description: "Please complete your profile before creating a proposal.",
        })
      }
    }
  }, [profile, toast])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: profile?.company_name || "",
      short_description: "",
      full_description: "",
      business_plan: "",
      expected_return: "",
      duration: "",
      target_funding: "",
      minimum_investment: "",
      maximum_investment: "",
      website: profile?.company_website || "",
      twitter: "",
      linkedin: "",
      telegram: "",
    },
  })

  // Update form values when profile is loaded
  useEffect(() => {
    if (profile) {
      form.setValue("company_name", profile.company_name || "")
      form.setValue("website", profile.company_website || "")
    }
  }, [profile, form])

  async function onSubmit(values: FormValues) {
    if (!isProfileComplete) {
      toast({
        variant: "destructive",
        title: "Profile Incomplete",
        description: "Please complete your profile before creating a proposal.",
      })
      return
    }

    // Format the proposal data according to the API requirements
    const proposalData = {
      ...values,
      total_pooled: "0", // Initial value
      social_media: {
        twitter: values.twitter || undefined,
        linkedin: values.linkedin || undefined,
        telegram: values.telegram || undefined,
      },
      tags,
      documents: documents.map((doc) => ({
        title: doc.name,
        type: doc.type,
        url: doc.url || "https://example.com/placeholder.pdf",
        size: doc.size,
      })),
    }

    // Remove the individual social media fields
    delete proposalData.twitter
    delete proposalData.linkedin
    delete proposalData.telegram

    const result = await createProposal(proposalData)

    if (result) {
      onSuccess()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newDocuments = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type.split("/")[1] || "document",
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        // In a real app, you would upload the file to a server and get a URL
        url: URL.createObjectURL(file),
      }))

      setDocuments([...documents, ...newDocuments])
    }
  }

  const removeDocument = (index: number) => {
    const newDocuments = [...documents]
    newDocuments.splice(index, 1)
    setDocuments(newDocuments)
  }

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  if (isCheckingProfile) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isProfileComplete) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-500 mb-2">Profile Incomplete</h3>
          <p className="text-slate-300 mb-4">You need to complete your profile before creating a business proposal.</p>
          <Button onClick={() => (window.location.href = "/profile")} className="web3-button">
            Complete Profile
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ position: "relative" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your company name" {...field} className="bg-slate-800 border-slate-700" />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="LSK">Lisk (LSK)</SelectItem>
                      <SelectItem value="IDRX">IDRX Token</SelectItem>
                      <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                      <SelectItem value="DAI">Dai (DAI)</SelectItem>
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
                  <FormDescription>This will appear in the proposal cards. Max 150 characters.</FormDescription>
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
                      <Input placeholder="e.g., 15-20% APY" {...field} className="bg-slate-800 border-slate-700" />
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
                      <Input placeholder="e.g., 12 months" {...field} className="bg-slate-800 border-slate-700" />
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
                      <Input placeholder="e.g., 100 BTC" {...field} className="bg-slate-800 border-slate-700" />
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
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date > new Date(new Date().setFullYear(new Date().getFullYear() + 2))
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
                    <FormLabel>Minimum Investment</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 0.1 BTC" {...field} className="bg-slate-800 border-slate-700" />
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
                    <FormLabel>Maximum Investment</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10 BTC" {...field} className="bg-slate-800 border-slate-700" />
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
                <Label className="text-sm font-medium">Documents</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 border-slate-700">
                      <p className="max-w-xs">Upload business plans, financial projections, legal documents, etc.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="border border-dashed border-slate-700 rounded-lg p-4 bg-slate-800/50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <p className="text-sm text-slate-400">Drag and drop files or click to upload</p>
                  <Input type="file" className="hidden" id="file-upload" multiple onChange={handleFileUpload} />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" className="mt-2 bg-slate-800 border-slate-700">
                      Select Files
                    </Button>
                  </label>
                </div>
              </div>
              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium">{doc.name}</div>
                        <div className="text-xs text-slate-400">{doc.size}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
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
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add tags (e.g., AI, Finance)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag} className="bg-slate-800 border-slate-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md text-xs">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTag(tag)}
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
          <h3 className="text-sm font-medium mb-3">Social Media & Website (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourcompany.com" {...field} className="bg-slate-800 border-slate-700" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://twitter.com/yourcompany"
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
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://linkedin.com/company/yourcompany"
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
              name="telegram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://t.me/yourcompany"
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" className="web3-button" disabled={isProposalLoading}>
            {isProposalLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Submitting...
              </>
            ) : (
              "Submit Proposal"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
