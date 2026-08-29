import { NextRequest, NextResponse } from 'next/server'
import { calculatePricing } from '@/lib/calculator'
import type { PricingRequest } from '@/lib/calculator'

export const runtime = 'nodejs'

/**
 * POST /api/pricing/calculate
 *
 * Takes a traveler's selections and returns an itemized price quote.
 * All prices in minor units (cents).
 */
export async function POST(request: NextRequest) {
  try {
    const body: PricingRequest & { items?: Array<Record<string, unknown>> } = await request.json()

    // ── Validation ──
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'At least one item is required' },
        { status: 400 }
      )
    }

    // Normalize items: GHL may send numbers as strings
    const normalizedItems = body.items.map((item) => ({
      type: String(item.type || ''),
      productId: String(item.productId || ''),
      quantity: typeof item.quantity === 'number' ? item.quantity : Number(item.quantity) || 0,
      customRateMinor: item.customRateMinor ? Number(item.customRateMinor) : undefined,
    }))

    for (const item of normalizedItems) {
      if (!item.type || !item.productId) {
        return NextResponse.json(
          { ok: false, error: 'Each item must have type and productId' },
          { status: 400 }
        )
      }
      if (item.quantity < 1) {
        return NextResponse.json(
          { ok: false, error: `Invalid quantity for ${item.productId}: ${item.quantity}` },
          { status: 400 }
        )
      }
    }

    const result = calculatePricing({
      items: normalizedItems,
      checkIn: body.checkIn,
      promoCode: body.promoCode,
    })

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    )
  }
}