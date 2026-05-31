import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface-1)', borderTop: '1px solid rgba(89,87,87,0.3)' }} className="mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <h3 className="font-display text-2xl font-bold mb-3" style={{ color: 'var(--color-white)' }}>
            Hair <span style={{ color: 'var(--color-gold-light)' }}>'N'</span> Bits
          </h3>
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--color-grey)' }}>
            Your beauty, beautifully stocked. Premium wigs, accessories & fashion for the modern woman.
          </p>
          {/* Social placeholders */}
          <div className="flex gap-3 mt-5">
            {['Instagram', 'Facebook', 'TikTok'].map(s => (
              <a
                key={s}
                href="#"
                aria-label={s}
                className="w-9 h-9 rounded-sm flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110"
                style={{ background: 'var(--surface-3)', color: 'var(--color-grey)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-gold-light)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-grey)'}
              >
                <span className="font-sans text-xs font-medium">{s[0]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-sans font-semibold text-sm tracking-widest uppercase mb-4" style={{ color: 'var(--color-gold-deep)' }}>
            Quick Links
          </h4>
          <ul className="space-y-2">
            {[['/', 'Home'], ['/shop', 'Shop'], ['/shop?cat=wigs', 'Wigs'], ['/shop?cat=jewelry', 'Jewelry']].map(([to, label]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="font-sans text-sm transition-colors duration-200 hover:text-[var(--color-red-bright)]"
                  style={{ color: 'var(--color-grey)' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-sans font-semibold text-sm tracking-widest uppercase mb-4" style={{ color: 'var(--color-gold-deep)' }}>
            Contact
          </h4>
          <ul className="space-y-3 font-sans text-sm" style={{ color: 'var(--color-grey)' }}>
            <li className="flex items-start gap-2">
              <LocationIcon />
              <span>Accra, Ghana</span>
            </li>
            <li className="flex items-start gap-2">
              <PhoneIcon />
              <span>+233 XX XXX XXXX</span>
            </li>
            <li className="flex items-start gap-2">
              <MailIcon />
              <span>hello@hairnbits.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: '1px solid rgba(89,87,87,0.2)' }}
      >
        <p className="font-sans text-xs" style={{ color: 'var(--color-grey)' }}>
          © {new Date().getFullYear()} Hair 'N' Bits. All rights reserved.
        </p>
        <p className="font-sans text-xs" style={{ color: 'var(--color-grey)' }}>
          Prices in <span style={{ color: 'var(--color-gold-deep)' }}>GHS (₵)</span>
        </p>
      </div>
    </footer>
  )
}

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.06 2.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
)

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
