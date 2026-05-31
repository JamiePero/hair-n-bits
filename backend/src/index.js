require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const paystack = require('./routes/paystack')

const app  = express()
const PORT = process.env.PORT || 3000

// ── Middleware ────────────────────────────────────
app.use(cors({
  origin: '*',   // Tighten this to your frontend domain in production
  methods: ['GET', 'POST'],
}))
app.use(express.json())

// ── Routes ────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: "Hair 'N' Bits API" }))
app.use('/api/paystack', paystack)

// ── 404 ───────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => console.log(`✅  Hair 'N' Bits API running on port ${PORT}`))
