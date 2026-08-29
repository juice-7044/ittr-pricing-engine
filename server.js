/**
 * ITTR Group — Pricing Engine Server
 *
 * Standalone Node.js HTTP server.
 * No build step.  Run directly: node server.js
 */

const http = require('node:http')
const { calculatePricing } = require('./lib/calculator')

const PORT = process.env.PORT || 3099

const server = http.createServer((req, res) => {
  // CORS headers (needed for GHL webhook calls)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: false, error: 'Only POST is accepted' }))
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  if (url.pathname !== '/api/pricing/calculate') {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: false, error: 'Not found' }))
    return
  }

  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', () => {
    try {
      const input = JSON.parse(body)

      // Normalize items: GHL may send numbers as strings
      const normalizedItems = input.items.map(item => ({
        type: String(item.type || ''),
        productId: String(item.productId || ''),
        quantity: typeof item.quantity === 'number' ? item.quantity : Number(item.quantity) || 0,
      }))

      for (const item of normalizedItems) {
        if (!item.type || !item.productId) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: 'Each item must have type and productId' }))
          return
        }
        if (item.quantity < 1) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: `Invalid quantity for ${item.productId}: ${item.quantity}` }))
          return
        }
      }

      const result = calculatePricing({
        items: normalizedItems,
        checkIn: input.checkIn,
        promoCode: input.promoCode,
      })

      res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(result, null, 2))
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: e.message }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`\n  ✦ ITTR Pricing Engine running on http://localhost:${PORT}`)
  console.log(`  ✦ POST /api/pricing/calculate\n`)
})