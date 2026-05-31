import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(73,1,1,0.3), transparent)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        <h1
          className="font-display font-bold leading-none mb-4"
          style={{ fontSize: 'clamp(6rem, 20vw, 14rem)', color: 'rgba(73,1,1,0.4)' }}
        >
          404
        </h1>
        <h2 className="font-display text-3xl font-semibold -mt-8 mb-4" style={{ color: 'var(--color-white)' }}>
          Page Not Found
        </h2>
        <p className="font-sans text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--color-grey)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/shop" className="btn-outline">Browse Shop</Link>
        </div>
      </motion.div>
    </main>
  )
}
