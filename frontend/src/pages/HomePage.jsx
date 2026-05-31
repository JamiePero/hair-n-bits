import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from '../components/ProductCard'
import ProductSkeleton from '../components/ProductSkeleton'

const CATEGORIES = [
  {
    id: 'wigs',
    label: 'Wigs',
    img: 'https://res.cloudinary.com/dovaxxktb/image/upload/preview_fqpzc6',
  },
  {
    id: 'hair-mesh',
    label: 'Hair Mesh',
    img: 'https://res.cloudinary.com/dovaxxktb/image/upload/preview_1_f5nads',
  },
  {
    id: 'beads',
    label: 'Beads',
    img: 'https://res.cloudinary.com/dovaxxktb/image/upload/preview_2_kstg5b',
  },
  {
    id: 'dresses',
    label: 'Dresses',
    split: true,
    imgLeft:  'https://res.cloudinary.com/dovaxxktb/image/upload/d8456f2d95f4a974ffb4c48f8c8f14ff_u2sz8j',
    imgRight: 'https://res.cloudinary.com/dovaxxktb/image/upload/preview_3_gqntht',
  },
  {
    id: 'shoes',
    label: 'Shoes',
    split: true,
    imgLeft:  'https://res.cloudinary.com/dovaxxktb/image/upload/preview_4_dmrjj6',
    imgRight: 'https://res.cloudinary.com/dovaxxktb/image/upload/preview_5_ntzsmg',
  },
  {
    id: 'jewelry',
    label: 'Jewelry',
    img: 'https://res.cloudinary.com/dovaxxktb/image/upload/preview_6_dveyee',
  },
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8))
        const snap = await getDocs(q)
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <main>
      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(73,1,1,0.7) 0%, rgba(0,0,0,1) 70%)',
          }}
        />
        {/* Decorative lines */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(180,8,8,0.3) 80px, rgba(180,8,8,0.3) 81px)',
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-sans text-xs tracking-[0.3em] uppercase mb-6"
            style={{ color: 'var(--color-gold-deep)' }}
          >
            Premium Beauty &amp; Fashion
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-none mb-6"
            style={{ color: 'var(--color-white)' }}
          >
            Hair{' '}
            <em className="not-italic" style={{ color: 'var(--color-gold-light)' }}>'N'</em>
            <br />Bits
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-display italic text-xl sm:text-2xl mb-10"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            Your beauty, beautifully stocked.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/shop" className="btn-gold text-base px-10 py-4 font-semibold">
              Shop Now
            </Link>
            <Link to="/shop" className="btn-outline text-base px-10 py-4">
              Explore Collection
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="font-sans text-xs tracking-widest uppercase" style={{ color: 'var(--color-grey)' }}>
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="w-px h-8"
              style={{ background: 'linear-gradient(to bottom, var(--color-grey), transparent)' }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="font-sans text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--color-gold-deep)' }}>
            Browse by
          </p>
          <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--color-white)' }}>
            Our Collections
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <Link
                to={`/shop?cat=${cat.id}`}
                className="group block overflow-hidden cursor-pointer"
                style={{ border: '1px solid var(--surface-3)' }}
              >
                {/* ── Image area ── */}
                <div className="relative aspect-square overflow-hidden">

                  {cat.split ? (
                    /* Split-frame: left half + right half side by side */
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 h-full overflow-hidden">
                        <img
                          src={cat.imgLeft}
                          alt={`${cat.label} — left`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      {/* 1 px divider */}
                      <div className="w-px h-full flex-shrink-0" style={{ background: 'rgba(0,0,0,0.6)' }} aria-hidden="true" />
                      <div className="w-1/2 h-full overflow-hidden">
                        <img
                          src={cat.imgRight}
                          alt={`${cat.label} — right`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Single full-bleed photo */
                    <img
                      src={cat.img}
                      alt={cat.label}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}

                  {/* Dark overlay: 0.4 at rest, fades to 0.2 on hover */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-50"
                    style={{ background: 'rgba(0,0,0,0.4)' }}
                    aria-hidden="true"
                  />

                  {/* Centered gold label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className="font-display text-base font-bold tracking-wider text-center leading-tight px-2"
                      style={{
                        color: '#F4CD59',
                        textShadow: '0 1px 6px rgba(0,0,0,0.8)',
                      }}
                    >
                      {cat.label}
                    </span>
                  </div>
                </div>

                {/* Bottom label strip */}
                <div className="px-3 py-2 text-center" style={{ background: '#000000' }}>
                  <span className="font-sans text-xs font-medium tracking-widest uppercase" style={{ color: '#FFFFFF' }}>
                    {cat.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────── */}
      <section
        className="py-24"
        style={{ background: 'var(--surface-1)' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14"
          >
            <div>
              <p className="font-sans text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--color-gold-deep)' }}>
                Hand-picked for you
              </p>
              <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--color-white)' }}>
                Featured Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="font-sans text-sm tracking-wider uppercase transition-colors hover:text-[var(--color-gold-light)]"
              style={{ color: 'var(--color-grey)' }}
            >
              View All →
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? <ProductSkeleton count={8} />
              : products.length === 0
                ? <p className="col-span-full text-center font-sans text-sm py-12" style={{ color: 'var(--color-grey)' }}>
                    No products yet. Add some via the admin panel.
                  </p>
                : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </div>
      </section>

      {/* ── Brand statement ───────────────────────── */}
      <section className="py-28 px-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(73,1,1,0.35) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-display italic text-3xl sm:text-4xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            "Where every strand tells a story, and every accessory writes the chapter."
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="h-px mx-auto mt-8"
            style={{ background: 'var(--color-gold-deep)' }}
          />
        </div>
      </section>
    </main>
  )
}
