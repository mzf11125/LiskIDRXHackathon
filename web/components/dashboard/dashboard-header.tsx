"use client"

import type React from "react"
import { useChainModal, useProfileModal } from "@xellar/kit"
import { Button } from "@/components/ui/button"
import { Settings, User } from "lucide-react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  const { openChainModal } = useChainModal()
  const { openProfileModal } = useProfileModal()

  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <Button variant="outline" size="icon" onClick={openChainModal} title="Switch Network">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={openProfileModal} title="Profile Settings">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
