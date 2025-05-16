"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProfile } from "@/hooks/use-profile"
import { useWallet } from "@/components/wallet-provider"
import { useRouter } from "next/navigation"

const profileSchema = z.object({
  display_name: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  company_name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  company_position: z.string().min(2, {
    message: "Position must be at least 2 characters.",
  }),
  company_website: z.string().url({
    message: "Please enter a valid URL.",
  }),
  company_description: z.string().min(10, {
    message: "Company description must be at least 10 characters.",
  }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { profile, fetchProfile, updateProfile, isLoading } = useProfile()
  const { isConnected, connect } = useWallet()
  const router = useRouter()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      email: "",
      company_name: "",
      company_position: "",
      company_website: "",
      company_description: "",
    },
  })

  // Fetch profile when component mounts
  useEffect(() => {
    if (isConnected) {
      fetchProfile()
    }
  }, [isConnected, fetchProfile])

  // Update form values when profile is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        display_name: profile.display_name || "",
        email: profile.email || "",
        company_name: profile.company_name || "",
        company_position: profile.company_position || "",
        company_website: profile.company_website || "",
        company_description: profile.company_description || "",
      })
    }
  }, [profile, form])

  async function onSubmit(values: ProfileFormValues) {
    const result = await updateProfile(values)
    if (result) {
      router.push("/borrow")
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to view and update your profile.
        </p>
        <Button onClick={connect} className="web3-button">
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Your Profile</h1>

      <Card className="web3-card mb-8">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Complete your profile information to create business proposals and participate in the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                          className="bg-slate-800 border-slate-700"
                        />
                      </FormControl>
                      <FormDescription>We'll never share your email with anyone else.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Position</FormLabel>
                      <FormControl>
                        <Input placeholder="CEO, CTO, etc." {...field} className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourcompany.com"
                          {...field}
                          className="bg-slate-800 border-slate-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="company_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of your company"
                            {...field}
                            className="bg-slate-800 border-slate-700 min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="web3-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
