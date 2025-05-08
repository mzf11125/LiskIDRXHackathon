import { NextResponse } from "next/server"

export async function GET() {
  // This endpoint provides a secure way to initialize Xellar without exposing API keys
  // It returns only the necessary information for client-side initialization

  try {
    // You can perform server-side validation or authentication here if needed
    return NextResponse.json({
      success: true,
      appId: process.env.NEXT_PUBLIC_XELLAR_APP_ID,
      // Do NOT return the API key directly
      isConfigured: !!process.env.XELLAR_API_KEY,
    })
  } catch (error) {
    console.error("Xellar auth error:", error)
    return NextResponse.json({ success: false, error: "Failed to initialize Xellar" }, { status: 500 })
  }
}
