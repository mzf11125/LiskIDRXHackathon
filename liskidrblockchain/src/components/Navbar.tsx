// filepath: c:\Users\mzida\Desktop\Coding_stuff\LiskIDRXHackathon\liskidrblockchain\src\components\Navbar.tsx
import Link from 'next/link';
import { Button } from "@/components/ui/button"; // Added import for Shadcn Button

const Navbar = () => {
  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              LendApp
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/lend">Lend</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/borrow">Borrow</Link>
            </Button>
          </div>
          <div className="flex items-center">
            {/* Placeholder for Xellar-Kit Wallet Connector */}
            <Button variant="default" size="sm">
              Connect Wallet
            </Button>
          </div>
          {/* Mobile menu button (optional) */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
