"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Info } from "lucide-react"
import { pools, addUserDeposit } from "@/data/mock-data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const formSchema = z.object({
  asset: z.string({
    required_error: "Please select an asset to deposit.",
  }),
  amount: z.string().min(1, {
    message: "Please enter an amount to deposit.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface DepositAssetFormProps {
  onSuccess: () => void
  preselectedAsset?: string
}

export default function DepositAssetForm({ onSuccess, preselectedAsset }: DepositAssetFormProps) {
  const { toast } = useToast()
  const [isConfirmStep, setIsConfirmStep] = useState(false)

  // Get all available assets from pools
  const allAssets = pools.flatMap((pool) => pool.assets)
    .filter((asset, index, self) => 
      index === self.findIndex((a) => a.symbol === asset.symbol) && asset.supplyEnabled
    )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset: preselectedAsset || "",
      amount: "",
    },
  })

  const selectedAsset = form.watch("asset")
  const amount = form.watch("amount")

  const currentAsset = allAssets.find(asset => asset.symbol === selectedAsset)
  const depositValue = amount && currentAsset 
    ? parseFloat(amount) * parseFloat(currentAsset.price.replace(/[^0-9.-]+/g, ""))
    : 0

  const estimatedAnnualEarnings = amount && currentAsset
    ? parseFloat(amount) * (parseFloat(currentAsset.supplyApr.replace("%", "")) / 100)
    : 0

  function onSubmit(values: FormValues) {
    if (!isConfirmStep) {
      setIsConfirmStep(true)
      return
    }

    // Validate amount against wallet balance
    const asset = allAssets.find(a => a.symbol === values.asset)
    if (!asset) return

    const walletBalance = parseFloat(asset.walletBalance.replace(/,/g, ""))
    const depositAmount = parseFloat(values.amount)

    if (depositAmount > walletBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: `You don't have enough ${values.asset} in your wallet.`,
      })
      return
    }

    // Add the deposit (in a real app, this would be a blockchain transaction)
    addUserDeposit({
      asset: values.asset,
      amount: values.amount,
      apy: asset.supplyApr,
    })

    toast({
      title: "Deposit successful!",
      description: `You have successfully deposited ${values.amount} ${values.asset} and started earning ${asset.supplyApr} APY.`,
    })

    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!isConfirmStep ? (
          <>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset to Deposit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select asset to deposit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {allAssets.map((asset) => (
                          <SelectItem key={asset.symbol} value={asset.symbol}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                                {asset.symbol.charAt(0)}
                              </div>
                              {asset.symbol} - {asset.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedAsset && (
                        <div className="flex items-center gap-2">
                          <span>Earn {currentAsset?.supplyApr} APY</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-slate-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Annual Percentage Yield - the rate you'll earn on your deposit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount to Deposit</FormLabel>
                    <div className="flex gap-2">
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (currentAsset) {
                            field.onChange(currentAsset.walletBalance.replace(/,/g, ""))
                          }
                        }}
                        className="px-3 bg-slate-700 border-slate-600"
                      >
                        Max
                      </Button>
                    </div>
                    <FormDescription>
                      Wallet balance: {currentAsset?.walletBalance || "0.00"} {selectedAsset}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {depositValue > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Deposit Value</span>
                      <span className="font-bold">${depositValue.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current APY</span>
                      <span className="font-bold text-primary">{currentAsset?.supplyApr}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Estimated Annual Earnings</span>
                      <span className="font-bold text-green-500">
                        {estimatedAnnualEarnings.toFixed(2)} {selectedAsset}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Collateral Factor</span>
                      <span className="font-bold">{currentAsset?.collateralFactor}</span>
                    </div>

                    <Separator className="bg-slate-700" />

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>• Interest is calculated and distributed daily</p>
                      <p>• You can withdraw your deposit at any time</p>
                      <p>• This asset can be used as collateral for borrowing</p>
                    </div>
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
                <h3 className="text-lg font-medium text-green-400">Confirm Your Deposit</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Please review the details of your deposit before confirming. Once confirmed, you'll start earning interest immediately.
              </p>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="text-slate-400">You are depositing:</div>
                    <div className="font-medium text-right">
                      {amount} {selectedAsset}
                    </div>

                    <div className="text-slate-400">Deposit value:</div>
                    <div className="font-medium text-right">
                      ${depositValue.toFixed(2)}
                    </div>

                    <div className="text-slate-400">APY:</div>
                    <div className="font-medium text-right text-primary">
                      {currentAsset?.supplyApr}
                    </div>

                    <div className="text-slate-400">Estimated annual earnings:</div>
                    <div className="font-medium text-right text-green-500">
                      {estimatedAnnualEarnings.toFixed(2)} {selectedAsset}
                    </div>

                    <div className="text-slate-400">Can be used as collateral:</div>
                    <div className="font-medium text-right">
                      Up to {currentAsset?.collateralFactor} of value
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
                Confirm Deposit
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
                disabled={!selectedAsset || !amount || parseFloat(amount || "0") <= 0}
              >
                Review Deposit
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
