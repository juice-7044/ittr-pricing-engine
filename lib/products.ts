/**
 * ITTR Group — Product Catalog
 *
 * All prices in minor units (cents).
 * $100.00 = 10000
 *
 * ⚠️ DO NOT QUOTE upsells marked escalateToHuman — route to a concierge.
 */

export interface Product {
  id: string; category: string; name: string; description: string;
  rateMinor: number; unit: string; requiresDeposit: boolean; depositPercent: number;
  securityDepositMinor?: number; rimDamageMinor?: number; smokingViolationMinor?: number;
  maxGuests?: number; allowBundles?: boolean; escalateToHuman?: boolean;
}

export interface SeasonalRule {
  productId: string; monthStart: number; monthEnd: number; dayStart: number; dayEnd: number;
  multiplier: number; label: string; priority: number;
}

export interface RentalDiscount { minDays: number; maxDays: number; discountPercent: number; label: string; }
export interface BundleDiscount { categories: string[]; discountPercent: number; label: string; }
export interface TaxRule { id: string; label: string; percent: number; appliesTo: string[]; }

const products: Product[] = [
  { id: 'middleton-manor', category: 'accommodation', name: 'Middleton Manor', description: "8 guests · 3BR townhouse · 3 beds · 3.5 baths · Luxury smart home in Houston's Museum District. Tesla EV charger, private garage, dedicated workspace.", rateMinor: 29900, unit: 'nightly', requiresDeposit: true, depositPercent: 25, smokingViolationMinor: 50000, maxGuests: 8, allowBundles: true },

  { id: 'car-noir-1', category: 'car', name: 'Noir 1 · 2027 Kia Telluride Hybrid', description: 'Luxury 3-row SUV hybrid.', rateMinor: 12000, unit: 'daily', requiresDeposit: true, depositPercent: 100, securityDepositMinor: 50000, rimDamageMinor: 50000, smokingViolationMinor: 50000 },
  { id: 'car-luna-2', category: 'car', name: 'Luna 2 · 2026 Tesla White Premium', description: 'Premium white Tesla.', rateMinor: 8900, unit: 'daily', requiresDeposit: true, depositPercent: 100, securityDepositMinor: 50000, rimDamageMinor: 50000, smokingViolationMinor: 50000 },
  { id: 'car-nova-3', category: 'car', name: 'Nova 3 · Black 2026 Tesla Dual Motor', description: 'Black Tesla Dual Motor AWD.', rateMinor: 8900, unit: 'daily', requiresDeposit: true, depositPercent: 100, securityDepositMinor: 50000, rimDamageMinor: 50000, smokingViolationMinor: 50000 },
  { id: 'car-orion-4', category: 'car', name: 'Orion 4 · 2026 Buick Envista ST', description: 'Stylish compact SUV.', rateMinor: 7100, unit: 'daily', requiresDeposit: true, depositPercent: 100, securityDepositMinor: 50000, rimDamageMinor: 50000, smokingViolationMinor: 50000 },
  { id: 'car-twilight-5', category: 'car', name: 'Twilight 5 · Black 2026 Nissan Kicks SR', description: 'Compact crossover.', rateMinor: 6100, unit: 'daily', requiresDeposit: true, depositPercent: 100, securityDepositMinor: 50000, rimDamageMinor: 50000, smokingViolationMinor: 50000 },

  { id: 'car-ev-charging', category: 'upsell', name: 'EV Charging Fee (daily)', description: 'Daily EV charging at the property.', rateMinor: 1500, unit: 'daily', requiresDeposit: false, depositPercent: 0 },
  { id: 'car-refueling', category: 'upsell', name: 'Refueling Service', description: 'We fill the tank before your return.', rateMinor: 2500, unit: 'per_booking', requiresDeposit: false, depositPercent: 0 },
  { id: 'airport-transfer', category: 'upsell', name: 'Private Airport Transfer', description: 'Private sedan pickup/drop-off at IAH or HOU.', rateMinor: 7500, unit: 'per_booking', requiresDeposit: false, depositPercent: 0 },

  { id: 'upsell-concierge', category: 'concierge', name: 'Concierge Services', description: 'Full concierge service.', rateMinor: 15000, unit: 'per_booking', requiresDeposit: false, depositPercent: 0, escalateToHuman: true },
  { id: 'upsell-private-chef', category: 'concierge', name: 'Private Chef Experience', description: 'In-home private chef.', rateMinor: 50000, unit: 'per_booking', requiresDeposit: true, depositPercent: 100, escalateToHuman: true },
  { id: 'upsell-boat-charter', category: 'concierge', name: 'Boat Charter', description: 'Private boat charter.', rateMinor: 80000, unit: 'per_booking', requiresDeposit: true, depositPercent: 100, escalateToHuman: true },
  { id: 'upsell-birthday-party', category: 'concierge', name: 'Birthday Party Planning', description: 'Full party planning and setup.', rateMinor: 40000, unit: 'per_booking', requiresDeposit: true, depositPercent: 100, escalateToHuman: true },
  { id: 'upsell-photoshoot', category: 'concierge', name: 'Photo Shoot', description: 'Professional photo shoot.', rateMinor: 30000, unit: 'per_booking', requiresDeposit: true, depositPercent: 100, escalateToHuman: true },
  { id: 'upsell-event-planning', category: 'concierge', name: 'Special Event Planning', description: 'Full-service event planning.', rateMinor: 50000, unit: 'per_booking', requiresDeposit: true, depositPercent: 100, escalateToHuman: true },
  { id: 'upsell-spa-package', category: 'concierge', name: 'Spa Package', description: 'Curated spa and wellness.', rateMinor: 20000, unit: 'per_booking', requiresDeposit: true, depositPercent: 50, escalateToHuman: true },
  { id: 'upsell-grocery-stocking', category: 'concierge', name: 'Grocery Stocking Service', description: 'Pre-arrival pantry stocking.', rateMinor: 10000, unit: 'per_booking', requiresDeposit: false, depositPercent: 0, escalateToHuman: true },
]

const seasonalRules: SeasonalRule[] = [
  { productId: 'middleton-manor', monthStart: 3, monthEnd: 5, dayStart: 1, dayEnd: 31, multiplier: 1.10, label: 'Peak Season +10%', priority: 1 },
  { productId: 'middleton-manor', monthStart: 9, monthEnd: 9, dayStart: 15, dayEnd: 30, multiplier: 1.10, label: 'Peak Season +10%', priority: 1 },
  { productId: 'middleton-manor', monthStart: 10, monthEnd: 11, dayStart: 1, dayEnd: 30, multiplier: 1.10, label: 'Peak Season +10%', priority: 1 },
  { productId: 'middleton-manor', monthStart: 12, monthEnd: 12, dayStart: 15, dayEnd: 31, multiplier: 1.10, label: 'Peak Season +10%', priority: 1 },
  { productId: 'middleton-manor', monthStart: 1, monthEnd: 1, dayStart: 1, dayEnd: 5, multiplier: 1.10, label: 'Peak Season +10%', priority: 1 },
  { productId: 'middleton-manor', monthStart: 6, monthEnd: 8, dayStart: 1, dayEnd: 31, multiplier: 0.90, label: 'Off-Peak -10%', priority: 0 },
  { productId: 'middleton-manor', monthStart: 9, monthEnd: 9, dayStart: 1, dayEnd: 14, multiplier: 0.90, label: 'Off-Peak -10%', priority: 0 },
  { productId: 'middleton-manor', monthStart: 12, monthEnd: 12, dayStart: 23, dayEnd: 31, multiplier: 1.25, label: 'Holiday Surcharge +25%', priority: 2 },
  { productId: 'middleton-manor', monthStart: 1, monthEnd: 1, dayStart: 1, dayEnd: 5, multiplier: 1.25, label: 'Holiday Surcharge +25%', priority: 2 },
  { productId: 'middleton-manor', monthStart: 7, monthEnd: 7, dayStart: 3, dayEnd: 5, multiplier: 1.25, label: 'Holiday Surcharge +25%', priority: 2 },
  { productId: 'middleton-manor', monthStart: 5, monthEnd: 5, dayStart: 23, dayEnd: 27, multiplier: 1.25, label: 'Holiday Surcharge +25%', priority: 2 },
  { productId: 'middleton-manor', monthStart: 11, monthEnd: 11, dayStart: 27, dayEnd: 1, multiplier: 1.25, label: 'Holiday Surcharge +25%', priority: 2 },
  { productId: 'middleton-manor', monthStart: 8, monthEnd: 8, dayStart: 29, dayEnd: 2, multiplier: 1.25, label: 'Holiday Surcharge +25%', priority: 2 },
]

const rentalDiscounts: RentalDiscount[] = [
  { minDays: 7, maxDays: 29, discountPercent: 5, label: 'Weekly Rental -5%' },
  { minDays: 30, maxDays: 365, discountPercent: 10, label: 'Monthly Rental -10%' },
]

const bundleDiscount: BundleDiscount = { categories: ['accommodation', 'car'], discountPercent: 15, label: 'Bundle Discount -15% (accommodation + vehicle)' }

const taxRules: TaxRule[] = [
  { id: 'occupancy-tax', label: 'Occupancy Tax', percent: 10, appliesTo: ['accommodation'] },
  { id: 'service-fee', label: 'Service & Booking Fee', percent: 5, appliesTo: ['accommodation', 'car', 'upsell', 'concierge'] },
]

const promoCodes: Record<string, { type: string; value: number; minTotalMinor?: number }> = {}

export { products, seasonalRules, rentalDiscounts, bundleDiscount, taxRules, promoCodes }