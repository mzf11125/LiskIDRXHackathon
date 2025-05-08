"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"

export function XellarDebug() {
  const [config, setConfig] = useState<{ appId: string | null; hasAppId: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/xellar-config")
        const data = await response.json()
        setConfig(data)
      } catch (err) {
        setError("Failed to fetch Xellar configuration")
        console.error("Error fetching Xellar config:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Xellar Configuration Debug</CardTitle>
        <CardDescription>Check if your Xellar configuration is properly set up</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading configuration...</p>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className={config?.hasAppId ? "text-green-500" : "text-red-500"}>
                {config?.hasAppId ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-medium">App ID</p>
                <p className="text-sm text-muted-foreground">
                  {config?.hasAppId
                    ? `Configured: ${config.appId}`
                    : "Not configured. Please add NEXT_PUBLIC_XELLAR_APP_ID to your environment variables."}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Client-side environment variable: {process.env.NEXT_PUBLIC_XELLAR_APP_ID || "Not set"}
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  window.location.reload()
                }}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
