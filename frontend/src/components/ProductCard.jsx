import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
  wigs:       'Wigs',
  'hair-mesh':'Hair Mesh',
  beads:      'Beads',
  dresses:    'Dresses',
  shoes:      'Shoes',
  jewelry:    'Jewelry',
}

export default memo(function ProductCard({ product, index = 0 }) {
  const { dispatch, setIsOpen } = useCart()

  function addToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    dispatch({ type: 'ADD_ITEM', payload: { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, category: product.category } })
    toast.success(`${product.name} added to cart`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #B40808' },
      iconTheme: { primary: '#B40808', secondary: '#fff' },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link to={`/product/${product.id}`} className="block card-product group overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/5] bg-[var(--surface-3)]">
          <img
            src={product.imageUrl || `https://placehold.co/400x500?text=Hair+N+Bits`}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Red overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(73,1,1,0.7) 0%, transparent 60%)' }}
          />
          {/* Category badge */}
          <span className="absolute top-3 left-3 badge-category">
            {CATEGORY_LABELS[product.category] || product.category}
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-sans font-medium text-sm leading-snug mb-2 line-clamp-2" style={{ color: 'var(--color-white)' }}>
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <span className="price-tag text-base">₵{product.price?.toLocaleString('en-GH')}</span>
            <button
              onClick={addToCart}
              className="p-2 rounded-sm transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
              style={{ background: 'var(--color-red-dark)', color: 'var(--color-white)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-red-primary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-red-dark)'}
              aria-label={`Add ${product.name} to cart`}
            >
              <AddCartIcon />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

function AddCartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
      <line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/>
    </svg>
  )
}
