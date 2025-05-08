import { NextResponse } from "next/server"

export async function GET() {
  // Return only the public environment variables
  return NextResponse.json({
    appId: process.env.NEXT_PUBLIC_XELLAR_APP_ID,
    hasAppId: !!process.env.NEXT_PUBLIC_XELLAR_APP_ID,
    // Do NOT return the API key
    isApiKeyConfigured: !!process.env.XELLAR_API_KEY,
  })
}
