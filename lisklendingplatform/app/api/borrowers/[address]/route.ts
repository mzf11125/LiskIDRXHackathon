import { NextResponse } from 'next/server'
import { getBorrowerByAddress } from '@/data/mock-data'

export const dynamic = 'force-dynamic'

interface BorrowerContext {
  params: {
    address: string
  }
}

export async function GET(request: Request, context: BorrowerContext) {
  try {
    const { address } = context.params
    const borrower = getBorrowerByAddress(address)

    if (!borrower) {
      return NextResponse.json({ 
        success: false, 
        message: 'Borrower not found'
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: borrower,
      message: 'Borrower fetched successfully'
    }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch borrower:", error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch borrower',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}