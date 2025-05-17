import { NextResponse } from 'next/server'
import { borrowers } from '@/data/mock-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: borrowers,
      message: 'Borrowers fetched successfully'
    }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch borrowers:", error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch borrowers',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}