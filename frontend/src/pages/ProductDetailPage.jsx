import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import ProductSkeleton from '../components/ProductSkeleton'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
  wigs: 'Wigs', 'hair-mesh': 'Hair Mesh', beads: 'Beads',
  dresses: 'Dresses', shoes: 'Shoes', jewelry: 'Jewelry',
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { dispatch, setIsOpen } = useCart()
  const [product, setProduct]   = useState(null)
  const [related, setRelated]   = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setQuantity(1)
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, 'products', id))
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() }
          setProduct(data)
          // Related products
          const relQ = query(
            collection(db, 'products'),
            where('category', '==', data.category),
            limit(5)
          )
          const relSnap = await getDocs(relQ)
          setRelated(
            relSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(p => p.id !== id)
              .slice(0, 4)
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  function addToCart() {
    if (!product) return
    dispatch({ type: 'ADD_ITEM', payload: { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, category: product.category, quantity } })
    toast.success(`${product.name} added to cart`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #B40808' },
      iconTheme: { primary: '#B40808', secondary: '#fff' },
    })
    setIsOpen(true)
  }

  if (loading) {
    return (
      <main className="pt-24 max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="skeleton aspect-[4/5]" />
          <div className="space-y-4 py-4">
            <div className="skeleton h-6 w-1/4" />
            <div className="skeleton h-10 w-3/4" />
            <div className="skeleton h-8 w-1/3" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="pt-32 text-center">
        <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--color-white)' }}>Product not found</h2>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </main>
    )
  }

  return (
    <main className="pt-24 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="font-sans text-xs" style={{ color: 'var(--color-grey)' }}>
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span style={{ color: 'var(--color-white)' }}>{product.name}</span>
        </nav>
      </div>

      {/* Product details */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-3)' }}
        >
          <img
            src={product.imageUrl || `https://placehold.co/600x750?text=Hair+N+Bits`}
            alt={product.name}
            className="w-full object-cover"
            style={{ aspectRatio: '4/5' }}
          />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 py-4"
        >
          {/* Category badge */}
          <span className="badge-category self-start">
            {CATEGORY_LABELS[product.category] || product.category}
          </span>

          {/* Name */}
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight" style={{ color: 'var(--color-white)' }}>
            {product.name}
          </h1>

          {/* Price */}
          <p className="price-tag text-3xl font-bold">
            ₵{product.price?.toLocaleString('en-GH')}
          </p>

          {/* Description */}
          {product.description && (
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {product.description}
            </p>
          )}

          {/* Stock */}
          {product.stock !== undefined && (
            <p className="font-sans text-xs" style={{ color: product.stock > 0 ? '#4ade80' : 'var(--color-red-bright)' }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          )}

          <div style={{ height: '1px', background: 'rgba(89,87,87,0.3)' }} />

          {/* Quantity selector */}
          <div className="flex items-center gap-4">
            <span className="font-sans text-sm" style={{ color: 'var(--color-grey)' }}>Quantity</span>
            <div className="flex items-center gap-0" style={{ border: '1px solid var(--surface-4)' }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5 font-sans text-lg"
                style={{ color: 'var(--color-white)' }}
                aria-label="Decrease"
              >
                −
              </button>
              <span
                className="w-10 h-10 flex items-center justify-center font-sans text-sm"
                style={{ borderLeft: '1px solid var(--surface-4)', borderRight: '1px solid var(--surface-4)', color: 'var(--color-white)' }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5 font-sans text-lg"
                style={{ color: 'var(--color-white)' }}
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="btn-gold w-full py-4 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </motion.div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section
          className="py-20"
          style={{ background: 'var(--surface-1)', borderTop: '1px solid rgba(89,87,87,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display text-3xl font-bold mb-10" style={{ color: 'var(--color-white)' }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
