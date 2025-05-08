// filepath: c:\Users\mzida\Desktop\Coding_stuff\LiskIDRXHackathon\liskidrblockchain\src\app\lend\page.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component from Shadcn
import { Label } from "@/components/ui/label"; // Assuming you have a Label component from Shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming Select from Shadcn

const LendPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-primary mb-10 text-center">
        Lend Your Assets & Earn Interest
      </h1>
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Lending Form Card */}
        <Card className="md:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create a Lending Offer</CardTitle>
            <CardDescription>
              Specify the asset, amount, interest rate, and duration for your
              lending offer. Powered by Xellar-Kit for secure on-chain
              transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Placeholder for Xellar-Kit Lending Module UI */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
              <p className="text-muted-foreground">
                [Xellar-Kit Lending Module Interface Placeholder]
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This area will host the Xellar-Kit component for asset
                selection, amount input, interest rate setting, and duration,
                interacting directly with the Lisk blockchain.
              </p>
            </div>

            {/* Fallback/Manual Form (to be replaced or controlled by Xellar-Kit) */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset" className="text-base">
                  Select Asset
                </Label>
                <Select name="asset">
                  <SelectTrigger id="asset" className="w-full mt-1">
                    <SelectValue placeholder="Choose an asset to lend" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lsk">Lisk (LSK)</SelectItem>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    {/* Dynamically populate with Xellar-Kit supported assets */}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-base">
                  Amount to Lend
                </Label>
                <Input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder="e.g., 1000 LSK"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="interestRate" className="text-base">
                  Desired Annual Interest Rate (%)
                </Label>
                <Input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  placeholder="e.g., 5.5"
                  step="0.1"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-base">
                  Loan Duration (Days)
                </Label>
                <Input
                  type="number"
                  id="duration"
                  name="duration"
                  placeholder="e.g., 30, 60, 90"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" disabled>
              {" "}
              {/* Disabled until Xellar-Kit integration */}
              Submit Lending Offer (via Xellar-Kit)
            </Button>
          </CardFooter>
        </Card>

        {/* Information/Stats Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Lending Overview</CardTitle>
            <CardDescription>Powered by Xellar-Kit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
              <p className="text-muted-foreground">
                [Xellar-Kit Lending Stats Placeholder]
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Display total supplied assets, current APYs, number of lenders,
                etc., fetched via Xellar-Kit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                How it Works:
              </h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Connect your Lisk wallet using Xellar-Kit.</li>
                <li>Select an asset and specify lending terms.</li>
                <li>Your offer is listed on the decentralized order book.</li>
                <li>Earn interest when borrowers accept your offer.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Lending Pools Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-primary mb-8 text-center">
          Active Lending Pools
        </h2>
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-muted/30">
          <p className="text-muted-foreground text-lg">
            [Xellar-Kit Active Lending Pools Display Placeholder]
          </p>
          <p className="text-muted-foreground mt-2">
            This section will dynamically list available lending pools, their
            current status, APYs, and total value locked, all powered by
            Xellar-Kit and the Lisk blockchain.
          </p>
        </div>
        {/* Example of how pools might be listed with Cards - to be driven by Xellar-Kit data */}
        {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>LSK Pool</CardTitle>
                <CardDescription>APY: 7.2% | Total Supplied: 1.5M LSK</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">View Details & Lend</Button>
              </CardContent>
            </Card>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default LendPage;
