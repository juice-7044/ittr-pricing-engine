# ITTR Group — Pricing Engine Design

## Architecture

```
Traveler → GHL Conversation Agent (AI Studio)
                ↓
          "I need a car, 7 days, SUV class, pickup Dec 1"
                ↓
     GHL Workflow: Opportunity updated with selections
                ↓
     Custom Action → POST /api/pricing/calculate
         ↓                    ↑
   Pricing Service     returns { total, breakdown }
   (Next.js API Route)
         ↓
     GHL stores: total_price, breakdown (custom fields)
         ↓
     AI Studio reads fields → responds naturally
```

## Data Model

### Products Table (in PostgreSQL behind the pricing API)

```sql
CREATE TABLE products (
  id            TEXT PRIMARY KEY,          -- e.g. 'car_suv', 'accommodation_villa'
  category      TEXT NOT NULL,             -- 'car', 'accommodation', 'upsell', 'concierge'
  name          TEXT NOT NULL,             -- 'SUV - 7 days'
  base_rate     INTEGER NOT NULL,          -- price in cents (minor units)
  unit          TEXT NOT NULL,             -- 'daily', 'nightly', 'per_booking', 'per_person'
  description   TEXT,
  active        BOOLEAN DEFAULT true
);

CREATE TABLE seasonal_multipliers (
  id            SERIAL PRIMARY KEY,
  product_id    TEXT REFERENCES products(id),
  month_start   INTEGER NOT NULL,          -- 1-12
  month_end     INTEGER NOT NULL,          -- 1-12
  multiplier    DECIMAL(5,2) NOT NULL,     -- e.g. 1.5 for peak season
  label         TEXT                       -- 'Peak Season', 'Off Season'
);

CREATE TABLE upsells (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  price_minor   INTEGER NOT NULL,          -- price in cents
  category      TEXT,                      -- 'insurance', 'extras', 'concierge'
  description   TEXT
);
```

### Example Rates (cents / minor units)

```
Accommodations:
  Villa 1BR:          $200/night  → 20000
  Villa 2BR:          $350/night  → 35000
  Apartment Studio:   $120/night  → 12000
  Penthouse Suite:    $500/night  → 50000

Cars:
  Economy:            $35/day     → 3500
  Midsize Sedan:      $55/day     → 5500
  SUV:                $85/day     → 8500
  Luxury:             $150/day    → 15000

Upsells:
  Airport Transfer:   $75         → 7500
  Personal Chef:      $150/session → 15000
  Spa Package:        $200        → 20000
  Concierge Service:  $50/day     → 5000

Seasonal (e.g. Houston):
  Dec-Feb:            1.0x (base)
  Mar-May:            1.2x (spring — rodeo season, conventions)
  Jun-Aug:            0.9x (summer — lower demand in Houston heat)
  Sep-Nov:            1.1x (fall — conferences)
```

## API Endpoint

### POST /api/pricing/calculate

**Request:**
```json
{
  "items": [
    { "type": "accommodation", "id": "villa-2br", "units": 5, "guests": 4 },
    { "type": "car",           "id": "suv",        "units": 7 },
    { "type": "upsell",        "id": "airport-xfer" },
    { "type": "upsell",        "id": "concierge",  "units": 5 }
  ],
  "check_in": "2026-12-01",
  "promo_code": null
}
```

**Response:**
```json
{
  "total": 584500,
  "currency": "usd",
  "breakdown": [
    { "item": "Villa 2BR × 5 nights",   "amount": 175000, "detail": "$350/night × 5" },
    { "item": "SUV × 7 days",            "amount": 59500,  "detail": "$85/day × 7" },
    { "item": "Airport Transfer",        "amount": 7500,   "one_time": true },
    { "item": "Concierge × 5 days",      "amount": 25000,  "detail": "$50/day × 5" },
    { "item": "Occupancy Tax (10%)",     "amount": 26700,  "detail": "10% of accommodation" },
    { "item": "Service Fee (5%)",        "amount": 13350,  "detail": "5% of subtotal" }
  ],
  "subtotal": 245000,
  "taxes_and_fees": 40050,
  "grand_total": 285050
}
```

## GHL Integration

### Custom Fields on Opportunity
```
itinerary_items          → JSON     (the raw selections from the traveler)
pricing_breakdown        → JSON     (the full breakdown from the engine)
total_price_minor        → Number   (grand total in cents)
base_amount_minor        → Number   (subtotal before taxes/fees)
taxes_fees_minor         → Number   (taxes & fees total)
booking_status           → Text     (quote_sent | partially_paid | paid_in_full)
deposit_required_minor   → Number   (deposit needed to confirm)
```

### AI Studio Agent Flow
```
1. Traveler says: "I need a car and place to stay in Houston Dec 1-6"
2. Agent asks clarifying questions (car type? villa or apt? any extras?)
3. Agent calls Custom Action → webhook to pricing API
4. Agent receives breakdown and responds:
   "Here's your quote: Villa 2BR for 5 nights + SUV for 5 days = $2,850.50 total"
5. Agent offers: "Want to book? A 25% deposit of $712.63 secures it."
6. If traveler agrees → GHL updates opportunity stage → payment workflow triggers
```

## Implementation Notes

- **All prices in minor units (cents)** — $100 = 10000. No floating point math.
- **Seasonal multipliers apply to the date range** — mid-stay season changes are prorated.
- **Taxes calculated after subtotal** — avoids compounding errors.
- **Promo codes** — can be a flat discount or percentage, validated server-side.
- **Idempotency** — same inputs always produce the same total.
- **No AI in the math** — the API is pure deterministic code. AI Studio just reads the result.