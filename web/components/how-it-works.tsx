import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Database, Calculator, CheckCircle } from "lucide-react"

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform simplifies the lending and borrowing process with blockchain technology
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle>1. Connect Your Wallet</CardTitle>
              </div>
              <CardDescription>Connect your Web3 wallet to access the platform securely</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use your preferred wallet like MetaMask, WalletConnect, or any other compatible wallet to authenticate.
                Your private keys always remain with you.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle>2. Select Collateral</CardTitle>
              </div>
              <CardDescription>Choose your crypto assets to use as collateral</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select from a variety of supported cryptocurrencies to use as collateral. Your assets will be pooled
                with others to create a community-based collateral system.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle>3. Calculate Loan Terms</CardTitle>
              </div>
              <CardDescription>Determine your loan amount, interest rate, and duration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our smart contracts automatically calculate the maximum loan amount based on your collateral value.
                Choose your preferred loan duration and review the interest rates.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle>4. Receive Your Loan</CardTitle>
              </div>
              <CardDescription>Get instant funding directly to your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Once approved, your loan is immediately transferred to your wallet. Repay according to the terms to
                retrieve your collateral, or extend your loan if needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
