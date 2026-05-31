import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useCart } from '../context/CartContext'

const BACKEND = import.meta.env.VITE_RAILWAY_BACKEND_URL || 'http://localhost:3000'

export default function OrderSuccessPage() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const { dispatch } = useCart()
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')

    async function verifyAndLoad() {
      try {
        // Verify with backend if reference present
        if (reference) {
          await fetch(`${BACKEND}/api/paystack/verify/${reference}`)
          setVerified(true)
        }

        // Load order from Firestore
        const snap = await getDoc(doc(db, 'orders', orderId))
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() })
          // Clear cart on success
          dispatch({ type: 'CLEAR' })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    verifyAndLoad()
  }, [orderId])

  if (loading) {
    return (
      <main className="pt-32 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4" />
          <div className="skeleton h-6 w-48 mx-auto" />
        </div>
      </main>
    )
  }

  return (
    <main className="pt-24 min-h-screen flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="surface-card p-10 max-w-lg w-full text-center"
      >
        {/* Check icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(73,1,1,0.4)', border: '2px solid var(--color-red-primary)' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-gold-light)' }}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </motion.div>

        <h1 className="font-display text-3xl font-bold mb-3" style={{ color: 'var(--color-white)' }}>
          Order Confirmed!
        </h1>
        <p className="font-sans text-sm mb-2" style={{ color: 'var(--color-grey)' }}>
          Thank you for shopping with Hair 'N' Bits.
        </p>
        <p className="font-sans text-xs mb-6" style={{ color: 'var(--color-grey)' }}>
          Order ID: <span className="font-mono" style={{ color: 'var(--color-gold-deep)' }}>{orderId}</span>
        </p>

        {order && (
          <div
            className="text-left space-y-3 my-6 p-4"
            style={{ background: 'var(--surface-3)', border: '1px solid rgba(89,87,87,0.3)' }}
          >
            <p className="font-sans text-xs tracking-widest uppercase" style={{ color: 'var(--color-gold-deep)' }}>
              Items Ordered
            </p>
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="font-sans text-sm" style={{ color: 'var(--color-white)' }}>
                  {item.name} × {item.quantity}
                </span>
                <span className="price-tag text-sm">
                  ₵{(item.price * item.quantity).toLocaleString('en-GH')}
                </span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'rgba(89,87,87,0.3)' }} />
            <div className="flex justify-between items-center">
              <span className="font-sans text-sm font-semibold" style={{ color: 'var(--color-white)' }}>Total</span>
              <span className="price-tag text-lg font-bold">₵{order.total?.toLocaleString('en-GH')}</span>
            </div>
            {order.address && (
              <p className="font-sans text-xs" style={{ color: 'var(--color-grey)' }}>
                Delivery to: {order.address}
              </p>
            )}
          </div>
        )}

        <Link to="/shop" className="btn-gold w-full block text-center mt-6">
          Continue Shopping
        </Link>
      </motion.div>
    </main>
  )
}
