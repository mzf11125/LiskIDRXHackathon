import { NextResponse } from 'next/server'
import { getEligiblePoolsForBorrower } from '@/data/mock-data'

export const dynamic = 'force-dynamic'

interface BorrowerContext {
  params: {
    address: string
  }
}

export async function GET(request: Request, context: BorrowerContext) {
  try {
    const { address } = context.params
    const eligiblePools = getEligiblePoolsForBorrower(address)

    return NextResponse.json({ 
      success: true, 
      data: eligiblePools,
      message: 'Eligible pools fetched successfully'
    }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch eligible pools:", error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch eligible pools',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}