"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, TrendingUp, Wallet, BarChart3, Shield, ArrowUpRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/components/wallet-provider"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DepositAssetForm from "@/components/deposit-asset-form"
import { getUserDeposits } from "@/data/mock-data"

export default function Home() {
  const { isConnected, connect } = useWallet()
  const [activeTab, setActiveTab] = useState("overview")
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)
  const [selectedAssetForDeposit, setSelectedAssetForDeposit] = useState<string>("")
  const heroRef = useRef<HTMLDivElement>(null)

  // Get user deposits
  const userDeposits = getUserDeposits()
  const totalDepositValue = userDeposits.reduce((sum, deposit) => {
    return sum + parseFloat(deposit.value.replace('$', '').replace(',', ''))
  }, 0)

  // Animated number counter effect
  const AnimatedCounter = ({
    end,
    label,
    prefix = "",
    suffix = "",
    formatOptions,
  }: { end: number; label: string; prefix?: string; suffix?: string; formatOptions?: Intl.NumberFormatOptions }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      let startTimestamp: number
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / 2000, 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }
      window.requestAnimationFrame(step)
    }, [end])

    return (
      <div className="text-center">
        <p className="text-2xl md:text-3xl font-bold gradient-text">
          {prefix}
          {count.toLocaleString(undefined, formatOptions)}
          {suffix}
        </p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    )
  }

  // Mouse move effect for hero section
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = hero.getBoundingClientRect()
      const x = (e.clientX - left) / width - 0.5
      const y = (e.clientY - top) / height - 0.5

      hero.style.setProperty("--mouse-x", `${x * 20}px`)
      hero.style.setProperty("--mouse-y", `${y * 20}px`)
    }

    hero.addEventListener("mousemove", handleMouseMove)

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const handleDepositAsset = (assetSymbol: string) => {
    setSelectedAssetForDeposit(assetSymbol)
    setIsDepositDialogOpen(true)
  }

  const handleDepositSuccess = () => {
    setIsDepositDialogOpen(false)
    setSelectedAssetForDeposit("")
    // In a real app, you might want to refresh data here
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 overflow-hidden" style={{ transform: "translate3d(0, 0, 0)" }}>
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="gradient-text">Decentralized</span> Lending on Lisk
                </h1>
                <p className="mt-6 text-xl text-slate-300">
                  Borrow and lend digital assets with the most secure and transparent platform on the Lisk blockchain powered with AI analyzer.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {isConnected ? (
                  <>
                    <Link href="/lend">
                      <Button className="web3-button text-lg px-8 py-6 group">
                        Start Lending{" "}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/borrow">
                      <Button variant="outline" className="text-lg px-8 py-6 border-slate-700 hover:bg-slate-800 group">
                        Deposit Assets{" "}
                        <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      console.log("Connect wallet button clicked")
                      connect()
                    }}
                    className="web3-button text-lg px-8 py-6 group"
                  >
                    Connect Wallet <Wallet className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <AnimatedCounter
                  end={1.2}
                  label="Total Value Locked"
                  prefix="$"
                  suffix="B+"
                  formatOptions={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
                />
                <AnimatedCounter end={12} label="Avg. APR" suffix="%" />
                <AnimatedCounter end={50000} label="Transactions" suffix="+" />
              </div>
            </div>
            <div className="relative">
              <div className="web3-card p-6 glow-border floating">
                <h3 className="text-xl font-semibold mb-4">Market Overview</h3>
                <div className="space-y-4">
                  {["IDRX", "LSK", "BTC", "ETH"].map((token, i) => (
                    <div
                      key={token}
                      className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                          {token.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{token}</p>
                          <p className="text-xs text-slate-400">
                            Deposit APR: {5 + i * 2}% | Borrow APR: {3 + i * 1.5}%
                          </p>
                        </div>
                      </div>
                      <TrendingUp className={cn("h-5 w-5", i % 2 === 0 ? "text-green-500" : "text-red-500")} />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/markets">
                    <Button variant="link" className="text-primary group">
                      View all markets{" "}
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl pulse"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose <span className="gradient-text">Dingdong.loans</span>
            </h2>
            <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
              Our platform offers the most secure, transparent, and efficient way to lend and borrow digital assets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Analyzer",
                description: "Leverage our AI-driven insights for smarter lending and borrowing decisions.",
                icon: <TrendingUp className="h-10 w-10 text-primary" />, // Or a more AI-specific icon if you have one
                delay: "floating-delay-0",
              },
              {
                title: "Secure Protocol",
                description: "Built on Lisk blockchain with multiple security audits and insurance",
                icon: <Shield className="h-10 w-10 text-primary" />,
                delay: "floating-delay-1",
              },
              {
                title: "Transparent",
                description: "All transactions and rates are visible on-chain for complete transparency",
                icon: <BarChart3 className="h-10 w-10 text-primary" />,
                delay: "floating-delay-2",
              },
            ].map((feature, i) => (
              <Card key={i} className={`web3-card web3-gradient ${feature.delay}`}>
                <CardHeader>
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4 pulse">{feature.icon}</div>
                  <CardTitle className="gradient-text">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      {isConnected && (
        <section className="py-16 relative overflow-hidden glass-effect">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 gradient-text">Your Dashboard</h2>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-8 bg-slate-800/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="supply">Supply</TabsTrigger>
                <TabsTrigger value="borrow">Borrow</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="web3-card floating">
                    <CardHeader>
                      <CardTitle className="text-lg">Total Deposit Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold gradient-text">${totalDepositValue.toFixed(2)}</p>
                      <p className="text-sm text-slate-400 mt-1">Across {userDeposits.length} assets</p>
                    </CardContent>
                  </Card>

                  <Card className="web3-card floating-delay-1">
                    <CardHeader>
                      <CardTitle className="text-lg">Total Debt</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold gradient-text">$0.00</p>
                      <p className="text-sm text-slate-400 mt-1">Across 0 assets</p>
                    </CardContent>
                  </Card>

                  <Card className="web3-card floating-delay-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Net APY</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold gradient-text">
                        {userDeposits.length > 0 ? "7.2%" : "0.00%"}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">Based on your positions</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="web3-card">
                  <CardHeader>
                    <CardTitle>Your Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userDeposits.length > 0 ? (
                      <div className="space-y-4">
                        {userDeposits.map((deposit) => (
                          <div key={deposit.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                {deposit.asset.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{deposit.asset}</p>
                                <p className="text-sm text-slate-400">Deposited: {deposit.amount}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium gradient-text">{deposit.value}</p>
                              <p className="text-sm text-green-500">+{deposit.earnedInterest} earned</p>
                            </div>
                          </div>
                        ))}
                        <div className="pt-4 flex justify-center gap-4">
                          <Button onClick={() => setIsDepositDialogOpen(true)} className="web3-button group">
                            <Plus className="mr-2 h-4 w-4" />
                            Deposit More{" "}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          <Button onClick={() => setActiveTab("borrow")} variant="outline" className="group">
                            Borrow Assets{" "}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">You don't have any active positions yet.</p>
                        <div className="mt-4 flex justify-center gap-4">
                          <Button onClick={() => setActiveTab("supply")} variant="outline" className="group">
                            Supply Assets{" "}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          <Button onClick={() => setActiveTab("borrow")} variant="outline" className="group">
                            Borrow Assets{" "}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="supply" className="space-y-6">
                <Card className="web3-card">
                  <CardHeader>
                    <CardTitle>Assets to Deposit</CardTitle>
                    <CardDescription>Supply assets to earn interest and use as collateral</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["IDRX", "LSK", "BTC", "ETH"].map((token, i) => (
                        <div
                          key={token}
                          className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                              {token.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{token}</p>
                              <p className="text-xs text-slate-400">
                                Wallet: 0.00 {token === "IDRX" ? "(Earn interest + Borrowable)" : "(Earn interest + Collateral)"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium gradient-text">{5 + i * 2}% APY</p>
                            <Button 
                              size="sm" 
                              className="mt-1 h-8 web3-button"
                              onClick={() => handleDepositAsset(token)}
                            >
                              Deposit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="borrow" className="space-y-6">
                <Card className="web3-card">
                  <CardHeader>
                    <CardTitle>Assets to Borrow</CardTitle>
                    <CardDescription>Currently only IDRX is available for borrowing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-2xl font-bold">I</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-medium mb-2">IDRX Token</h3>
                      <p className="text-slate-400 mb-4">The primary borrowable asset on our platform</p>
                      <p className="text-sm text-slate-400 mb-4">
                        You need to supply assets as collateral before borrowing IDRX.
                      </p>
                      <Button onClick={() => setActiveTab("supply")} className="web3-button group">
                        Supply Collateral{" "}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      )}

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent 
          className="web3-card sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          style={{ position: "fixed" }}
        >
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">
              Deposit Assets
            </DialogTitle>
            <DialogDescription>
              Deposit assets to earn interest and use them as collateral for borrowing.
            </DialogDescription>
          </DialogHeader>
          <DepositAssetForm 
            onSuccess={handleDepositSuccess} 
            preselectedAsset={selectedAssetForDeposit}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
