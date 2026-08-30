/**
 * ITTR Group — Pricing Calculator
 *
 * Pure deterministic math. No side effects. Same inputs → always same output.
 * All prices in minor units (cents). $100.00 = 10000
 */

const { products, seasonalRules, rentalDiscounts, bundleDiscount, taxRules, promoCodes } = require('./products')

const CENTS = 100

/**
 * Get the applicable seasonal rule for a product on a given date.
 * Holiday (priority 2) > Peak (priority 1) > Off-peak (priority 0)
 */
function getSeasonalRate(productId, checkInDate) {
  if (!checkInDate) return null

  const month = checkInDate.getMonth() + 1
  const day = checkInDate.getDate()

  // Collect all matching rules, sorted by priority descending
  const matching = seasonalRules
    .filter(r => r.productId === productId)
    .filter(r => {
      // Handle month/day ranges that may wrap (e.g. Nov 27 - Dec 1)
      if (r.monthStart === r.monthEnd) {
        // Same month: simple range check
        if (month !== r.monthStart) return false
        if (r.dayEnd >= r.dayStart) return day >= r.dayStart && day <= r.dayEnd
        // Wrapping within same month shouldn't happen, but handle it
        return day >= r.dayStart || day <= r.dayEnd
      }

      // Multi-month range
      const monthNum = r.monthStart === 12 && r.monthEnd === 1
        ? (month === 12 ? 12 : (month === 1 ? 13 : -1)) // Handle Dec-Jan wrap
        : month

      const startNum = r.monthStart
      const endNum = r.monthEnd + (r.monthEnd < r.monthStart ? 12 : 0)

      if (monthNum < startNum || monthNum > endNum) return false

      // First month: day >= dayStart; Last month: day <= dayEnd; Mid months: always in range
      if (month === r.monthStart && day < r.dayStart) return false
      if (month === r.monthEnd && day > r.dayEnd) return false

      return true
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))

  return matching.length > 0 ? matching[0] : null
}

function getEffectiveRate(product, checkInDate) {
  const rule = getSeasonalRate(product.id, checkInDate)
  if (rule) {
    if (rule.overrideRateMinor) return rule.overrideRateMinor
    return Math.round(product.rateMinor * rule.multiplier)
  }
  return product.rateMinor
}

/**
 * @param {object} req
 * @param {Array<{type:string, productId:string, quantity:number, customRateMinor?:number}>} req.items
 * @param {string} [req.checkIn]  ISO date string, e.g. "2026-12-01"
 * @param {string} [req.promoCode]
 */
function calculatePricing(req) {
  const breakdown = []
  const checkInDate = req.checkIn ? new Date(req.checkIn) : new Date()

  // ── 1. Validate items ──
  if (!req.items || !Array.isArray(req.items) || req.items.length === 0) {
    return { ok: false, currency: 'usd', breakdown: [], subtotalMinor: 0, taxesFeesMinor: 0, totalMinor: 0, depositRequiredMinor: 0, error: 'At least one item is required' }
  }

  for (const item of req.items) {
    if (!item.type || !item.productId) {
      return { ok: false, currency: 'usd', breakdown: [], subtotalMinor: 0, taxesFeesMinor: 0, totalMinor: 0, depositRequiredMinor: 0, error: 'Each item must have type and productId' }
    }
    if (typeof item.quantity !== 'number' || item.quantity < 1) {
      return { ok: false, currency: 'usd', breakdown: [], subtotalMinor: 0, taxesFeesMinor: 0, totalMinor: 0, depositRequiredMinor: 0, error: `Invalid quantity for ${item.productId}: ${item.quantity}` }
    }
  }

  // ── 2. Check for items that require human escalation ──
  const humanItems = req.items.filter(item => {
    const product = products.find(p => p.id === item.productId)
    return product && product.escalateToHuman
  })
  if (humanItems.length > 0) {
    return {
      ok: false,
      currency: 'usd',
      breakdown: [],
      subtotalMinor: 0,
      taxesFeesMinor: 0,
      totalMinor: 0,
      depositRequiredMinor: 0,
      error: `Human escalation required for: ${humanItems.map(i => {
        const p = products.find(pr => pr.id === i.productId)
        return p ? p.name : i.productId
      }).join(', ')}. Please contact a concierge for a custom quote.`,
      escalateToHuman: true,
      humanItemNames: humanItems.map(i => {
        const p = products.find(pr => pr.id === i.productId)
        return p ? p.name : i.productId
      }),
    }
  }

  // ── 3. Calculate each line item ──
  let subtotalMinor = 0
  const lineTotals = [] // track for bundle/tax calculations

  for (const item of req.items) {
    const product = products.find(p => p.id === item.productId)
    if (!product) {
      return { ok: false, currency: 'usd', breakdown: [], subtotalMinor: 0, taxesFeesMinor: 0, totalMinor: 0, depositRequiredMinor: 0, error: `Unknown product: ${item.productId}` }
    }

    const rate = item.customRateMinor || getEffectiveRate(product, checkInDate)
    const lineTotal = rate * item.quantity
    subtotalMinor += lineTotal

    // Apply length-based rental discounts (vehicles only — weekly/monthly)
    let discountAmount = 0
    let discountLabel = ''
    if (product.category === 'car') {
      const discount = rentalDiscounts.find(d => item.quantity >= d.minDays && item.quantity <= d.maxDays)
      if (discount) {
        discountAmount = Math.round(lineTotal * (discount.discountPercent / 100))
        discountLabel = discount.label
      }
    }

    const rule = item.customRateMinor ? null : getSeasonalRate(product.id, checkInDate)
    const parts = [
      product.category === 'accommodation' ? `$${(rate / CENTS).toFixed(2)}/night` :
        product.category === 'car' ? `$${(rate / CENTS).toFixed(2)}/day` :
        `$${(rate / CENTS).toFixed(2)}`,
      `× ${item.quantity} ${product.unit === 'nightly' ? 'nights' : product.unit === 'daily' ? 'days' : ''}`,
    ]
    if (rule) parts.push(`(${rule.label})`)

    const afterDiscount = lineTotal - discountAmount
    lineTotals.push({ category: product.category, amount: afterDiscount })

    breakdown.push({
      label: product.name,
      amountMinor: afterDiscount,
      detail: parts.join(' '),
      category: product.category,
    })

    // Add promo code info if present (for UI display)
    if (req.promoCode) {
      // We'll apply promo at the end
    }
  }

  // ── 4. Bundle discount (accommodation + vehicle = 15% off vehicle) ──
  const hasAccommodation = req.items.some(i => i.type === 'accommodation')
  const hasCar = req.items.some(i => i.type === 'car')
  let bundleDiscountAmount = 0

  if (hasAccommodation && hasCar) {
    // Find the vehicle line items and apply 15% off
    for (const item of req.items) {
      const product = products.find(p => p.id === item.productId)
      if (product && product.category === 'car') {
        const rate = item.customRateMinor || getEffectiveRate(product, checkInDate)
        const lineTotal = rate * item.quantity
        // Apply length discount first, then bundle discount on top
        const discount = rentalDiscounts.find(d => item.quantity >= d.minDays && item.quantity <= d.maxDays)
        const afterLengthDiscount = lineTotal - (discount ? Math.round(lineTotal * (discount.discountPercent / 100)) : 0)
        const bundleOn = Math.round(afterLengthDiscount * (bundleDiscount.discountPercent / 100))
        bundleDiscountAmount += bundleOn
      }
    }

    if (bundleDiscountAmount > 0) {
      breakdown.push({
        label: bundleDiscount.label,
        amountMinor: -bundleDiscountAmount,
        detail: `-$${(bundleDiscountAmount / CENTS).toFixed(2)} (15% off vehicle)`,
        category: 'upsell',
      })
    }
  }

  const subtotalBeforePromo = subtotalMinor - bundleDiscountAmount

  // ── 5. Apply promo code ──
  let promoDiscountMinor = 0
  let promoLabel = ''
  if (req.promoCode) {
    const promo = promoCodes[req.promoCode.toUpperCase()]
    if (promo && (!promo.minTotalMinor || subtotalBeforePromo >= promo.minTotalMinor)) {
      promoDiscountMinor = promo.type === 'percent'
        ? Math.round(subtotalBeforePromo * (promo.value / 100))
        : promo.value
      promoLabel = `Discount (${req.promoCode.toUpperCase()})`
      breakdown.push({
        label: promoLabel,
        amountMinor: -promoDiscountMinor,
        detail: `-$${(promoDiscountMinor / CENTS).toFixed(2)}`,
        category: 'upsell',
      })
    }
  }

  const subtotalAfterAll = subtotalBeforePromo - promoDiscountMinor

  // ── 6. Calculate taxes & fees ──
  let taxesFeesMinor = 0
  for (const taxRule of taxRules) {
    const taxableCategories = [...new Set(req.items.map(i => i.type).filter(t => taxRule.appliesTo.includes(t)))]
    const taxBase = breakdown
      .filter(b => taxableCategories.includes(b.category) && !b.label.includes('Discount'))
      .reduce((s, b) => s + Math.max(0, b.amountMinor), 0)
    const effectiveBase = Math.max(0, Math.min(taxBase, subtotalAfterAll))
    if (effectiveBase > 0) {
      const taxAmount = Math.round(effectiveBase * (taxRule.percent / 100))
      taxesFeesMinor += taxAmount
      breakdown.push({
        label: taxRule.label,
        amountMinor: taxAmount,
        detail: `${taxRule.percent}% of ${taxableCategories.join(', ')}`,
        category: 'accommodation',
      })
    }
  }

  // ── 7. Deposit calculation ──
  let depositRequiredMinor = 0
  for (const item of req.items) {
    const product = products.find(p => p.id === item.productId)
    if (product && product.requiresDeposit && product.depositPercent > 0) {
      const rate = item.customRateMinor || getEffectiveRate(product, checkInDate)
      depositRequiredMinor += Math.round((rate * item.quantity) * (product.depositPercent / 100))
    }
  }
  // Add security deposits for cars (these are holds, not charges)
  const securityDepositMinor = req.items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product?.securityDepositMinor || 0)
  }, 0)

  // ── 8. Smoking/penalty notes ──
  const smokingViolationMinor = req.items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product?.smokingViolationMinor || 0)
  }, 0)

  const notes = []
  if (securityDepositMinor > 0) {
    notes.push(`Refundable security deposit: $${(securityDepositMinor / CENTS).toFixed(2)} (hold only, released 3-7 days after return)`)
  }
  if (smokingViolationMinor > 0) {
    notes.push(`Smoking violation penalty: $${(smokingViolationMinor / CENTS).toFixed(2)}`)
  }

  return {
    ok: true,
    currency: 'usd',
    breakdown,
    subtotalMinor: subtotalAfterAll,
    taxesFeesMinor,
    totalMinor: subtotalAfterAll + taxesFeesMinor,
    depositRequiredMinor,
    securityDepositMinor,
    notes: notes.length > 0 ? notes : undefined,
  }
}

module.exports = { calculatePricing }