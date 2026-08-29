// ── All prices in minor units (cents) ── //

export type ItemCategory = 'accommodation' | 'car' | 'upsell' | 'concierge'

export interface Product {
  id: string
  category: ItemCategory
  name: string
  description: string
  /** Price per unit (daily, nightly, per_booking, per_person) */
  rateMinor: number
  unit: 'daily' | 'nightly' | 'per_booking' | 'per_person'
  requiresDeposit: boolean
  depositPercent: number // 0-100
}

export interface SeasonalRule {
  productId: string
  monthStart: number  // 1–12
  monthEnd: number    // 1–12
  multiplier: number  // e.g. 1.3 = +30%
  label: string
}

export interface TaxRule {
  id: string
  label: string
  /** percent of subtotal (e.g. 10 = 10%) */
  percent: number
  /** Only apply to certain categories */
  appliesTo: ItemCategory[]
}

export interface PricingRequest {
  items: PricingLineItem[]
  /** ISO date string, e.g. "2026-12-01" */
  checkIn?: string
  promoCode?: string | null
}

export interface PricingLineItem {
  type: ItemCategory
  productId: string
  /** Number of units (days, nights, quantity) */
  quantity: number
  /** Optional override (e.g. quoted rate not in catalog) */
  customRateMinor?: number
}

export interface PricingBreakdownItem {
  label: string
  amountMinor: number
  detail: string
  category: ItemCategory
}

export interface PricingResponse {
  ok: boolean
  currency: string
  breakdown: PricingBreakdownItem[]
  subtotalMinor: number
  taxesFeesMinor: number
  totalMinor: number
  depositRequiredMinor: number
  error?: string
}

export interface ProductCatalog {
  products: Product[]
  seasonalRules: SeasonalRule[]
  taxRules: TaxRule[]
  promoCodes: Record<string, { type: 'percent' | 'flat'; value: number; minTotalMinor?: number }>
}