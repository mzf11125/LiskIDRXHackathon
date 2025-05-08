// filepath: c:\Users\mzida\Desktop\Coding_stuff\LiskIDRXHackathon\liskidrblockchain\src\components\HeroSection.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button"; // Added import for Shadcn Button
import { ArrowRight } from "lucide-react"; // For icon

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-background to-secondary/50 text-foreground py-20 md:py-32">
      <div className="container mx-auto flex px-5 items-center justify-center text-center">
        <div className="lg:w-2/3 w-full">
          <h1 className="title-font sm:text-5xl md:text-6xl text-4xl mb-6 font-bold text-primary">
            Decentralized Lending & Borrowing
            <br className="hidden lg:inline-block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
              Powered by Lisk & Xellar
            </span>
          </h1>
          <p className="mb-10 leading-relaxed text-lg text-muted-foreground md:px-16">
            Experience the future of finance. Securely lend your crypto assets
            to earn competitive interest or borrow funds by providing
            collateral, all on a transparent and decentralized platform built
            with Lisk and Xellar-Kit.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="default" className="group">
              Start Lending
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline">
              Start Borrowing
            </Button>
          </div>
          <div className="mt-16">
            {/* Placeholder for a more dynamic Web3/Lending illustration or animation */}
            {/* Consider using an Aceternity UI component here if suitable */}
            <Image
              className="object-cover object-center rounded-lg shadow-2xl mx-auto"
              alt="hero illustration"
              src="/placeholder-hero.svg" // Replace with an actual image or animation
              width={600}
              height={400}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
