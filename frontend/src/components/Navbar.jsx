import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/',      label: 'Home'  },
  { to: '/shop',  label: 'Shop'  },
]

/** Returns up to 2 uppercase initials from a display name or email */
function getInitials(user) {
  if (user?.displayName) {
    return user.displayName
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase()
  }
  // Fallback: first letter of email
  return (user?.email?.[0] ?? '?').toUpperCase()
}

export default function Navbar() {
  const { itemCount, setIsOpen } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function onOutsideClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [profileOpen])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[60] transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(0,0,0,0.92)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(89,87,87,0.3)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span
              className="font-display text-xl font-bold tracking-tight"
              style={{ color: 'var(--color-white)' }}
            >
              Hair <span style={{ color: 'var(--color-gold-light)' }}>'N'</span> Bits
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `font-sans text-sm tracking-wider uppercase transition-colors duration-200 ${
                    isActive
                      ? 'text-[var(--color-gold-light)]'
                      : 'text-[var(--color-white)] hover:text-[var(--color-red-bright)]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `font-sans text-sm tracking-wider uppercase transition-colors duration-200 ${
                    isActive
                      ? 'text-[var(--color-gold-light)]'
                      : 'text-[var(--color-grey)] hover:text-[var(--color-gold-deep)]'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-sm transition-colors cursor-pointer hover:bg-white/5"
              aria-label={`Cart — ${itemCount} items`}
            >
              <CartIcon />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold font-sans"
                  style={{ background: 'var(--color-red-primary)', color: 'var(--color-white)' }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* User avatar / Sign In — desktop */}
            <div className="hidden md:block relative" ref={profileRef}>
              {user ? (
                <>
                  {/* Avatar button */}
                  <button
                    type="button"
                    onClick={() => setProfileOpen(v => !v)}
                    className="flex items-center gap-2 cursor-pointer group"
                    aria-label="Account menu"
                    aria-expanded={profileOpen}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-sans select-none transition-all duration-200 group-hover:ring-2"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-red-mid), var(--color-red-dark))',
                        color: 'var(--color-gold-light)',
                        ringColor: 'var(--color-gold-deep)',
                        outline: profileOpen ? '2px solid var(--color-gold-deep)' : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={getInitials(user)}
                          className="w-full h-full rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        getInitials(user)
                      )}
                    </span>
                    {/* Small chevron */}
                    <svg
                      aria-hidden="true"
                      style={{
                        pointerEvents: 'none',
                        transition: 'transform 0.2s',
                        transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: 'var(--color-grey)',
                      }}
                      width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        key="profile-dropdown"
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1     }}
                        exit={{    opacity: 0, y: -6, scale: 0.97  }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-3 w-56 py-1 z-[61]"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid rgba(89,87,87,0.4)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        }}
                        role="menu"
                      >
                        {/* Email row */}
                        <div
                          className="px-4 py-3"
                          style={{ borderBottom: '1px solid rgba(89,87,87,0.3)' }}
                        >
                          <p className="font-sans text-xs" style={{ color: 'var(--color-grey)' }}>
                            Signed in as
                          </p>
                          <p
                            className="font-sans text-sm font-medium mt-0.5 truncate"
                            style={{ color: 'var(--color-white)' }}
                          >
                            {user.displayName || user.email}
                          </p>
                          {user.displayName && (
                            <p className="font-sans text-xs mt-0.5 truncate" style={{ color: 'var(--color-grey)' }}>
                              {user.email}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        {isAdmin && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => { setProfileOpen(false); navigate('/auth') }}
                            className="w-full text-left px-4 py-2.5 font-sans text-sm cursor-pointer transition-colors hover:bg-white/5 flex items-center gap-2"
                            style={{ color: 'var(--color-gold-deep)' }}
                          >
                            <ShieldIcon /> Admin Panel
                          </button>
                        )}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => { logout(); setProfileOpen(false) }}
                          className="w-full text-left px-4 py-2.5 font-sans text-sm cursor-pointer transition-colors hover:bg-white/5 flex items-center gap-2"
                          style={{ color: 'var(--color-red-bright)' }}
                        >
                          <SignOutIcon /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 cursor-pointer"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <div className="w-5 space-y-1">
                <span
                  className="block h-px bg-white transition-all duration-200"
                  style={{ transform: mobileOpen ? 'rotate(45deg) translate(3px, 3px)' : '' }}
                />
                <span
                  className="block h-px bg-white transition-all duration-200"
                  style={{ opacity: mobileOpen ? 0 : 1 }}
                />
                <span
                  className="block h-px bg-white transition-all duration-200"
                  style={{ transform: mobileOpen ? 'rotate(-45deg) translate(3px, -3px)' : '' }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.95)', borderTop: '1px solid rgba(89,87,87,0.3)' }}
            >
              <div className="flex flex-col px-6 py-4 gap-4">
                {NAV_LINKS.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `font-sans text-sm tracking-wider uppercase py-1 ${
                        isActive ? 'text-[var(--color-gold-light)]' : 'text-white'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
                {isAdmin && (
                  <NavLink to="/admin" onClick={() => setMobileOpen(false)} className="font-sans text-sm tracking-wider uppercase py-1 text-[var(--color-gold-deep)]">
                    Admin
                  </NavLink>
                )}
                {user ? (
                  <div className="mt-2 pt-4" style={{ borderTop: '1px solid rgba(89,87,87,0.3)' }}>
                    {/* Mini profile row */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold font-sans overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-red-mid), var(--color-red-dark))',
                          color: 'var(--color-gold-light)',
                        }}
                      >
                        {user.photoURL
                          ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          : getInitials(user)
                        }
                      </span>
                      <div className="min-w-0">
                        {user.displayName && (
                          <p className="font-sans text-sm font-medium truncate" style={{ color: 'var(--color-white)' }}>{user.displayName}</p>
                        )}
                        <p className="font-sans text-xs truncate" style={{ color: 'var(--color-grey)' }}>{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { logout(); setMobileOpen(false) }}
                      className="btn-outline text-xs py-2 w-full flex items-center justify-center gap-2"
                    >
                      <SignOutIcon /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { navigate('/auth'); setMobileOpen(false) }}
                    className="btn-outline text-xs py-2 mt-2 w-full"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}

function CartIcon() {
  return (
    <svg aria-hidden="true" style={{ pointerEvents: 'none', display: 'block' }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg aria-hidden="true" style={{ pointerEvents: 'none', display: 'block', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" style={{ pointerEvents: 'none', display: 'block', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
