/**
 * ITTR Group — Product Catalog
 *
 * All prices in minor units (cents).
 * $100.00 = 10000
 *
 * ⚠️ DO NOT QUOTE upsells marked "escalate_to_human"
 *    Those are sample prices — always route to a human agent.
 */

const products = [
  // ── ACCOMMODATIONS ──
  {
    id: 'middleton-manor',
    category: 'accommodation',
    name: 'Middleton Manor',
    description: '8 guests · 3BR townhouse · 3 beds · 3.5 baths · Luxury smart home in Houston\'s Museum District. Tesla EV charger, private garage, dedicated workspace. Ideal for medical stays, professionals, families, relocations.',
    rateMinor: 29900,       // $299/night
    unit: 'nightly',
    requiresDeposit: true,
    depositPercent: 25,
    smokingViolationMinor: 50000,  // $500 smoking violation
    maxGuests: 8,
    allowBundles: true,
  },

  // ── VEHICLES ──
  {
    id: 'car-noir-1',
    category: 'car',
    name: 'Noir 1 · 2027 Kia Telluride Hybrid',
    description: 'Luxury 3-row SUV hybrid. Perfect for families and groups.',
    rateMinor: 12000,       // $120/day
    unit: 'daily',
    requiresDeposit: true,
    depositPercent: 100,    // $500 refundable security deposit (separate line)
    securityDepositMinor: 50000,
    rimDamageMinor: 50000,  // $500 per rim
    smokingViolationMinor: 50000,
  },
  {
    id: 'car-luna-2',
    category: 'car',
    name: 'Luna 2 · 2026 Tesla White Premium',
    description: 'Premium white Tesla — electric, sleek, zero emissions.',
    rateMinor: 8900,        // $89/day
    unit: 'daily',
    requiresDeposit: true,
    depositPercent: 100,
    securityDepositMinor: 50000,
    rimDamageMinor: 50000,
    smokingViolationMinor: 50000,
  },
  {
    id: 'car-nova-3',
    category: 'car',
    name: 'Nova 3 · Black 2026 Tesla Dual Motor',
    description: 'Black Tesla Dual Motor — all-wheel drive, premium experience.',
    rateMinor: 8900,        // $89/day
    unit: 'daily',
    requiresDeposit: true,
    depositPercent: 100,
    securityDepositMinor: 50000,
    rimDamageMinor: 50000,
    smokingViolationMinor: 50000,
  },
  {
    id: 'car-orion-4',
    category: 'car',
    name: 'Orion 4 · 2026 Buick Envista ST',
    description: 'Stylish compact SUV — comfortable and efficient.',
    rateMinor: 7100,        // $71/day
    unit: 'daily',
    requiresDeposit: true,
    depositPercent: 100,
    securityDepositMinor: 50000,
    rimDamageMinor: 50000,
    smokingViolationMinor: 50000,
  },
  {
    id: 'car-twilight-5',
    category: 'car',
    name: 'Twilight 5 · Black 2026 Nissan Kicks SR',
    description: 'Compact crossover — budget-friendly and reliable.',
    rateMinor: 6100,        // $61/day
    unit: 'daily',
    requiresDeposit: true,
    depositPercent: 100,
    securityDepositMinor: 50000,
    rimDamageMinor: 50000,
    smokingViolationMinor: 50000,
  },

  // ── CAR ADD-ONS ──
  {
    id: 'car-ev-charging',
    category: 'upsell',
    name: 'EV Charging Fee (daily)',
    description: 'Daily electric vehicle charging at the property.',
    rateMinor: 1500,        // $15/day
    unit: 'daily',
    requiresDeposit: false,
    depositPercent: 0,
  },
  {
    id: 'car-refueling',
    category: 'upsell',
    name: 'Refueling Service',
    description: 'Convenience fee — we fill the tank before your return.',
    rateMinor: 2500,        // $25 one-time
    unit: 'per_booking',
    requiresDeposit: false,
    depositPercent: 0,
  },

  // ── TRANSFERS ──
  {
    id: 'airport-transfer',
    category: 'upsell',
    name: 'Private Airport Transfer',
    description: 'Private sedan pickup/drop-off at IAH or HOU.',
    rateMinor: 7500,        // $75
    unit: 'per_booking',
    requiresDeposit: false,
    depositPercent: 0,
  },

  // ── UPSELLS (sample pricing — ESCALATE TO HUMAN) ──
  // These are flagged — the pricing engine returns them but the
  // conversation agent should say "Let me connect you with a concierge
  // for a custom quote on that."
  {
    id: 'upsell-concierge',
    category: 'concierge',
    name: 'Concierge Services',
    description: 'Full concierge service — restaurants, events, reservations.',
    rateMinor: 15000,       // $150 (sample — escalate)
    unit: 'per_booking',
    requiresDeposit: false,
    depositPercent: 0,
    escalateToHuman: true,
  },
  {
    id: 'upsell-private-chef',
    category: 'concierge',
    name: 'Private Chef Experience',
    description: 'In-home private chef for a custom dining experience.',
    rateMinor: 50000,       // $500 (sample — escalate)
    unit: 'per_booking',
    requiresDeposit: true,
    depositPercent: 100,
    escalateToHuman: true,
  },
  {
    id: 'upsell-boat-charter',
    category: 'concierge',
    name: 'Boat Charter',
    description: 'Private boat charter for a day on the water.',
    rateMinor: 80000,       // $800 (sample — escalate)
    unit: 'per_booking',
    requiresDeposit: true,
    depositPercent: 100,
    escalateToHuman: true,
  },
  {
    id: 'upsell-birthday-party',
    category: 'concierge',
    name: 'Birthday Party Planning / Setup',
    description: 'Full birthday party planning and on-site setup.',
    rateMinor: 40000,       // $400 (sample — escalate)
    unit: 'per_booking',
    requiresDeposit: true,
    depositPercent: 100,
    escalateToHuman: true,
  },
  {
    id: 'upsell-photoshoot',
    category: 'concierge',
    name: 'Photo Shoot',
    description: 'Professional photo shoot — locations, styling, editing.',
    rateMinor: 30000,       // $300 (sample — escalate)
    unit: 'per_booking',
    requiresDeposit: true,
    depositPercent: 100,
    escalateToHuman: true,
  },
  {
    id: 'upsell-event-planning',
    category: 'concierge',
    name: 'Special Event Planning',
    description: 'Full-service event planning for any occasion.',
    rateMinor: 50000,       // $500 (sample — escalate)
    unit: 'per_booking',
    requiresDeposit: true,
    depositPercent: 100,
    escalateToHuman: true,
  },
  {
    id: 'upsell-spa-package',
    category: 'concierge',
    name: 'Spa Package',
    description: 'Curated spa and wellness package.',
    rateMinor: 20000,       // $200 (sample — escalate)
    unit: 'per_booking',
    requiresDeposit: true,
    depositPercent: 50,
    escalateToHuman: true,
  },
  {
    id: 'upsell-grocery-stocking',
    category: 'concierge',
    name: 'Grocery Stocking Service',
    description: 'Pre-arrival pantry and fridge stocking.',
    rateMinor: 10000,       // $100 (sample — escalate)
    unit: 'per_booking',
    requiresDeposit: false,
    depositPercent: 0,
    escalateToHuman: true,
  },
]

/**
 * Seasonal & holiday rules for Middleton Manor.
 *
 * PRIORITY: Holiday surcharge (25%) > Peak surcharge (10%) > Off-peak discount (-10%)
 * Holiday dates take precedence over peak/off-peak when they overlap.
 */
const seasonalRules = [
  // ── PEAK SEASON (+10%) ──
  { productId: 'middleton-manor', monthStart: 3,  monthEnd: 5,  dayStart: 1,  dayEnd: 31,   multiplier: 1.10, label: 'Peak Season +10%',           priority: 1 },

  // ── SECOND PEAK WINDOW (Sep 15 - Nov 30) ──
  // These are date-range specific, handled as day-based rules
  { productId: 'middleton-manor', monthStart: 9,  monthEnd: 9,  dayStart: 15, dayEnd: 30,   multiplier: 1.10, label: 'Peak Season +10%',           priority: 1 },
  { productId: 'middleton-manor', monthStart: 10, monthEnd: 11, dayStart: 1,  dayEnd: 30,   multiplier: 1.10, label: 'Peak Season +10%',           priority: 1 },

  // ── DEC 15 - JAN 5 PEAK (base peak, overridden by holiday where they overlap) ──
  { productId: 'middleton-manor', monthStart: 12, monthEnd: 12, dayStart: 15, dayEnd: 31,   multiplier: 1.10, label: 'Peak Season +10%',           priority: 1 },
  { productId: 'middleton-manor', monthStart: 1,  monthEnd: 1,  dayStart: 1,  dayEnd: 5,    multiplier: 1.10, label: 'Peak Season +10%',           priority: 1 },

  // ── OFF-PEAK (-10%) Jun 1 - Sep 14 ──
  { productId: 'middleton-manor', monthStart: 6,  monthEnd: 8,  dayStart: 1,  dayEnd: 31,   multiplier: 0.90, label: 'Off-Peak -10%',              priority: 0 },
  { productId: 'middleton-manor', monthStart: 9,  monthEnd: 9,  dayStart: 1,  dayEnd: 14,   multiplier: 0.90, label: 'Off-Peak -10%',              priority: 0 },

  // ── HOLIDAY SURCHARGE (+25%) ──
  // These take highest priority
  { productId: 'middleton-manor', monthStart: 12, monthEnd: 12, dayStart: 23, dayEnd: 31,   multiplier: 1.25, label: 'Holiday Surcharge +25%',       priority: 2 },
  { productId: 'middleton-manor', monthStart: 1,  monthEnd: 1,  dayStart: 1,  dayEnd: 5,    multiplier: 1.25, label: 'Holiday Surcharge +25%',       priority: 2 },
  { productId: 'middleton-manor', monthStart: 7,  monthEnd: 7,  dayStart: 3,  dayEnd: 5,    multiplier: 1.25, label: 'Holiday Surcharge +25%',       priority: 2 },
  { productId: 'middleton-manor', monthStart: 5,  monthEnd: 5,  dayStart: 23, dayEnd: 27,   multiplier: 1.25, label: 'Holiday Surcharge +25%',       priority: 2 },
  { productId: 'middleton-manor', monthStart: 11, monthEnd: 11, dayStart: 27, dayEnd: 1,    multiplier: 1.25, label: 'Holiday Surcharge +25%',       priority: 2 },
  { productId: 'middleton-manor', monthStart: 8,  monthEnd: 8,  dayStart: 29, dayEnd: 2,    multiplier: 1.25, label: 'Holiday Surcharge +25%',       priority: 2 },
]

// ── RENTAL DISCOUNTS (length-based) ──
// These are applied in addition to seasonal rates
const rentalDiscounts = [
  { minDays: 7,  maxDays: 29, discountPercent: 5,  label: 'Weekly Rental -5%' },
  { minDays: 30, maxDays: 365, discountPercent: 10, label: 'Monthly Rental -10%' },
]

// ── BUNDLE DISCOUNT ──
// Accommodation + vehicle = 15% off vehicle
const bundleDiscount = {
  categories: ['accommodation', 'car'],
  discountPercent: 15,
  label: 'Bundle Discount -15% (accommodation + vehicle)',
}

const taxRules = [
  { id: 'occupancy-tax',    label: 'Occupancy Tax',           percent: 10, appliesTo: ['accommodation'] },
  { id: 'service-fee',      label: 'Service & Booking Fee',    percent: 5,  appliesTo: ['accommodation', 'car', 'upsell', 'concierge'] },
]

const promoCodes = {}

module.exports = { products, seasonalRules, rentalDiscounts, bundleDiscount, taxRules, promoCodes }