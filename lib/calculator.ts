import catalog from './products'
import {
  PricingRequest,
  PricingResponse,
  PricingBreakdownItem,
  Product,
  SeasonalRule,
} from './types'

const CENTS_PER_DOLLAR = 100

function getApplicableSeasonalRule(productId: string, month: number): SeasonalRule | undefined {
  return catalog.seasonalRules.find(
    (r) => r.productId === productId && month >= r.monthStart && month <= r.monthEnd
  )
}

function getEffectiveRate(product: Product, checkInMonth: number): number {
  const rule = getApplicableSeasonalRule(product.id, checkInMonth)
  if (rule) return Math.round(product.rateMinor * rule.multiplier)
  return product.rateMinor
}

export function calculatePricing(req: PricingRequest): PricingResponse {
  const breakdown: PricingBreakdownItem[] = []
  const checkoutMonth = req.checkIn ? new Date(req.checkIn).getMonth() + 1 : new Date().getMonth() + 1

  // ── 1. Calculate each line item ──────────────
  let subtotalMinor = 0

  for (const item of req.items) {
    const product = catalog.products.find((p) => p.id === item.productId)
    if (!product) {
      return {
        ok: false,
        currency: 'usd',
        breakdown: [],
        subtotalMinor: 0,
        taxesFeesMinor: 0,
        totalMinor: 0,
        depositRequiredMinor: 0,
        error: `Unknown product: ${item.productId}`,
      }
    }
    if (item.quantity < 1) {
      return {
        ok: false,
        currency: 'usd',
        breakdown: [],
        subtotalMinor: 0,
        taxesFeesMinor: 0,
        totalMinor: 0,
        depositRequiredMinor: 0,
        error: `Invalid quantity for ${item.productId}: ${item.quantity}`,
      }
    }

    const rate = item.customRateMinor ?? getEffectiveRate(product, checkoutMonth)
    const lineTotal = rate * item.quantity
    subtotalMinor += lineTotal

    const rule = item.customRateMinor
      ? undefined
      : getApplicableSeasonalRule(product.id, checkoutMonth)
    const detailParts = [
      item.customRateMinor
        ? `$${(rate / CENTS_PER_DOLLAR).toFixed(2)}/unit (custom)`
        : `$${(rate / CENTS_PER_DOLLAR).toFixed(2)}/${product.unit}`,
      `× ${item.quantity}`,
    ]
    if (rule) detailParts.push(`(${rule.label} ×${rule.multiplier})`)

    breakdown.push({
      label: product.name,
      amountMinor: lineTotal,
      detail: detailParts.join(' '),
      category: product.category,
    })
  }

  // ── 2. Apply promo code ──────────────────────
  let discountMinor = 0
  let discountLabel = ''

  if (req.promoCode) {
    const promo = catalog.promoCodes[req.promoCode.toUpperCase()]
    if (promo && (!promo.minTotalMinor || subtotalMinor >= promo.minTotalMinor)) {
      if (promo.type === 'percent') {
        discountMinor = Math.round(subtotalMinor * (promo.value / 100))
      } else {
        discountMinor = promo.value
      }
      discountLabel = `Discount (${req.promoCode.toUpperCase()})`
      breakdown.push({
        label: discountLabel,
        amountMinor: -discountMinor,
        detail: `-$${(discountMinor / CENTS_PER_DOLLAR).toFixed(2)}`,
        category: 'upsell',
      })
    }
  }

  const subtotalAfterDiscount = subtotalMinor - discountMinor

  // ── 3. Calculate taxes & fees ────────────────
  let taxesFeesMinor = 0

  for (const taxRule of catalog.taxRules) {
    // Find which categories in this request are taxable
    const taxableCategories = req.items
      .map((i) => i.type)
      .filter((t) => taxRule.appliesTo.includes(t))
    const uniqueCategories = [...new Set(taxableCategories)]

    // Calculate tax base: sum of line items in applicable categories
    const taxBase = breakdown
      .filter((b) => uniqueCategories.includes(b.category) && b.label !== discountLabel)
      .reduce((sum, b) => sum + b.amountMinor, 0)

    // Cap at subtotal after discount (don't double-tax discounts)
    const effectiveBase = Math.max(0, Math.min(taxBase, subtotalAfterDiscount))

    if (effectiveBase > 0) {
      const taxAmount = Math.round(effectiveBase * (taxRule.percent / 100))
      taxesFeesMinor += taxAmount
      breakdown.push({
        label: taxRule.label,
        amountMinor: taxAmount,
        detail: `${taxRule.percent}% of ${uniqueCategories.join(', ')}`,
        category: 'accommodation', // taxes get bundled into subtotal category
      })
    }
  }

  // ── 4. Totals ────────────────────────────────
  const totalMinor = subtotalAfterDiscount + taxesFeesMinor

  // ── 5. Deposit calculation ───────────────────
  let depositRequiredMinor = 0
  for (const item of req.items) {
    const product = catalog.products.find((p) => p.id === item.productId)
    if (product?.requiresDeposit && product.depositPercent > 0) {
      const rate = item.customRateMinor ?? getEffectiveRate(product, checkoutMonth)
      depositRequiredMinor += Math.round((rate * item.quantity) * (product.depositPercent / 100))
    }
  }

  return {
    ok: true,
    currency: 'usd',
    breakdown,
    subtotalMinor: subtotalAfterDiscount,
    taxesFeesMinor,
    totalMinor,
    depositRequiredMinor,
  }
}