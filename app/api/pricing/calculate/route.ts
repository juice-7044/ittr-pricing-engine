import { NextRequest, NextResponse } from 'next/server'
import { calculatePricing } from '@/lib/calculator'
import type { PricingRequest } from '@/lib/types'

export const runtime = 'nodejs'

/**
 * POST /api/pricing/calculate
 *
 * Takes a traveler's selections and returns an itemized price quote.
 *
 * Body:
 *   { items: [{ type, productId, quantity, customRateMinor? }],
 *     checkIn?: "2026-12-01",
 *     promoCode?: "WELCOME10" }
 *
 * Response:
 *   { ok, currency, breakdown[], subtotalMinor, taxesFeesMinor,
 *     totalMinor, depositRequiredMinor, error? }
 *
 * All prices in minor units (cents).
 */
export async function POST(request: NextRequest) {
  try {
    const body: PricingRequest = await request.json()

    // ── Validation ──
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'At least one item is required' },
        { status: 400 }
      )
    }

    for (const item of body.items) {
      if (!item.type || !item.productId) {
        return NextResponse.json(
          { ok: false, error: 'Each item must have type and productId' },
          { status: 400 }
        )
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return NextResponse.json(
          { ok: false, error: `Invalid quantity for ${item.productId}` },
          { status: 400 }
        )
      }
    }

    const result = calculatePricing(body)

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