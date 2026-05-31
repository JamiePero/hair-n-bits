import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from '../components/ProductCard'
import ProductSkeleton from '../components/ProductSkeleton'

const CATEGORIES = [
  { id: 'all',       label: 'All' },
  { id: 'wigs',      label: 'Wigs' },
  { id: 'hair-mesh', label: 'Hair Mesh' },
  { id: 'beads',     label: 'Beads' },
  { id: 'dresses',   label: 'Dresses' },
  { id: 'shoes',     label: 'Shoes' },
  { id: 'jewelry',   label: 'Jewelry' },
]

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low – High' },
  { value: 'price-desc',label: 'Price: High – Low' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeCat  = searchParams.get('cat')  || 'all'
  const activeSort = searchParams.get('sort') || 'newest'

  useEffect(() => {
    async function fetch() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = useMemo(() => {
    let list = activeCat === 'all' ? products : products.filter(p => p.category === activeCat)
    if (activeSort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price)
    if (activeSort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [products, activeCat, activeSort])

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams)
    next.set(key, value)
    setSearchParams(next)
  }

  return (
    <main className="pt-24 min-h-screen">
      {/* Page header */}
      <div
        className="py-14 px-6 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(73,1,1,0.4), var(--color-black))',
          borderBottom: '1px solid rgba(89,87,87,0.3)',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl sm:text-5xl font-bold"
          style={{ color: 'var(--color-white)' }}
        >
          Shop
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-sans text-sm mt-2"
          style={{ color: 'var(--color-grey)' }}
        >
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'} {activeCat !== 'all' ? `in ${CATEGORIES.find(c => c.id === activeCat)?.label}` : ''}
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
        {/* ── Sidebar ───────────────────────────── */}
        {/* Mobile filter toggle */}
        <button
          className="lg:hidden fixed bottom-6 right-6 z-30 btn-primary rounded-full px-5 py-3 shadow-xl"
          onClick={() => setSidebarOpen(v => !v)}
          aria-label="Toggle filters"
        >
          <FilterIcon /> Filters
        </button>

        <AnimatePresence>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <motion.div
              key="filter-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[31] bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <aside
          className={`
            fixed lg:static top-0 left-0 h-full lg:h-auto w-72 lg:w-56 z-[32] lg:z-auto
            flex-shrink-0 flex flex-col gap-8 p-6 lg:p-0
            transition-transform duration-300 lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{
            background: 'var(--surface-1)',
            borderRight: '1px solid rgba(89,87,87,0.3)',
          }}
        >
          {/* Close mobile */}
          <button className="lg:hidden self-end p-2 cursor-pointer" onClick={() => setSidebarOpen(false)} aria-label="Close filters">
            <CloseIcon />
          </button>

          {/* Categories */}
          <div>
            <h3
              className="font-sans text-xs font-semibold tracking-[0.25em] uppercase mb-4"
              style={{ color: 'var(--color-gold-deep)' }}
            >
              Category
            </h3>
            <ul className="space-y-1">
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => { setParam('cat', cat.id); setSidebarOpen(false) }}
                    className={`w-full text-left font-sans text-sm px-3 py-2 rounded-sm transition-all duration-150 cursor-pointer ${
                      activeCat === cat.id
                        ? 'bg-[var(--color-red-dark)] text-[var(--color-gold-light)]'
                        : 'text-[var(--color-grey)] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sort */}
          <div>
            <h3
              className="font-sans text-xs font-semibold tracking-[0.25em] uppercase mb-4"
              style={{ color: 'var(--color-gold-deep)' }}
            >
              Sort By
            </h3>
            <ul className="space-y-1">
              {SORT_OPTIONS.map(opt => (
                <li key={opt.value}>
                  <button
                    onClick={() => { setParam('sort', opt.value); setSidebarOpen(false) }}
                    className={`w-full text-left font-sans text-sm px-3 py-2 rounded-sm transition-all duration-150 cursor-pointer ${
                      activeSort === opt.value
                        ? 'bg-[var(--color-red-dark)] text-[var(--color-gold-light)]'
                        : 'text-[var(--color-grey)] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Product Grid ─────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? <ProductSkeleton count={8} />
              : filtered.length === 0
                ? (
                  <div className="col-span-full text-center py-24">
                    <p className="font-display text-xl mb-2" style={{ color: 'var(--color-white)' }}>
                      No products found
                    </p>
                    <p className="font-sans text-sm" style={{ color: 'var(--color-grey)' }}>
                      Try a different category
                    </p>
                  </div>
                )
                : filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </div>
      </div>
    </main>
  )
}

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
