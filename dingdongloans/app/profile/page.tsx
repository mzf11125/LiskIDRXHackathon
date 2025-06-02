"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/wallet-provider";
import { useProfile } from "@/components/ui/use-profile";
import { useAxios } from "@/hooks/useAxios";
import { User, Building, Mail, Globe, Briefcase, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  company_position: z.string().min(2, "Position must be at least 2 characters"),
  company_website: z.string().url("Please enter a valid website URL"),
  company_description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { isConnected, connect, address } = useWallet();
  const { profile, isLoading, fetchProfile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      email: "",
      bio: "",
      phone: "",
      website: "",
      company_name: "",
      company_position: "",
      company_website: "",
      company_description: "",
    },
  });

  // Load existing profile data
  useEffect(() => {
    if (isConnected && address) {
      const loadProfile = async () => {
        const profileData = await fetchProfile();
        if (profileData) {
          setProfileExists(true);
          form.reset({
            display_name: profileData.display_name || "",
            email: profileData.email || "",
            bio: profileData.bio || "",
            phone: profileData.phone || "",
            website: profileData.website || "",
            company_name: profileData.company_name || "",
            company_position: profileData.company_position || "",
            company_website: profileData.company_website || "",
            company_description: profileData.company_description || "",
          });
        }
      };
      loadProfile();
    }
  }, [isConnected, address, fetchProfile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to update your profile.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile(values);
      setProfileExists(true);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">
          Connect Your Wallet
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to access your profile.
        </p>
        <Button onClick={connect} className="web3-button">
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {profileExists ? "Update Profile" : "Create Profile"}
            </h1>
            <p className="text-slate-400 mt-2">
              {profileExists
                ? "Update your business profile information"
                : "Complete your business profile to create proposals"}
            </p>
          </div>
        </div>

        {!profileExists && (
          <Alert className="mb-6">
            <AlertDescription>
              You need to complete your profile before you can create business
              proposals. This information helps investors evaluate your
              credibility.
            </AlertDescription>
          </Alert>
        )}

        <Card className="web3-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Provide your business details to build trust with potential
              investors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Display Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="bg-slate-800 border-slate-700"
                          />
                        </FormControl>
                        <FormDescription>
                          Your name as it will appear to investors
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@company.com"
                            {...field}
                            className="bg-slate-800 border-slate-700"
                          />
                        </FormControl>
                        <FormDescription>
                          Your business email address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Company Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Corp"
                            {...field}
                            className="bg-slate-800 border-slate-700"
                          />
                        </FormControl>
                        <FormDescription>
                          The name of your company or organization
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Your Position
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="CEO, CTO, Founder, etc."
                            {...field}
                            className="bg-slate-800 border-slate-700"
                          />
                        </FormControl>
                        <FormDescription>
                          Your role within the company
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_website"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Company Website
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://www.company.com"
                            {...field}
                            className="bg-slate-800 border-slate-700"
                          />
                        </FormControl>
                        <FormDescription>
                          Your company's official website
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Company Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your company, what you do, your mission, and your experience in the industry..."
                            {...field}
                            className="bg-slate-800 border-slate-700 min-h-[120px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of your company and
                          business activities
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Bio
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself..."
                            {...field}
                            className="bg-slate-800 border-slate-700"
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description about yourself (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1234567890"
                            {...field}
                            className="bg-slate-800 border-slate-700"
                          />
                        </FormControl>
                        <FormDescription>
                          Your contact phone number (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Website</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://www.yourwebsite.com"
                            {...field}
                            className="bg-slate-800 border-slate-700"
                          />
                        </FormControl>
                        <FormDescription>
                          Your personal or professional website (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-slate-700" />

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Connected Wallet</h3>
                  <p className="text-sm text-slate-400 mb-2">
                    Your profile is linked to the following wallet address:
                  </p>
                  <code className="bg-slate-700 px-2 py-1 rounded text-sm">
                    {address}
                  </code>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="web3-button"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : profileExists
                        ? "Update Profile"
                        : "Create Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {profileExists && profile && (
          <Card className="web3-card mt-6">
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>
                This is how your profile appears to potential investors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">{profile.display_name}</h4>
                  <p className="text-slate-400">
                    {profile.company_position} at {profile.company_name}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">{profile.email}</p>
                  {profile.phone && (
                    <p className="text-sm text-slate-400">{profile.phone}</p>
                  )}
                </div>
                <div>
                  <a
                    href={profile.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    {profile.company_website}
                  </a>
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm block"
                    >
                      {profile.website}
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-4">
                {profile.bio && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm mb-1">Bio:</h5>
                    <p className="text-sm text-slate-400">{profile.bio}</p>
                  </div>
                )}
                <div>
                  <h5 className="font-medium text-sm mb-1">Company Description:</h5>
                  <p className="text-sm text-slate-400">{profile.company_description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
