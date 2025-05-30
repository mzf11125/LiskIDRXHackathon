"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/components/wallet-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import {
  getUserProfile,
  createOrUpdateUserProfile,
} from "@/data/wallet-analysis-api";
import type { UserProfile, ProfileUpdateRequest } from "@/types/wallet-analysis";

export default function ProfilePage() {
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileUpdateRequest>({
    display_name: "",
    email: "",
    bio: "",
    avatar_url: "",
    phone: "",
    website: "",
    social_media: {
      twitter: "",
      linkedin: "",
      telegram: "",
    },
    company_name: "",
    company_position: "",
    company_website: "",
    company_description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadProfile();
    }
  }, [isConnected, address]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const userProfile = await getUserProfile();
      setProfile({
        display_name: userProfile.display_name || "",
        email: userProfile.email || "",
        bio: userProfile.bio || "",
        avatar_url: userProfile.avatar_url || "",
        phone: userProfile.phone || "",
        website: userProfile.website || "",
        social_media: {
          twitter: userProfile.social_media?.twitter || "",
          linkedin: userProfile.social_media?.linkedin || "",
          telegram: userProfile.social_media?.telegram || "",
        },
        company_name: userProfile.company_name || "",
        company_position: userProfile.company_position || "",
        company_website: userProfile.company_website || "",
        company_description: userProfile.company_description || "",
      });
    } catch (error) {
      console.log("No existing profile found, starting fresh");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a temporary URL for preview
    const imageUrl = URL.createObjectURL(file);
    setProfile({ ...profile, avatar_url: imageUrl });

    // Here you would typically upload to a file storage service
    // For now, we'll just use the blob URL
    toast({
      title: "Avatar Updated",
      description: "Avatar preview updated. Save your profile to confirm changes.",
    });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setProfile({
      ...profile,
      social_media: {
        ...profile.social_media,
        [platform]: value,
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await createOrUpdateUserProfile(profile);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was an error saving your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please connect your wallet to manage your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="web3-card">
        <CardHeader>
          <CardTitle className="gradient-text">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url} alt="Profile" />
              <AvatarFallback className="bg-slate-800 text-2xl">
                {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : <User />}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <Button asChild variant="outline" size="sm">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Avatar
                </label>
              </Button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={profile.display_name}
                  onChange={(e) =>
                    setProfile({ ...profile, display_name: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700"
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  value={profile.website || ""}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="bg-slate-800 border-slate-700"
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={profile.social_media?.twitter || ""}
                  onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={profile.social_media?.linkedin || ""}
                  onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <Label htmlFor="telegram">Telegram</Label>
                <Input
                  id="telegram"
                  value={profile.social_media?.telegram || ""}
                  onChange={(e) => handleSocialMediaChange("telegram", e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="https://t.me/username"
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={profile.company_name}
                  onChange={(e) =>
                    setProfile({ ...profile, company_name: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700"
                  placeholder="Enter your company name"
                />
              </div>
              <div>
                <Label htmlFor="company_position">Position</Label>
                <Input
                  id="company_position"
                  value={profile.company_position}
                  onChange={(e) =>
                    setProfile({ ...profile, company_position: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700"
                  placeholder="Enter your position"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company_website">Company Website</Label>
              <Input
                id="company_website"
                value={profile.company_website}
                onChange={(e) =>
                  setProfile({ ...profile, company_website: e.target.value })
                }
                className="bg-slate-800 border-slate-700"
                placeholder="https://your-company.com"
              />
            </div>

            <div>
              <Label htmlFor="company_description">Company Description</Label>
              <Textarea
                id="company_description"
                value={profile.company_description}
                onChange={(e) =>
                  setProfile({ ...profile, company_description: e.target.value })
                }
                className="bg-slate-800 border-slate-700"
                placeholder="Describe your company..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="web3-button"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
