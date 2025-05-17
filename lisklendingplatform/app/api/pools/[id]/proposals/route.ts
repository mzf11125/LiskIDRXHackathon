import { NextResponse } from 'next/server'
import { getPoolById } from '@/data/mock-data'

export const dynamic = 'force-dynamic'

interface PoolContext {
  params: {
    id: string
  }
}

export async function GET(request: Request, context: PoolContext) {
  try {
    const { id } = context.params
    const pool = getPoolById(id)

    if (!pool) {
      return NextResponse.json({ 
        success: false, 
        message: 'Pool not found'
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: pool.proposals || [],
      message: 'Pool proposals fetched successfully'
    }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch pool proposals:", error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch pool proposals',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}