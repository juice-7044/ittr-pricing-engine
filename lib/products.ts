import { ProductCatalog } from './types'

/**
 * ITTR Group — Product Catalog
 *
 * All prices in minor units (cents).
 * $100.00 = 10000
 *
 */
const catalog: ProductCatalog = {
  // ── PRODUCTS ──────────────────────────────────────
  products: [
    // ACCOMMODATIONS
    {
      id: 'villa-1br',
      category: 'accommodation',
      name: 'One-Bedroom Villa',
      description: 'Luxury one-bedroom villa with private terrace',
      rateMinor: 20000,     // $200/night
      unit: 'nightly',
      requiresDeposit: true,
      depositPercent: 25,
    },
    {
      id: 'villa-2br',
      category: 'accommodation',
      name: 'Two-Bedroom Villa',
      description: 'Spacious two-bedroom villa with pool access',
      rateMinor: 35000,     // $350/night
      unit: 'nightly',
      requiresDeposit: true,
      depositPercent: 25,
    },
    {
      id: 'apartment-studio',
      category: 'accommodation',
      name: 'Studio Apartment',
      description: 'Modern studio apartment in the city center',
      rateMinor: 12000,     // $120/night
      unit: 'nightly',
      requiresDeposit: true,
      depositPercent: 25,
    },
    {
      id: 'penthouse-suite',
      category: 'accommodation',
      name: 'Penthouse Suite',
      description: 'Top-floor penthouse with panoramic views',
      rateMinor: 50000,     // $500/night
      unit: 'nightly',
      requiresDeposit: true,
      depositPercent: 50,
    },
    {
      id: 'executive-apt',
      category: 'accommodation',
      name: 'Executive Apartment',
      description: 'Full-service executive apartment for extended stays',
      rateMinor: 16000,     // $160/night
      unit: 'nightly',
      requiresDeposit: true,
      depositPercent: 25,
    },

    // CARS
    {
      id: 'car-economy',
      category: 'car',
      name: 'Economy Car',
      description: 'Compact car — Toyota Corolla or equivalent',
      rateMinor: 3500,      // $35/day
      unit: 'daily',
      requiresDeposit: true,
      depositPercent: 50,
    },
    {
      id: 'car-midsize',
      category: 'car',
      name: 'Midsize Sedan',
      description: 'Comfortable sedan — Honda Accord or equivalent',
      rateMinor: 5500,      // $55/day
      unit: 'daily',
      requiresDeposit: true,
      depositPercent: 50,
    },
    {
      id: 'car-suv',
      category: 'car',
      name: 'SUV',
      description: 'Sport utility vehicle — Ford Explorer or equivalent',
      rateMinor: 8500,      // $85/day
      unit: 'daily',
      requiresDeposit: true,
      depositPercent: 50,
    },
    {
      id: 'car-luxury',
      category: 'car',
      name: 'Luxury Sedan',
      description: 'Premium sedan — Mercedes E-Class or equivalent',
      rateMinor: 15000,     // $150/day
      unit: 'daily',
      requiresDeposit: true,
      depositPercent: 50,
    },
    {
      id: 'car-suv-premium',
      category: 'car',
      name: 'Premium SUV',
      description: 'Full-size luxury SUV — Escalade or equivalent',
      rateMinor: 22000,     // $220/day
      unit: 'daily',
      requiresDeposit: true,
      depositPercent: 50,
    },

    // UPSELLS
    {
      id: 'upsell-airport-transfer',
      category: 'upsell',
      name: 'Airport Transfer',
      description: 'Private sedan pickup/drop-off at IAH or HOU',
      rateMinor: 7500,      // $75
      unit: 'per_booking',
      requiresDeposit: false,
      depositPercent: 0,
    },
    {
      id: 'upsell-airport-transfer-suv',
      category: 'upsell',
      name: 'Airport Transfer — SUV',
      description: 'Premium SUV pickup/drop-off at IAH or HOU',
      rateMinor: 12000,     // $120
      unit: 'per_booking',
      requiresDeposit: false,
      depositPercent: 0,
    },
    {
      id: 'upsell-personal-chef',
      category: 'upsell',
      name: 'Personal Chef Session',
      description: 'In-villa private chef for one dinner service',
      rateMinor: 15000,     // $150
      unit: 'per_booking',
      requiresDeposit: true,
      depositPercent: 100,
    },
    {
      id: 'upsell-spa-package',
      category: 'upsell',
      name: 'Spa & Wellness Package',
      description: 'Couples massage, facial, and wellness access',
      rateMinor: 20000,     // $200
      unit: 'per_booking',
      requiresDeposit: true,
      depositPercent: 50,
    },
    {
      id: 'upsell-grocery-stocking',
      category: 'upsell',
      name: 'Grocery Stocking Service',
      description: 'Pre-arrival pantry and fridge stocking',
      rateMinor: 5000,      // $50
      unit: 'per_booking',
      requiresDeposit: false,
      depositPercent: 0,
    },
    {
      id: 'upsell-early-checkin',
      category: 'upsell',
      name: 'Early Check-In (before 2 PM)',
      description: 'Guaranteed early access to your accommodation',
      rateMinor: 7500,      // $75
      unit: 'per_booking',
      requiresDeposit: false,
      depositPercent: 0,
    },
    {
      id: 'upsell-late-checkout',
      category: 'upsell',
      name: 'Late Check-Out (after 12 PM)',
      description: 'Stay until 6 PM on departure day',
      rateMinor: 7500,      // $75
      unit: 'per_booking',
      requiresDeposit: false,
      depositPercent: 0,
    },

    // CONCIERGE
    {
      id: 'concierge-standard',
      category: 'concierge',
      name: 'Standard Concierge',
      description: 'Daily concierge service — restaurant bookings, local tips, reservations',
      rateMinor: 5000,      // $50/day
      unit: 'daily',
      requiresDeposit: false,
      depositPercent: 0,
    },
    {
      id: 'concierge-premium',
      category: 'concierge',
      name: 'Premium Concierge',
      description: 'Dedicated concierge — itinerary planning, private transport, VIP access',
      rateMinor: 15000,     // $150/day
      unit: 'daily',
      requiresDeposit: true,
      depositPercent: 50,
    },
  ],

  // ── SEASONAL RULES ────────────────────────────────
  seasonalRules: [
    // Houston, TX seasonality
    { productId: 'villa-1br',            monthStart: 3,  monthEnd: 5,  multiplier: 1.2, label: 'Spring Peak (Rodeo / Conferences)' },
    { productId: 'villa-2br',            monthStart: 3,  monthEnd: 5,  multiplier: 1.2, label: 'Spring Peak' },
    { productId: 'penthouse-suite',      monthStart: 3,  monthEnd: 5,  multiplier: 1.3, label: 'Spring Peak — Premium' },
    { productId: 'villa-1br',            monthStart: 6,  monthEnd: 8,  multiplier: 0.9, label: 'Summer Off-Peak' },
    { productId: 'villa-2br',            monthStart: 6,  monthEnd: 8,  multiplier: 0.9, label: 'Summer Off-Peak' },
    { productId: 'penthouse-suite',      monthStart: 6,  monthEnd: 8,  multiplier: 0.85, label: 'Summer Off-Peak' },
    { productId: 'executive-apt',        monthStart: 9,  monthEnd: 11, multiplier: 1.15, label: 'Fall Conference Season' },
    { productId: 'car-luxury',           monthStart: 3,  monthEnd: 5,  multiplier: 1.1,  label: 'Spring Peak' },
    { productId: 'car-suv-premium',     monthStart: 3,  monthEnd: 5,  multiplier: 1.1,  label: 'Spring Peak' },
    { productId: 'concierge-premium',    monthStart: 11, monthEnd: 1,  multiplier: 1.2,  label: 'Holiday Season' },
  ],

  // ── TAX RULES ─────────────────────────────────────
  taxRules: [
    { id: 'occupancy-tax', label: 'Occupancy Tax',                 percent: 10, appliesTo: ['accommodation'] },
    { id: 'rental-surcharge', label: 'Rental Concession Fee',       percent: 8,  appliesTo: ['car'] },
    { id: 'service-fee', label: 'Service & Booking Fee',            percent: 5,  appliesTo: ['accommodation', 'car', 'upsell', 'concierge'] },
  ],

  // ── PROMO CODES ───────────────────────────────────
  promoCodes: {
    'WELCOME10':  { type: 'percent', value: 10, minTotalMinor: 50000 },
    'ITTR25':     { type: 'flat',    value: 2500 },
    'LONGSTAY':   { type: 'percent', value: 15, minTotalMinor: 200000 },
  },
}

export default catalog