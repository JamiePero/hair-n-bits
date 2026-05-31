import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const BACKEND = import.meta.env.VITE_RAILWAY_BACKEND_URL || 'http://localhost:3000'

// ─── step: 'gate' → show sign-in vs guest prompt (only for guests)
//          'form' → show the delivery + pay form

export default function CheckoutPage() {
  const { items, subtotal, dispatch } = useCart()
  const { user, loginWithEmail, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  // If user is already signed in skip the gate entirely
  const [step, setStep]       = useState(user ? 'form' : 'gate')
  const [loading, setLoading] = useState(false)

  // Auth sub-form (used inside the gate if they choose "sign in first")
  const [authMode, setAuthMode]   = useState(null) // null | 'signin'
  const [authEmail, setAuthEmail] = useState('')
  const [authPass, setAuthPass]   = useState('')
  const [authBusy, setAuthBusy]   = useState(false)

  const [form, setForm] = useState({
    customerName: '', email: '', phone: '', address: '',
  })

  // When user signs in (from within the gate), advance to form and pre-fill
  useEffect(() => {
    if (user && step === 'gate') {
      setStep('form')
      setForm(f => ({
        ...f,
        customerName: f.customerName || user.displayName || '',
        email:        f.email        || user.email        || '',
      }))
    }
  }, [user])

  // Pre-fill when already signed in on mount
  useEffect(() => {
    if (user) {
      setForm(f => ({
        customerName: f.customerName || user.displayName || '',
        email:        f.email        || user.email        || '',
        phone:        f.phone,
        address:      f.address,
      }))
    }
  }, [])

  function change(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  // ── Sign-in inside gate ──────────────────────────────────────
  async function handleSignIn(e) {
    e.preventDefault()
    setAuthBusy(true)
    try {
      await loginWithEmail(authEmail, authPass)
      // useEffect above will advance step once user state updates
    } catch {
      toast.error('Incorrect email or password.', {
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #E62525' },
      })
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleGoogleSignIn() {
    setAuthBusy(true)
    try {
      await loginWithGoogle()
    } catch {
      toast.error('Google sign-in failed.', {
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #E62525' },
      })
    } finally {
      setAuthBusy(false)
    }
  }

  // ── Submit order ─────────────────────────────────────────────
  async function handleCheckout(e) {
    e.preventDefault()
    if (items.length === 0) { toast.error('Your cart is empty'); return }

    setLoading(true)
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...form,
        items: items.map(({ id, name, price, quantity }) => ({ productId: id, name, price, quantity })),
        total: subtotal,
        status: 'pending',
        paystackRef: '',
        userId: user?.uid || null,
        createdAt: serverTimestamp(),
      })

      const res = await fetch(`${BACKEND}/api/paystack/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:   form.email,
          amount:  subtotal * 100,
          orderId: orderRef.id,
        }),
      })

      const data = await res.json()
      if (!data.authorization_url) throw new Error(data.message || 'Payment init failed')

      window.location.href = data.authorization_url
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Something went wrong. Please try again.', {
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #E62525' },
      })
    } finally {
      setLoading(false)
    }
  }

  // ── Empty cart guard ─────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="pt-32 text-center px-6">
        <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--color-white)' }}>Your cart is empty</h2>
        <p className="font-sans text-sm mb-8" style={{ color: 'var(--color-grey)' }}>Add some items before checking out.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary">Shop Now</button>
      </main>
    )
  }

  return (
    <main className="pt-24 min-h-screen">
      {/* Page header */}
      <div
        className="py-14 px-6 text-center"
        style={{
          background: 'linear-gradient(to bottom, rgba(73,1,1,0.4), var(--color-black))',
          borderBottom: '1px solid rgba(89,87,87,0.3)',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold"
          style={{ color: 'var(--color-white)' }}
        >
          Checkout
        </motion.h1>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {['How to Continue', 'Your Details'].map((label, i) => {
            const active = (i === 0 && step === 'gate') || (i === 1 && step === 'form')
            const done   = i === 0 && step === 'form'
            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px" style={{ background: done ? 'var(--color-gold-deep)' : 'rgba(89,87,87,0.4)' }} />}
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center font-sans text-[10px] font-bold"
                    style={{
                      background: done ? 'var(--color-gold-deep)' : active ? 'var(--color-red-primary)' : 'var(--surface-3)',
                      color: (done || active) ? '#000' : 'var(--color-grey)',
                    }}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <span
                    className="font-sans text-xs hidden sm:inline"
                    style={{ color: active ? 'var(--color-white)' : 'var(--color-grey)' }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ────────────────────────────────────────────────
              STEP 1 — Gate: sign in or continue as guest
          ──────────────────────────────────────────────── */}
          {step === 'gate' && (
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <AnimatePresence mode="wait">

                {/* ── Option picker ── */}
                {authMode === null && (
                  <motion.div
                    key="picker"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <p className="font-display text-xl text-center mb-8" style={{ color: 'var(--color-white)' }}>
                      How would you like to continue?
                    </p>

                    {/* Sign in option */}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="w-full text-left surface-card p-5 cursor-pointer transition-all duration-200 group"
                      style={{ border: '1px solid rgba(89,87,87,0.4)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-red-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(89,87,87,0.4)'}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                          style={{ background: 'rgba(73,1,1,0.5)', border: '1px solid var(--color-red-dark)' }}
                        >
                          <UserIcon />
                        </div>
                        <div>
                          <p className="font-sans font-semibold text-sm" style={{ color: 'var(--color-white)' }}>
                            Sign in to your account
                          </p>
                          <p className="font-sans text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-grey)' }}>
                            Your name and email will be pre-filled automatically.
                          </p>
                        </div>
                        <ChevronIcon />
                      </div>
                    </button>

                    {/* Guest option */}
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="w-full text-left surface-card p-5 cursor-pointer transition-all duration-200"
                      style={{ border: '1px solid rgba(89,87,87,0.4)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold-deep)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(89,87,87,0.4)'}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                          style={{ background: 'rgba(26,16,0,0.6)', border: '1px solid var(--color-gold-dark)' }}
                        >
                          <GuestIcon />
                        </div>
                        <div>
                          <p className="font-sans font-semibold text-sm" style={{ color: 'var(--color-white)' }}>
                            Continue as guest
                          </p>
                          <p className="font-sans text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-grey)' }}>
                            No account needed. You'll enter your details manually.
                          </p>
                        </div>
                        <ChevronIcon />
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* ── Inline sign-in form ── */}
                {authMode === 'signin' && (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="surface-card p-8 space-y-5"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAuthMode(null)}
                        className="p-1.5 rounded-sm cursor-pointer hover:bg-white/5 transition-colors"
                        aria-label="Back"
                      >
                        <BackIcon />
                      </button>
                      <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-white)' }}>
                        Sign In
                      </h2>
                    </div>

                    {/* Google */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={authBusy}
                      className="btn-outline w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {authBusy ? <SmallSpinner /> : <GoogleIcon />}
                      Continue with Google
                    </button>

                    <div className="relative">
                      <div style={{ height: '1px', background: 'rgba(89,87,87,0.4)' }} />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 font-sans text-xs" style={{ background: 'var(--surface-2)', color: 'var(--color-grey)' }}>
                        or email
                      </span>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <label htmlFor="auth-email" className="block font-sans text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--color-grey)' }}>
                          Email
                        </label>
                        <input
                          id="auth-email"
                          type="email"
                          required
                          value={authEmail}
                          onChange={e => setAuthEmail(e.target.value)}
                          className="input-field"
                          placeholder="you@email.com"
                          autoComplete="email"
                        />
                      </div>
                      <div>
                        <label htmlFor="auth-pass" className="block font-sans text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--color-grey)' }}>
                          Password
                        </label>
                        <input
                          id="auth-pass"
                          type="password"
                          required
                          value={authPass}
                          onChange={e => setAuthPass(e.target.value)}
                          className="input-field"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={authBusy}
                        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {authBusy ? <SmallSpinner /> : null}
                        Sign In & Continue
                      </button>
                    </form>

                    <p className="font-sans text-xs text-center" style={{ color: 'var(--color-grey)' }}>
                      No account?{' '}
                      <button
                        type="button"
                        onClick={() => { setAuthMode(null); setStep('form') }}
                        className="underline cursor-pointer transition-colors hover:text-white"
                      >
                        Continue as guest instead
                      </button>
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────
              STEP 2 — Delivery form + payment
          ──────────────────────────────────────────────── */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-[1fr_400px] gap-10"
            >
              {/* Delivery form */}
              <form onSubmit={handleCheckout} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--color-white)' }}>
                    Delivery Details
                  </h2>
                  {/* Show signed-in indicator OR back-to-gate link for guests */}
                  {user ? (
                    <span
                      className="font-sans text-xs px-3 py-1 rounded-sm flex items-center gap-1.5"
                      style={{ background: 'rgba(73,1,1,0.4)', color: 'var(--color-gold-light)', border: '1px solid var(--color-red-dark)' }}
                    >
                      <UserIcon size={11} /> {user.email}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStep('gate')}
                      className="font-sans text-xs underline cursor-pointer transition-colors hover:text-white"
                      style={{ color: 'var(--color-grey)' }}
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="customerName" className="block font-sans text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-grey)' }}>
                      Full Name *
                    </label>
                    <input
                      id="customerName" name="customerName" type="text" required
                      value={form.customerName} onChange={change}
                      placeholder="Akosua Mensah"
                      className="input-field"
                      autoComplete="name"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block font-sans text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-grey)' }}>
                        Email *
                      </label>
                      <input
                        id="email" name="email" type="email" required
                        value={form.email} onChange={change}
                        placeholder="you@email.com"
                        className="input-field"
                        autoComplete="email"
                        readOnly={!!user}
                        style={user ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block font-sans text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-grey)' }}>
                        Phone *
                      </label>
                      <input
                        id="phone" name="phone" type="tel" required
                        value={form.phone} onChange={change}
                        placeholder="+233 XX XXX XXXX"
                        className="input-field"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block font-sans text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-grey)' }}>
                      Delivery Address *
                    </label>
                    <textarea
                      id="address" name="address" required rows={3}
                      value={form.address} onChange={change}
                      placeholder="Street, area, city, Ghana"
                      className="input-field resize-none"
                      autoComplete="street-address"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? <><SpinnerIcon /> Processing…</> : <><PaystackIcon /> Pay ₵{subtotal.toLocaleString('en-GH')} with Paystack</>}
                </button>

                <p className="font-sans text-xs text-center" style={{ color: 'var(--color-grey)' }}>
                  Secured by Paystack. Your payment information is encrypted.
                </p>
              </form>

              {/* Order summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="surface-card p-6 space-y-4 h-fit"
              >
                <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-white)' }}>
                  Order Summary
                </h2>
                <div style={{ height: '1px', background: 'rgba(89,87,87,0.3)' }} />
                <ul className="space-y-3">
                  {items.map(item => (
                    <li key={item.id} className="flex items-start gap-3">
                      <div className="w-12 h-14 flex-shrink-0 overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                        <img src={item.imageUrl || 'https://placehold.co/48x56?text=HNB'} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-xs leading-snug" style={{ color: 'var(--color-white)' }}>{item.name}</p>
                        <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--color-grey)' }}>Qty: {item.quantity}</p>
                      </div>
                      <span className="price-tag text-sm flex-shrink-0">₵{(item.price * item.quantity).toLocaleString('en-GH')}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ height: '1px', background: 'rgba(89,87,87,0.3)' }} />
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm" style={{ color: 'var(--color-grey)' }}>Subtotal</span>
                  <span className="price-tag text-xl font-bold">₵{subtotal.toLocaleString('en-GH')}</span>
                </div>
                <p className="font-sans text-xs" style={{ color: 'var(--color-grey)' }}>
                  Delivery fee arranged after order confirmation.
                </p>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  )
}

// ── Icons ─────────────────────────────────────────────────────
const SpinnerIcon = () => (
  <svg aria-hidden="true" className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
)
const SmallSpinner = () => (
  <svg aria-hidden="true" className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
  </svg>
)
const PaystackIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)
const UserIcon = ({ size = 16 }) => (
  <svg aria-hidden="true" style={{ pointerEvents: 'none', display: 'block', flexShrink: 0 }} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const GuestIcon = () => (
  <svg aria-hidden="true" style={{ pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-gold-deep)' }}>
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
  </svg>
)
const ChevronIcon = () => (
  <svg aria-hidden="true" style={{ pointerEvents: 'none', marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="var(--color-grey)">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const BackIcon = () => (
  <svg aria-hidden="true" style={{ pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="var(--color-grey)">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const GoogleIcon = () => (
  <svg aria-hidden="true" style={{ pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 01-5.279-5.28 5.27 5.27 0 015.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 00-8.934 8.934 8.907 8.907 0 008.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>
  </svg>
)
