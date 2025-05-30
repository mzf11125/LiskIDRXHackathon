"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  User,
  Wallet,
  Clock,
  Activity,
} from "lucide-react";
import { useWallet } from "@/components/wallet-provider";
import { getOrAnalyzeWallet } from "@/data/wallet-analysis-api";
import { useProfile } from "@/components/ui/use-profile";
import type { APIWalletAnalysis } from "@/types/wallet-analysis";

interface CreditScoreAnalysis {
  overall_score: number;
  risk_level: "Low" | "Medium" | "High";
  factors: {
    wallet_analysis: {
      score: number;
      weight: number;
      details: string[];
    };
    profile_completion: {
      score: number;
      weight: number;
      details: string[];
    };
    transaction_history: {
      score: number;
      weight: number;
      details: string[];
    };
    account_age: {
      score: number;
      weight: number;
      details: string[];
    };
  };
  recommendations: string[];
}

export default function WalletAnalytics() {
  const { address, isConnected } = useWallet();
  const { profile, fetchProfile, isProfileComplete } = useProfile();
  const [walletAnalysis, setWalletAnalysis] =
    useState<APIWalletAnalysis | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScoreAnalysis | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      loadAnalytics();
    }
  }, [isConnected, address]);

  const loadAnalytics = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load wallet analysis
      const analysis = await getOrAnalyzeWallet(address);
      setWalletAnalysis(analysis);

      // Load profile
      await fetchProfile();

      // Calculate credit score
      const creditAnalysis = calculateCreditScore(
        analysis,
        profile,
        isProfileComplete()
      );
      setCreditScore(creditAnalysis);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCreditScore = (
    analysis: APIWalletAnalysis,
    userProfile: any,
    profileComplete: boolean
  ): CreditScoreAnalysis => {
    // Wallet Analysis Factor (40% weight)
    const walletScore = Math.min(100, Math.max(0, analysis.final_score));
    const walletWeight = 0.4;
    const walletDetails = [
      `Risk Level: ${analysis.risk_level}`,
      `Final Score: ${analysis.final_score}/100`,
      `Activity Level: ${analysis.wallet_metadata.activity_level}`,
      `Transaction Count: ${analysis.wallet_metadata.transaction_count}`,
    ];

    // Profile Completion Factor (25% weight)
    const profileScore = profileComplete ? 100 : 30;
    const profileWeight = 0.25;
    const profileDetails = profileComplete
      ? [
          "✓ Profile fully completed",
          "✓ All required fields filled",
          "✓ Business information provided",
        ]
      : [
          "✗ Profile incomplete",
          "✗ Missing required fields",
          "✗ Complete profile to improve score",
        ];

    // Transaction History Factor (20% weight)
    const transactionCount = analysis.wallet_metadata.transaction_count;
    const activityScore = Math.min(100, (transactionCount / 50) * 100); // Max score at 50+ transactions
    const transactionWeight = 0.2;
    const transactionDetails = [
      `Transaction Count: ${transactionCount}`,
      `Unique Interactions: ${analysis.wallet_metadata.unique_interactions}`,
      transactionCount > 20
        ? "✓ Good transaction history"
        : "⚠ Limited transaction history",
    ];

    // Account Age Factor (15% weight)
    const accountAge = analysis.wallet_metadata.age;
    const ageScore = accountAge.includes("year")
      ? 100
      : accountAge.includes("month")
      ? 70
      : 40;
    const ageWeight = 0.15;
    const ageDetails = [
      `Account Age: ${accountAge}`,
      ageScore >= 100
        ? "✓ Mature account"
        : ageScore >= 70
        ? "⚠ Moderately aged account"
        : "⚠ New account",
    ];

    // Calculate overall score
    const overallScore = Math.round(
      walletScore * walletWeight +
        profileScore * profileWeight +
        activityScore * transactionWeight +
        ageScore * ageWeight
    );

    // Determine risk level
    let riskLevel: "Low" | "Medium" | "High";
    if (overallScore >= 75) riskLevel = "Low";
    else if (overallScore >= 50) riskLevel = "Medium";
    else riskLevel = "High";

    // Generate recommendations
    const recommendations = [];
    if (!profileComplete) {
      recommendations.push(
        "Complete your business profile to improve credibility"
      );
    }
    if (walletScore < 50) {
      recommendations.push(
        "Increase wallet activity and use verified contracts"
      );
    }
    if (transactionCount < 20) {
      recommendations.push(
        "Build transaction history with legitimate activities"
      );
    }
    if (ageScore < 70) {
      recommendations.push("Account age will improve over time");
    }
    if (overallScore >= 75) {
      recommendations.push(
        "Excellent credit profile! You qualify for better rates."
      );
    }

    return {
      overall_score: overallScore,
      risk_level: riskLevel,
      factors: {
        wallet_analysis: {
          score: walletScore,
          weight: walletWeight,
          details: walletDetails,
        },
        profile_completion: {
          score: profileScore,
          weight: profileWeight,
          details: profileDetails,
        },
        transaction_history: {
          score: activityScore,
          weight: transactionWeight,
          details: transactionDetails,
        },
        account_age: {
          score: ageScore,
          weight: ageWeight,
          details: ageDetails,
        },
      },
      recommendations,
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-500/20 text-green-500 border-green-500/50";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "High":
        return "bg-red-500/20 text-red-500 border-red-500/50";
      default:
        return "bg-slate-500/20 text-slate-500 border-slate-500/50";
    }
  };

  if (!isConnected) {
    return (
      <Card className="web3-card">
        <CardContent className="text-center py-8">
          <Wallet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">
            Connect your wallet to view analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="web3-card">
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Analyzing your wallet and profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="web3-card">
        <CardContent className="text-center py-8">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={loadAnalytics} variant="outline">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credit Score Overview */}
      {creditScore && (
        <Card className="web3-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Credit Score Analysis
                </CardTitle>
                <CardDescription>
                  Your borrowing creditworthiness based on wallet and profile
                  analysis
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={getScoreBadgeColor(creditScore.risk_level)}
              >
                {creditScore.risk_level} Risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold mb-2 ${getScoreColor(
                      creditScore.overall_score
                    )}`}
                  >
                    {creditScore.overall_score}
                  </div>
                  <div className="text-slate-400 mb-4">Credit Score</div>
                  <Progress
                    value={creditScore.overall_score}
                    className="h-2 mb-4"
                    indicatorClassName={
                      creditScore.overall_score >= 75
                        ? "bg-green-500"
                        : creditScore.overall_score >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  />
                  <div className="text-sm text-slate-400">
                    {creditScore.overall_score >= 75
                      ? "Excellent - Qualify for best rates"
                      : creditScore.overall_score >= 50
                      ? "Good - Standard rates apply"
                      : "Fair - Higher rates may apply"}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h4 className="font-medium mb-3">Score Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(creditScore.factors).map(([key, factor]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">
                            {key.replace("_", " ")}
                          </span>
                          <span className="text-sm text-slate-400">
                            {Math.round(factor.score * factor.weight)}/
                            {Math.round(100 * factor.weight)} pts
                          </span>
                        </div>
                        <Progress
                          value={factor.score}
                          className="h-1.5"
                          indicatorClassName={
                            factor.score >= 75
                              ? "bg-green-500"
                              : factor.score >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="factors">Score Factors</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {walletAnalysis && (
              <>
                <Card className="web3-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Wallet Score</span>
                    </div>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(
                        walletAnalysis.final_score
                      )}`}
                    >
                      {walletAnalysis.final_score}/100
                    </div>
                    <div className="text-xs text-slate-400">
                      {walletAnalysis.risk_level} Risk Level
                    </div>
                  </CardContent>
                </Card>

                <Card className="web3-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Profile Status
                      </span>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        isProfileComplete() ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isProfileComplete() ? "Complete" : "Incomplete"}
                    </div>
                    <div className="text-xs text-slate-400">
                      Business Profile
                    </div>
                  </CardContent>
                </Card>

                <Card className="web3-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Account Age</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {walletAnalysis.wallet_metadata.age}
                    </div>
                    <div className="text-xs text-slate-400">
                      Wallet Creation
                    </div>
                  </CardContent>
                </Card>

                <Card className="web3-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Transactions</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {walletAnalysis.wallet_metadata.transaction_count}
                    </div>
                    <div className="text-xs text-slate-400">Total Count</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="factors" className="space-y-6">
          {creditScore && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(creditScore.factors).map(([key, factor]) => (
                <Card key={key} className="web3-card">
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">
                      {key.replace("_", " ")}
                    </CardTitle>
                    <CardDescription>
                      Weight: {Math.round(factor.weight * 100)}% • Score:{" "}
                      {factor.score}/100
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={factor.score}
                      className="h-2 mb-4"
                      indicatorClassName={
                        factor.score >= 75
                          ? "bg-green-500"
                          : factor.score >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }
                    />
                    <ul className="space-y-1">
                      {factor.details.map((detail, index) => (
                        <li key={index} className="text-sm text-slate-300">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {creditScore && (
            <Card className="web3-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Improvement Recommendations
                </CardTitle>
                <CardDescription>
                  Actions you can take to improve your credit score and
                  borrowing terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {creditScore.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button
          onClick={loadAnalytics}
          variant="outline"
          className="bg-slate-800 border-slate-700"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
}
