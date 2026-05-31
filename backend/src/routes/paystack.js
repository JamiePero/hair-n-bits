const express = require('express')
const axios   = require('axios')
const admin   = require('firebase-admin')
const router  = express.Router()

// ── Firebase Admin init (lazy, singleton) ─────────
function getFirestore() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
  return admin.firestore()
}

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE   = 'https://api.paystack.co'

// ── POST /api/paystack/initialize ─────────────────
router.post('/initialize', async (req, res) => {
  const { email, amount, orderId } = req.body

  if (!email || !amount || !orderId) {
    return res.status(400).json({ error: 'email, amount and orderId are required' })
  }

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email,
        amount: Math.round(amount), // already in pesewas from frontend
        reference: `HNB-${orderId}-${Date.now()}`,
        currency: 'GHS',
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success/${orderId}`,
        metadata: { orderId },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } }
    )

    const { authorization_url, reference } = response.data.data

    // Store reference on the order
    const db = getFirestore()
    await db.collection('orders').doc(orderId).update({ paystackRef: reference })

    res.json({ authorization_url, reference })
  } catch (err) {
    console.error('Paystack init error:', err?.response?.data || err.message)
    res.status(500).json({
      error: 'Payment initialization failed',
      message: err?.response?.data?.message || err.message,
    })
  }
})

// ── GET /api/paystack/verify/:reference ───────────
router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params

  try {
    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    )

    const txn = response.data.data

    if (txn.status === 'success') {
      const orderId = txn.metadata?.orderId
      if (orderId) {
        const db = getFirestore()
        await db.collection('orders').doc(orderId).update({
          status: 'paid',
          paystackRef: reference,
        })
      }
      res.json({ verified: true, status: txn.status, orderId: txn.metadata?.orderId })
    } else {
      res.json({ verified: false, status: txn.status })
    }
  } catch (err) {
    console.error('Paystack verify error:', err?.response?.data || err.message)
    res.status(500).json({
      error: 'Verification failed',
      message: err?.response?.data?.message || err.message,
    })
  }
})

module.exports = router
