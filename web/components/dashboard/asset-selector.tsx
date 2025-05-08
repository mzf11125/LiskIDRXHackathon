"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAccount } from "wagmi"
import { useConnectModal } from "@xellar/kit"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useSecureXellarApi } from "@/components/xellar-hooks"

export function AssetSelector() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { getAssets, isLoading } = useSecureXellarApi()
  const [assets, setAssets] = useState([
    { id: "eth", name: "Ethereum (ETH)", balance: "5.2", price: "$3,245.78", collateralFactor: "75%" },
    { id: "usdc", name: "USD Coin (USDC)", balance: "10,000", price: "$1.00", collateralFactor: "80%" },
    { id: "wbtc", name: "Wrapped Bitcoin (WBTC)", balance: "0.25", price: "$63,245.12", collateralFactor: "70%" },
  ])
  const [selectedAsset, setSelectedAsset] = useState(assets[0])

  useEffect(() => {
    if (isConnected) {
      // Fetch assets using our secure API
      const fetchAssets = async () => {
        try {
          const fetchedAssets = await getAssets()
          // If the API returns assets, update the state
          if (fetchedAssets && Array.isArray(fetchedAssets)) {
            setAssets(fetchedAssets)
            setSelectedAsset(fetchedAssets[0])
          }
        } catch (error) {
          console.error("Failed to fetch assets:", error)
          // Keep using the default assets
        }
      }

      fetchAssets()
    }
  }, [isConnected, getAssets])

  const handleAssetChange = (value: string) => {
    const asset = assets.find((a) => a.id === value)
    if (asset) {
      setSelectedAsset(asset)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Asset</CardTitle>
          <CardDescription>Choose a crypto asset for your loan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-40">
          <p className="text-sm text-muted-foreground text-center mb-4">Connect your wallet to select assets</p>
          <Button
            onClick={openConnectModal}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
          >
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Asset</CardTitle>
        <CardDescription>Choose a crypto asset for your loan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select defaultValue={selectedAsset.id} onValueChange={handleAssetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5">
                      <Image src="/placeholder.svg?height=20&width=20" alt={asset.name} fill className="rounded-full" />
                    </div>
                    <span>{asset.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Available Balance</span>
              <span className="text-sm font-medium">
                {selectedAsset.balance} {selectedAsset.id.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Price</span>
              <span className="text-sm font-medium">{selectedAsset.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Collateral Factor</span>
              <span className="text-sm font-medium">{selectedAsset.collateralFactor}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
