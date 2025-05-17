import { NextResponse } from 'next/server'
import { pools } from '@/data/mock-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: pools,
      message: 'Pools fetched successfully'
    }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch pools:", error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch pools',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}