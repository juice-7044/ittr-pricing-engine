import { products, seasonalRules, rentalDiscounts, bundleDiscount, taxRules, promoCodes } from './products'
import type { Product } from './products'

export interface PricingLineItem {
  type: string; productId: string; quantity: number; customRateMinor?: number
}
export interface PricingRequest {
  items: PricingLineItem[]; checkIn?: string; promoCode?: string | null
}
export interface PricingBreakdownItem {
  label: string; amountMinor: number; detail: string; category: string
}
export interface PricingResponse {
  ok: boolean; currency: string; breakdown: PricingBreakdownItem[];
  subtotalMinor: number; taxesFeesMinor: number; totalMinor: number;
  depositRequiredMinor: number; securityDepositMinor?: number;
  notes?: string[]; error?: string; escalateToHuman?: boolean; humanItemNames?: string[]
}

const CENTS = 100

function getSeasonalRate(productId: string, checkIn: Date) {
  const month = checkIn.getMonth() + 1
  const day = checkIn.getDate()
  const matching = seasonalRules
    .filter(r => r.productId === productId)
    .filter(r => {
      if (r.monthStart === r.monthEnd) {
        if (month !== r.monthStart) return false
        if (r.dayEnd >= r.dayStart) return day >= r.dayStart && day <= r.dayEnd
        return day >= r.dayStart || day <= r.dayEnd
      }
      if (r.monthStart === 12 && r.monthEnd === 1) {
        const m = month === 12 ? 12 : (month === 1 ? 13 : -1)
        if (m < r.monthStart || m > (r.monthEnd + 12)) return false
        if (month === 12 && day < r.dayStart) return false
        if (month === 1 && day > r.dayEnd) return false
        return true
      }
      if (month < r.monthStart || month > r.monthEnd) return false
      if (month === r.monthStart && day < r.dayStart) return false
      if (month === r.monthEnd && day > r.dayEnd) return false
      return true
    })
    .sort((a, b) => b.priority - a.priority)
  return matching[0] ?? null
}

function getEffectiveRate(product: Product, checkIn: Date | null): number {
  if (!checkIn) return product.rateMinor
  const rule = getSeasonalRate(product.id, checkIn)
  return rule ? Math.round(product.rateMinor * rule.multiplier) : product.rateMinor
}

export function calculatePricing(req: PricingRequest): PricingResponse {
  const breakdown: PricingBreakdownItem[] = []
  const checkInDate = req.checkIn ? new Date(req.checkIn) : new Date()

  if (!req.items?.length) {
    return { ok: false, currency: 'usd', breakdown: [], subtotalMinor: 0, taxesFeesMinor: 0, totalMinor: 0, depositRequiredMinor: 0, error: 'At least one item is required' }
  }

  for (const item of req.items) {
    if (!item.type || !item.productId) return { ok: false, currency: 'usd', breakdown: [], subtotalMinor: 0, taxesFeesMinor: 0, totalMinor: 0, depositRequiredMinor: 0, error: 'Each item must have type and productId' }
    if (item.quantity < 1) return { ok: false, currency: 'usd', breakdown: [], subtotalMinor: 0, taxesFeesMinor: 0, totalMinor: 0, depositRequiredMinor: 0, error: `Invalid quantity for ${item.productId}` }
  }

  // Human escalation check
  const humanItems = req.items.filter(i => products.find(p => p.id === i.productId)?.escalateToHuman)
  if (humanItems.length > 0) {
    return { ok: false, currency: 'usd', breakdown: [], subtotalMinor: 0, taxesFeesMinor: 0, totalMinor: 0, depositRequiredMinor: 0, error: `Human escalation required for: ${humanItems.map(i => { const p = products.find(pr => pr.id === i.productId); return p ? p.name : i.productId }).join(', ')}. Please contact a concierge for a custom quote.`, escalateToHuman: true, humanItemNames: humanItems.map(i => { const p = products.find(pr => pr.id === i.productId); return p ? p.name : i.productId }) }
  }

  // Calculate line items
  let subtotalMinor = 0
  for (const item of req.items) {
    const product = products.find(p => p.id === item.productId)
    if (!product) return { ok: false, currency: 'usd', breakdown: [], subtotalMinor: 0, taxesFeesMinor: 0, totalMinor: 0, depositRequiredMinor: 0, error: `Unknown product: ${item.productId}` }

    const rate = item.customRateMinor ?? getEffectiveRate(product, checkInDate)
    const lineTotal = rate * item.quantity
    subtotalMinor += lineTotal

    let discountAmount = 0
    let discountLabel = ''
    if (product.category === 'car') {
      const disc = rentalDiscounts.find(d => item.quantity >= d.minDays && item.quantity <= d.maxDays)
      if (disc) { discountAmount = Math.round(lineTotal * (disc.discountPercent / 100)); discountLabel = disc.label }
    }

    const rule = seasonalRules.length > 0 && !item.customRateMinor ? getSeasonalRate(product.id, checkInDate) : null
    const parts = [
      `$${(rate / CENTS).toFixed(2)}/${product.unit === 'nightly' ? 'night' : product.unit === 'daily' ? 'day' : product.unit}`,
      `× ${item.quantity}`,
    ]
    if (rule) parts.push(`(${rule.label})`)

    const afterDiscount = lineTotal - discountAmount
    breakdown.push({ label: product.name, amountMinor: afterDiscount, detail: parts.join(' '), category: product.category })
  }

  // Bundle discount
  const hasAccommodation = req.items.some(i => i.type === 'accommodation')
  const hasCar = req.items.some(i => i.type === 'car')
  let bundleAmount = 0
  if (hasAccommodation && hasCar) {
    for (const item of req.items) {
      const product = products.find(p => p.id === item.productId)
      if (product?.category === 'car') {
        const rate = item.customRateMinor ?? getEffectiveRate(product, checkInDate)
        const lineTotal = rate * item.quantity
        const disc = rentalDiscounts.find(d => item.quantity >= d.minDays && item.quantity <= d.maxDays)
        const afterLength = lineTotal - (disc ? Math.round(lineTotal * (disc.discountPercent / 100)) : 0)
        bundleAmount += Math.round(afterLength * (bundleDiscount.discountPercent / 100))
      }
    }
    if (bundleAmount > 0) breakdown.push({ label: bundleDiscount.label, amountMinor: -bundleAmount, detail: `-$${(bundleAmount / CENTS).toFixed(2)} (15% off vehicle)`, category: 'upsell' })
  }

  let subtotalAfter = subtotalMinor - bundleAmount

  // Promo code
  let promoDiscount = 0
  if (req.promoCode) {
    const promo = promoCodes[req.promoCode.toUpperCase()]
    if (promo && (!promo.minTotalMinor || subtotalAfter >= promo.minTotalMinor)) {
      promoDiscount = promo.type === 'percent' ? Math.round(subtotalAfter * (promo.value / 100)) : promo.value
      breakdown.push({ label: `Discount (${req.promoCode.toUpperCase()})`, amountMinor: -promoDiscount, detail: `-$${(promoDiscount / CENTS).toFixed(2)}`, category: 'upsell' })
    }
  }
  subtotalAfter -= promoDiscount

  // Taxes
  let taxesFeesMinor = 0
  for (const taxRule of taxRules) {
    const cats = [...new Set(req.items.map(i => i.type).filter(t => taxRule.appliesTo.includes(t)))]
    const taxBase = breakdown.filter(b => cats.includes(b.category) && !b.label.includes('Discount')).reduce((s, b) => s + Math.max(0, b.amountMinor), 0)
    const base = Math.max(0, Math.min(taxBase, subtotalAfter))
    if (base > 0) { const amt = Math.round(base * (taxRule.percent / 100)); taxesFeesMinor += amt; breakdown.push({ label: taxRule.label, amountMinor: amt, detail: `${taxRule.percent}% of ${cats.join(', ')}`, category: 'accommodation' }) }
  }

  // Deposits
  let depositRequiredMinor = 0
  for (const item of req.items) {
    const product = products.find(p => p.id === item.productId)
    if (product?.requiresDeposit && product.depositPercent > 0) {
      const rate = item.customRateMinor ?? getEffectiveRate(product, checkInDate)
      depositRequiredMinor += Math.round((rate * item.quantity) * (product.depositPercent / 100))
    }
  }

  const securityDepositMinor = req.items.reduce((s, i) => s + (products.find(p => p.id === i.productId)?.securityDepositMinor ?? 0), 0)
  const smokingViolationMinor = req.items.reduce((s, i) => s + (products.find(p => p.id === i.productId)?.smokingViolationMinor ?? 0), 0)

  const notes: string[] = []
  if (securityDepositMinor > 0) notes.push(`Refundable security deposit: $${(securityDepositMinor / CENTS).toFixed(2)} (hold only, released 3-7 days after return)`)
  if (smokingViolationMinor > 0) notes.push(`Smoking violation penalty: $${(smokingViolationMinor / CENTS).toFixed(2)}`)

  return { ok: true, currency: 'usd', breakdown, subtotalMinor: subtotalAfter, taxesFeesMinor, totalMinor: subtotalAfter + taxesFeesMinor, depositRequiredMinor, securityDepositMinor, notes: notes.length ? notes : undefined }
}