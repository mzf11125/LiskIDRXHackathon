import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ConnectButton } from "@xellar/kit"

export function Hero() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500">
                Decentralized Lending Platform
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Borrow and lend crypto assets with community-based collateral pools. Secure, transparent, and efficient.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                >
                  Launch App
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="mt-4">
              <ConnectButton />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-muted p-2">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg" />
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-background/80 backdrop-blur-sm">
                    <div className="text-sm font-medium">Total Value Locked</div>
                    <div className="text-2xl font-bold">$24.8M</div>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-background/80 backdrop-blur-sm">
                    <div className="text-sm font-medium">Active Loans</div>
                    <div className="text-2xl font-bold">1,245</div>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-background/80 backdrop-blur-sm">
                    <div className="text-sm font-medium">Avg. APY</div>
                    <div className="text-2xl font-bold">5.2%</div>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-background/80 backdrop-blur-sm">
                    <div className="text-sm font-medium">Collateral Pools</div>
                    <div className="text-2xl font-bold">18</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
