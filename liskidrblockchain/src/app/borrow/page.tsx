// filepath: c:\Users\mzida\Desktop\Coding_stuff\LiskIDRXHackathon\liskidrblockchain\src\app\borrow\page.tsx
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

const BorrowPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-primary mb-10 text-center">
        Borrow Assets Against Your Collateral
      </h1>
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Borrowing Form Card */}
        <Card className="md:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Request a Loan</CardTitle>
            <CardDescription>
              Provide collateral and borrow assets. All transactions are secured
              on the Lisk blockchain via Xellar-Kit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Placeholder for Xellar-Kit Borrowing Module UI */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
              <p className="text-muted-foreground">
                [Xellar-Kit Borrowing Module Interface Placeholder]
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This area will host the Xellar-Kit component for selecting
                assets to borrow, specifying amounts, and managing collateral,
                interacting directly with the Lisk blockchain.
              </p>
            </div>

            {/* Fallback/Manual Form (to be replaced or controlled by Xellar-Kit) */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="borrowAsset" className="text-base">
                  Asset to Borrow
                </Label>
                <Select name="borrowAsset">
                  <SelectTrigger id="borrowAsset" className="w-full mt-1">
                    <SelectValue placeholder="Choose an asset to borrow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lsk">Lisk (LSK)</SelectItem>
                    <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                    {/* Dynamically populate with Xellar-Kit supported assets */}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="borrowAmount" className="text-base">
                  Amount to Borrow
                </Label>
                <Input
                  type="number"
                  id="borrowAmount"
                  name="borrowAmount"
                  placeholder="e.g., 500 USDC"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="collateralAsset" className="text-base">
                  Collateral Asset
                </Label>
                <Select name="collateralAsset">
                  <SelectTrigger id="collateralAsset" className="w-full mt-1">
                    <SelectValue placeholder="Choose collateral asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lsk">Lisk (LSK)</SelectItem>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    {/* Dynamically populate with Xellar-Kit supported assets */}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="collateralAmount" className="text-base">
                  Collateral Amount
                </Label>
                <Input
                  type="number"
                  id="collateralAmount"
                  name="collateralAmount"
                  placeholder="e.g., 2000 LSK (auto-calculated or input)"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum collateralization ratio will be displayed here (via
                  Xellar-Kit).
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" variant="secondary" disabled>
              {" "}
              {/* Disabled until Xellar-Kit integration */}
              Submit Loan Request (via Xellar-Kit)
            </Button>
          </CardFooter>
        </Card>

        {/* Information/Stats Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Borrowing Overview</CardTitle>
            <CardDescription>Powered by Xellar-Kit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
              <p className="text-muted-foreground">
                [Xellar-Kit Borrowing Stats Placeholder]
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Display total borrowed assets, current interest rates, available
                liquidity, etc., fetched via Xellar-Kit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                How it Works:
              </h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Connect your Lisk wallet using Xellar-Kit.</li>
                <li>
                  Choose an asset to borrow and provide sufficient collateral.
                </li>
                <li>
                  Your loan request is matched with available lending offers.
                </li>
                <li>
                  Manage your loan and collateral levels through your dashboard.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Loans Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-primary mb-8 text-center">
          Available Loan Offers
        </h2>
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-muted/30">
          <p className="text-muted-foreground text-lg">
            [Xellar-Kit Available Loan Offers Display Placeholder]
          </p>
          <p className="text-muted-foreground mt-2">
            This section will dynamically list available loan offers from
            lenders, their terms, interest rates, and collateral requirements,
            all powered by Xellar-Kit.
          </p>
        </div>
        {/* Example of how loans might be listed with Cards - to be driven by Xellar-Kit data */}
        {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Borrow USDC</CardTitle>
                <CardDescription>Interest: 5.0% | Collateral: LSK</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">View Details & Borrow</Button>
              </CardContent>
            </Card>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default BorrowPage;
