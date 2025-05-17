import { NextResponse } from 'next/server'
import { getAvailableAssetsForBorrower } from '@/data/mock-data'

export const dynamic = 'force-dynamic'

interface AssetsContext {
  params: {
    address: string
    poolId: string
  }
}

export async function GET(request: Request, context: AssetsContext) {
  try {
    const { address, poolId } = context.params
    const assets = getAvailableAssetsForBorrower(address, poolId)

    return NextResponse.json({ 
      success: true, 
      data: assets,
      message: 'Available assets fetched successfully'
    }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch available assets:", error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch available assets',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}