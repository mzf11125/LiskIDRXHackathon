import HeroSection from "@/components/HeroSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn Card
import { Button } from "@/components/ui/button"; // Shadcn Button
import { BarChart3, CheckCircle, ShieldCheck } from "lucide-react"; // Icons

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* Placeholder for additional homepage sections like featured pools or statistics */}
      <div className="my-12">
        <h2 className="text-3xl font-bold text-center text-foreground mb-8">
          How it Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              1. Connect Wallet
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300">
              Connect your Lisk wallet securely to interact with the platform.
            </p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              2. Lend or Borrow
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300">
              Choose to lend your assets to earn interest or borrow assets by
              providing collateral.
            </p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              3. Manage Positions
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300">
              Easily track and manage your active loans and borrows through your
              dashboard.
            </p>
          </div>
        </div>
      </div>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-primary mb-12">
            Why Choose LendApp?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
                  <ShieldCheck size={32} />
                </div>
                <CardTitle className="mt-4 text-2xl">
                  Secure & Transparent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leveraging the Lisk blockchain for robust security and
                  Xellar-Kit for seamless decentralized operations. All
                  transactions are verifiable on-chain.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
                  <BarChart3 size={32} />
                </div>
                <CardTitle className="mt-4 text-2xl">
                  Competitive Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn attractive interest on your supplied assets or borrow at
                  fair market rates. Our protocol is designed for efficiency and
                  optimal returns.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
                  <CheckCircle size={32} />
                </div>
                <CardTitle className="mt-4 text-2xl">Easy to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  With a user-friendly interface powered by modern web
                  technologies and Xellar-Kit, managing your crypto lending and
                  borrowing is simple and intuitive.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join LendApp today and unlock the potential of your crypto assets.
            Connect your wallet, explore the pools, and start your decentralized
            finance journey.
          </p>
          <Button size="lg" variant="default">
            Connect Wallet & Explore
          </Button>
        </div>
      </section>
    </>
  );
}
