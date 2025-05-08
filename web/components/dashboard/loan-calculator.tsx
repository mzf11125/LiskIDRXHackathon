"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useAccount } from "wagmi"
import { useState } from "react"
import { Calculator } from "lucide-react"
import { useConnectModal } from "@xellar/kit"
import { useToast } from "@/hooks/use-toast"
import { useSecureXellarApi } from "@/components/xellar-hooks"

export function LoanCalculator() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { toast } = useToast()
  const { applyForLoan, isLoading } = useSecureXellarApi()
  const [loanAmount, setLoanAmount] = useState(1)
  const [loanDuration, setLoanDuration] = useState(30)
  const [collateralAmount, setCollateralAmount] = useState(10000)

  const maxLoanAmount = 3.8
  const interestRate = 0.05 // 5%
  const totalInterest = loanAmount * interestRate * (loanDuration / 365)
  const totalRepayment = loanAmount + totalInterest

  const handleApplyLoan = async () => {
    if (!isConnected) {
      openConnectModal?.()
      return
    }

    try {
      await applyForLoan(loanAmount, loanDuration, collateralAmount)

      toast({
        title: "Loan Application Submitted",
        description: `Your loan application for ${loanAmount.toFixed(2)} ETH has been submitted successfully.`,
      })
    } catch (error) {
      console.error("Loan application error:", error)
      // Error is already handled in the hook
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Calculator</CardTitle>
          <CardDescription>Calculate your loan terms</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-40">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Connect your wallet to use the loan calculator
          </p>
          <Button
            onClick={openConnectModal}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
          >
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-500" />
          <CardTitle>Loan Calculator</CardTitle>
        </div>
        <CardDescription>Calculate your loan terms and interest</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="loan-amount" className="text-sm font-medium">
                  Loan Amount (ETH)
                </label>
                <span className="text-sm">{loanAmount.toFixed(2)} ETH</span>
              </div>
              <Slider
                id="loan-amount"
                min={0.1}
                max={maxLoanAmount}
                step={0.1}
                value={[loanAmount]}
                onValueChange={(value) => setLoanAmount(value[0])}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0.1 ETH</span>
                <span>{maxLoanAmount} ETH</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="loan-duration" className="text-sm font-medium">
                  Loan Duration (Days)
                </label>
                <span className="text-sm">{loanDuration} days</span>
              </div>
              <Slider
                id="loan-duration"
                min={7}
                max={90}
                step={1}
                value={[loanDuration]}
                onValueChange={(value) => setLoanDuration(value[0])}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>7 days</span>
                <span>90 days</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="collateral-amount" className="text-sm font-medium">
                Collateral Amount (USDC)
              </label>
              <Input
                id="collateral-amount"
                type="number"
                placeholder="Enter collateral amount"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum required: {((loanAmount * 3245.78) / 0.75).toFixed(2)} USDC
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h4 className="mb-4 text-sm font-medium">Loan Summary</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Principal</span>
                  <span className="text-sm">{loanAmount.toFixed(2)} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Interest Rate</span>
                  <span className="text-sm">5.0% APR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm">{loanDuration} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Interest</span>
                  <span className="text-sm">{totalInterest.toFixed(4)} ETH</span>
                </div>
                <div className="border-t my-2"></div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-sm">Total Repayment</span>
                  <span className="text-sm">{totalRepayment.toFixed(4)} ETH</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>USD Equivalent</span>
                  <span>${(totalRepayment * 3245.78).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <h4 className="mb-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">Health Factor</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Your loan health factor indicates the safety of your position. Higher is better.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Health Factor</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">1.8</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
          onClick={handleApplyLoan}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Apply for Loan"}
        </Button>
      </CardFooter>
    </Card>
  )
}
