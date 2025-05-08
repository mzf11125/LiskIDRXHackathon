import { Shield, Coins, Users, BarChart3 } from "lucide-react"

export function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose Our Platform</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our decentralized lending platform offers unique advantages for borrowers and lenders
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Shield className="h-12 w-12 text-emerald-500" />
            <h3 className="text-xl font-bold">Secure</h3>
            <p className="text-center text-sm text-muted-foreground">
              Built on blockchain technology with audited smart contracts
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Coins className="h-12 w-12 text-emerald-500" />
            <h3 className="text-xl font-bold">Flexible Assets</h3>
            <p className="text-center text-sm text-muted-foreground">
              Support for multiple cryptocurrencies and tokens
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Users className="h-12 w-12 text-emerald-500" />
            <h3 className="text-xl font-bold">Community Pools</h3>
            <p className="text-center text-sm text-muted-foreground">
              Pooled collateral for better rates and reduced risk
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <BarChart3 className="h-12 w-12 text-emerald-500" />
            <h3 className="text-xl font-bold">Transparent</h3>
            <p className="text-center text-sm text-muted-foreground">
              Real-time analytics and complete visibility into all transactions
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
