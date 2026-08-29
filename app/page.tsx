export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '100px auto', padding: 20 }}>
      <h1>ITTR Group — Pricing Engine</h1>
      <p style={{ color: '#666' }}>Send a POST request to <code>/api/pricing/calculate</code> with your itinerary items to get a price quote.</p>
      <h2>Example</h2>
      <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
{`{
  "items": [
    { "type": "accommodation", "productId": "middleton-manor", "quantity": 5 },
    { "type": "car", "productId": "car-noir-1", "quantity": 5 }
  ],
  "checkIn": "2026-12-01"
}`}
      </pre>
    </div>
  )
}