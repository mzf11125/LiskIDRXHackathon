"use client"

import { ConnectButton } from "@xellar/kit"
import { useConnectModal } from "@xellar/kit"
import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { toast } = useToast()

  // Use the built-in ConnectButton component
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <Button onClick={openChainModal} variant="outline" size="sm" className="hidden md:flex">
                    {chain.name}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-emerald-500/50">
                        <Wallet className="mr-2 h-4 w-4 text-emerald-500" />
                        {account.displayName}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(account.address)
                          toast({
                            title: "Address Copied",
                            description: "Wallet address copied to clipboard",
                          })
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Address
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(`https://etherscan.io/address/${account.address}`, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Etherscan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={openAccountModal}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
