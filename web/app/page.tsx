import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Stats } from "@/components/stats"
import { HowItWorks } from "@/components/how-it-works"
import { XellarDebug } from "@/components/xellar-debug"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <div className="container px-4 md:px-6 py-8">
        <XellarDebug />
      </div>
    </main>
  )
}
