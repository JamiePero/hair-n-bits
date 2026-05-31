import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@hairnbits.com'

export default function AuthPage() {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'   // where to send regular users after login

  const [tab, setTab]   = useState('signin')       // 'signin' | 'signup'
  const [busy, setBusy] = useState(false)

  // Sign-in form state
  const [siEmail, setSiEmail] = useState('')
  const [siPass,  setSiPass]  = useState('')

  // Sign-up form state
  const [suName,    setSuName]    = useState('')
  const [suEmail,   setSuEmail]   = useState('')
  const [suPass,    setSuPass]    = useState('')
  const [suConfirm, setSuConfirm] = useState('')

  function redirectAfterAuth(email) {
    if (email === ADMIN_EMAIL) {
      navigate('/admin', { replace: true })
    } else {
      navigate(from, { replace: true })
    }
  }

  // ── Google ───────────────────────────────────────
  async function handleGoogle() {
    setBusy(true)
    try {
      const cred = await loginWithGoogle()
      redirectAfterAuth(cred.user.email)
    } catch (err) {
      toast.error('Google sign-in failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  // ── Sign In ──────────────────────────────────────
  async function handleSignIn(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const cred = await loginWithEmail(siEmail, siPass)
      toast.success('Welcome back!')
      redirectAfterAuth(cred.user.email)
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Incorrect email or password.'
        : err.code === 'auth/user-not-found'
          ? 'No account found with that email.'
          : 'Sign in failed. Please try again.'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  // ── Sign Up ──────────────────────────────────────
  async function handleSignUp(e) {
    e.preventDefault()
    if (suPass !== suConfirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (suPass.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      const cred = await signUpWithEmail(suName, suEmail, suPass)
      toast.success(`Welcome, ${suName || 'friend'}! 🎉`)
      redirectAfterAuth(cred.user.email)
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with that email already exists.'
        : err.code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : 'Sign up failed. Please try again.'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(73,1,1,0.35) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo / brand */}
        <Link to="/" className="block text-center mb-8">
          <span className="font-display text-2xl font-bold" style={{ color: 'var(--color-white)' }}>
            Hair <span style={{ color: 'var(--color-gold-light)' }}>'N'</span> Bits
          </span>
        </Link>

        {/* Card */}
        <div className="surface-card p-8">
          {/* Tab switcher */}
          <div
            className="flex mb-8 rounded-sm overflow-hidden"
            style={{ border: '1px solid rgba(89,87,87,0.4)' }}
          >
            {[['signin', 'Sign In'], ['signup', 'Create Account']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className="flex-1 py-2.5 font-sans text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer"
                style={{
                  background: tab === key ? 'var(--color-red-primary)' : 'transparent',
                  color:      tab === key ? '#fff' : 'var(--color-grey)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Google button — always visible */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="btn-outline w-full py-3 flex items-center justify-center gap-2 mb-5 disabled:opacity-50"
          >
            {busy ? <SmallSpinner /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="relative mb-5">
            <div style={{ height: '1px', background: 'rgba(89,87,87,0.4)' }} />
            <span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 font-sans text-xs"
              style={{ background: 'var(--surface-2)', color: 'var(--color-grey)' }}
            >
              or
            </span>
          </div>

          {/* Animated form swap */}
          <AnimatePresence mode="wait">
            {tab === 'signin' ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x:  16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <Field id="si-email" label="Email" type="email" required
                  value={siEmail} onChange={e => setSiEmail(e.target.value)}
                  placeholder="you@email.com" autoComplete="email" />

                <Field id="si-pass" label="Password" type="password" required
                  value={siPass} onChange={e => setSiPass(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password" />

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {busy ? <SmallSpinner /> : null}
                  Sign In
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                <Field id="su-name" label="Full Name" type="text" required
                  value={suName} onChange={e => setSuName(e.target.value)}
                  placeholder="Akosua Mensah" autoComplete="name" />

                <Field id="su-email" label="Email" type="email" required
                  value={suEmail} onChange={e => setSuEmail(e.target.value)}
                  placeholder="you@email.com" autoComplete="email" />

                <Field id="su-pass" label="Password" type="password" required
                  value={suPass} onChange={e => setSuPass(e.target.value)}
                  placeholder="Min. 6 characters" autoComplete="new-password" />

                <Field id="su-confirm" label="Confirm Password" type="password" required
                  value={suConfirm} onChange={e => setSuConfirm(e.target.value)}
                  placeholder="Repeat password" autoComplete="new-password" />

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {busy ? <SmallSpinner /> : null}
                  Create Account
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer note */}
        <p className="text-center font-sans text-xs mt-5" style={{ color: 'var(--color-grey)' }}>
          By continuing you agree to our{' '}
          <span style={{ color: 'var(--color-gold-deep)' }}>Terms &amp; Privacy Policy</span>.
        </p>
      </motion.div>
    </main>
  )
}

// ── Reusable field component ──────────────────────────────────
function Field({ id, label, type, value, onChange, placeholder, required, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--color-grey)' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="input-field"
      />
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────
const SmallSpinner = () => (
  <svg aria-hidden="true" className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
  </svg>
)
const GoogleIcon = () => (
  <svg aria-hidden="true" style={{ pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 01-5.279-5.28 5.27 5.27 0 015.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 00-8.934 8.934 8.907 8.907 0 008.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>
  </svg>
)
