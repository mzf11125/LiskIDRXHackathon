"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Info, AlertTriangle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { pools } from "@/data/mock-data"
import { useWallet } from "@/components/wallet-provider"
import { Progress } from "@/components/ui/progress"

const formSchema = z.object({
  borrowAsset: z.string({
    required_error: "Please select an asset to borrow.",
  }),
  borrowAmount: z.string().min(1, {
    message: "Please enter an amount to borrow.",
  }),
  collateralAsset: z.string({
    required_error: "Please select a collateral asset.",
  }),
  collateralAmount: z.string().min(1, {
    message: "Please enter a collateral amount.",
  }),
  loanTerm: z.string({
    required_error: "Please select a loan term.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface BorrowCryptoFormProps {
  onSuccess: () => void
}

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function BorrowCryptoForm({ onSuccess }: BorrowCryptoFormProps) {
  const { toast } = useToast()
  const { address } = useWallet()

  // Get all available assets from pools
  const allAssets = pools.flatMap((pool) => pool.assets)

  // State for calculated values
  const [collateralizationRatio, setCollateralizationRatio] = useState(200)
  const [borrowValue, setBorrowValue] = useState(0)
  const [collateralValue, setCollateralValue] = useState(0)
  const [liquidationPrice, setLiquidationPrice] = useState(0)
  const [interestRate, setInterestRate] = useState(0)
  const [healthFactor, setHealthFactor] = useState(0)
  const [isConfirmStep, setIsConfirmStep] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      borrowAsset: "",
      borrowAmount: "",
      collateralAsset: "",
      collateralAmount: "",
      loanTerm: "30",
    },
  })

  // Watch form values to update calculations
  const borrowAsset = form.watch("borrowAsset")
  const borrowAmount = form.watch("borrowAmount")
  const collateralAsset = form.watch("collateralAsset")
  const collateralAmount = form.watch("collateralAmount")
  const loanTerm = form.watch("loanTerm")

  // Update calculations when form values change
  useEffect(() => {
    if (borrowAsset && borrowAmount && collateralAsset && collateralAmount) {
      // In a real app, these would be actual calculations based on market data
      const borrowAssetPrice = Number.parseFloat(
        allAssets
          .find((a) => a.symbol === borrowAsset)
          ?.price.replace("$", "")
          .replace(",", "") || "0",
      )
      const collateralAssetPrice = Number.parseFloat(
        allAssets
          .find((a) => a.symbol === collateralAsset)
          ?.price.replace("$", "")
          .replace(",", "") || "0",
      )

      const borrowAmountValue = Number.parseFloat(borrowAmount) * borrowAssetPrice
      const collateralAmountValue = Number.parseFloat(collateralAmount) * collateralAssetPrice

      setBorrowValue(borrowAmountValue)
      setCollateralValue(collateralAmountValue)

      // Calculate collateralization ratio
      const ratio = (collateralAmountValue / borrowAmountValue) * 100
      setCollateralizationRatio(Math.round(ratio))

      // Calculate liquidation price (simplified)
      const minRatio = 150 // Minimum collateralization ratio before liquidation
      const liquidationPriceValue = (borrowAmountValue * minRatio) / 100 / Number.parseFloat(collateralAmount)
      setLiquidationPrice(liquidationPriceValue)

      // Set interest rate based on asset and term
      const baseRate = Number.parseFloat(allAssets.find((a) => a.symbol === borrowAsset)?.apr.replace("%", "") || "0")
      const termMultiplier = Number.parseInt(loanTerm) === 30 ? 1 : Number.parseInt(loanTerm) === 90 ? 0.95 : 0.9
      setInterestRate(baseRate * termMultiplier)

      // Calculate health factor (higher is better)
      const health = ratio / minRatio
      setHealthFactor(health)
    }
  }, [borrowAsset, borrowAmount, collateralAsset, collateralAmount, loanTerm, allAssets])

  function onSubmit(values: FormValues) {
    if (!isConfirmStep) {
      setIsConfirmStep(true)
      return
    }

    // In a real app, this would send the transaction to the blockchain
    console.log(values)

    toast({
      title: "Loan Created",
      description: `You have successfully borrowed ${values.borrowAmount} ${values.borrowAsset}`,
    })

    onSuccess()
  }

  // Get health factor color
  const getHealthColor = () => {
    if (healthFactor >= 1.5) return "text-green-500"
    if (healthFactor >= 1.2) return "text-yellow-500"
    return "text-red-500"
  }

  // Get health factor label
  const getHealthLabel = () => {
    if (healthFactor >= 1.5) return "Safe"
    if (healthFactor >= 1.2) return "Moderate"
    return "At Risk"
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!isConfirmStep ? (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="borrowAsset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset to Borrow</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue placeholder="Select asset" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {allAssets
                            .filter(
                              (asset, index, self) =>
                                index === self.findIndex((a) => a.symbol === asset.symbol) && 
                                asset.supplyEnabled && 
                                asset.symbol === "IDRX" // Only allow IDRX for borrowing
                            )
                            .map((asset) => (
                              <SelectItem key={asset.symbol} value={asset.symbol}>
                                {asset.symbol} - {asset.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current rate: {borrowAsset ? allAssets.find((a) => a.symbol === borrowAsset)?.apr : "8.2% (IDRX only)"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="borrowAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount to Borrow</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0.00"
                          {...field}
                          className="bg-slate-800 border-slate-700"
                          type="number"
                          step="0.01"
                          min="0.01"
                        />
                      </FormControl>
                      <FormDescription>
                        Available: {borrowAsset ? allAssets.find((a) => a.symbol === borrowAsset)?.available : "IDRX only available for borrowing"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="collateralAsset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collateral Asset</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue placeholder="Select collateral" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {allAssets
                            .filter(
                              (asset, index, self) =>
                                index === self.findIndex((a) => a.symbol === asset.symbol) && asset.supplyEnabled,
                            )
                            .map((asset) => (
                              <SelectItem key={asset.symbol} value={asset.symbol}>
                                {asset.symbol} - {asset.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Collateral factor:{" "}
                        {collateralAsset
                          ? allAssets.find((a) => a.symbol === collateralAsset)?.collateralFactor
                          : "N/A"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collateralAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collateral Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0.00"
                          {...field}
                          className="bg-slate-800 border-slate-700"
                          type="number"
                          step="0.01"
                          min="0.01"
                        />
                      </FormControl>
                      <FormDescription>
                        Wallet balance:{" "}
                        {collateralAsset ? allAssets.find((a) => a.symbol === collateralAsset)?.walletBalance : "N/A"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="loanTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Term</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Longer terms may have different interest rates</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {borrowValue > 0 && collateralValue > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>Collateralization Ratio</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 border-slate-700">
                              <p className="max-w-xs">
                                The ratio between your collateral value and borrowed value. Higher is safer.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="font-bold">{collateralizationRatio}%</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-400">Liquidation</span>
                        <span className="text-green-400">Safe</span>
                      </div>
                      <Progress value={Math.min(collateralizationRatio, 300)} max={300} className="h-2 bg-slate-700" />
                      <div className="flex justify-between text-xs mt-1">
                        <span>150%</span>
                        <span>300%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-sm text-slate-400">Borrow Value</div>
                        <div className="font-medium">{formatCurrency(borrowValue)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Collateral Value</div>
                        <div className="font-medium">{formatCurrency(collateralValue)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Liquidation Price</div>
                        <div className="font-medium">
                          ${liquidationPrice.toFixed(2)} per {collateralAsset}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Interest Rate</div>
                        <div className="font-medium">{interestRate.toFixed(2)}% APR</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Health Factor</div>
                        <div className={`font-medium ${getHealthColor()}`}>
                          {healthFactor.toFixed(2)} ({getHealthLabel()})
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Estimated Fee</div>
                        <div className="font-medium">{formatCurrency(borrowValue * 0.001)}</div>
                      </div>
                    </div>

                    {healthFactor < 1.2 && (
                      <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-800/50 rounded-md mt-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-red-400">Warning: High Liquidation Risk</p>
                          <p className="text-slate-300">
                            Your health factor is low. Consider increasing your collateral or reducing your borrow
                            amount to avoid liquidation.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-green-950/30 border border-green-800/50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-medium text-green-400">Confirm Your Loan</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Please review the details of your loan before confirming. Once confirmed, the transaction will be sent
                to the blockchain.
              </p>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="text-slate-400">You are borrowing:</div>
                    <div className="font-medium text-right">
                      {borrowAmount} {borrowAsset}
                    </div>

                    <div className="text-slate-400">You are providing:</div>
                    <div className="font-medium text-right">
                      {collateralAmount} {collateralAsset}
                    </div>

                    <div className="text-slate-400">Loan term:</div>
                    <div className="font-medium text-right">{loanTerm} days</div>

                    <div className="text-slate-400">Collateralization ratio:</div>
                    <div className="font-medium text-right">{collateralizationRatio}%</div>

                    <div className="text-slate-400">Interest rate:</div>
                    <div className="font-medium text-right">{interestRate.toFixed(2)}% APR</div>

                    <div className="text-slate-400">Health factor:</div>
                    <div className={`font-medium text-right ${getHealthColor()}`}>
                      {healthFactor.toFixed(2)} ({getHealthLabel()})
                    </div>

                    <div className="text-slate-400">Liquidation price:</div>
                    <div className="font-medium text-right">
                      ${liquidationPrice.toFixed(2)} per {collateralAsset}
                    </div>

                    <div className="text-slate-400">Transaction fee:</div>
                    <div className="font-medium text-right">{formatCurrency(borrowValue * 0.001)}</div>
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="text-slate-400">Total to repay:</div>
                    <div className="font-medium text-right">
                      {borrowAmount} {borrowAsset} + interest
                    </div>

                    <div className="text-slate-400">Due date:</div>
                    <div className="font-medium text-right">
                      {new Date(Date.now() + Number.parseInt(loanTerm) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {isConfirmStep ? (
            <>
              <Button type="button" variant="outline" onClick={() => setIsConfirmStep(false)}>
                Back
              </Button>
              <Button type="submit" className="web3-button">
                Confirm Loan
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="web3-button"
                disabled={!borrowAsset || !borrowAmount || !collateralAsset || !collateralAmount || healthFactor < 1}
              >
                Review Loan
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
