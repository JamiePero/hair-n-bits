import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function CartDrawer() {
  const { items, subtotal, isOpen, setIsOpen, dispatch } = useCart()

  function removeItem(id, name) {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
    toast(`${name} removed`, {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid #595757' },
    })
  }

  function updateQty(id, qty) {
    dispatch({ type: 'UPDATE_QTY', payload: { id, quantity: qty } })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[55] bg-black/70"
            style={{ backdropFilter: 'blur(4px)' }}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full z-[56] w-full max-w-md flex flex-col"
            style={{ background: 'var(--surface-1)', borderLeft: '1px solid rgba(89,87,87,0.3)' }}
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid rgba(89,87,87,0.3)' }}
            >
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-white)' }}>
                Your Cart
                {items.length > 0 && (
                  <span className="font-sans text-sm font-normal ml-2" style={{ color: 'var(--color-grey)' }}>
                    ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-sm cursor-pointer transition-colors hover:bg-white/5"
                aria-label="Close cart"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                  <EmptyBagIcon />
                  <p className="font-display text-lg" style={{ color: 'var(--color-white)' }}>Your cart is empty</p>
                  <p className="font-sans text-sm" style={{ color: 'var(--color-grey)' }}>
                    Discover our beautiful collection
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn-primary mt-2"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4"
                    style={{ borderBottom: '1px solid rgba(89,87,87,0.2)', paddingBottom: '1rem' }}
                  >
                    {/* Image */}
                    <div className="w-20 h-24 flex-shrink-0 overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                      <img
                        src={item.imageUrl || `https://placehold.co/80x96?text=HNB`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium leading-snug truncate" style={{ color: 'var(--color-white)' }}>
                        {item.name}
                      </p>
                      <p className="price-tag text-sm mt-1">₵{item.price?.toLocaleString('en-GH')}</p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-sm flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
                          style={{ border: '1px solid var(--color-grey)', color: 'var(--color-white)' }}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="font-sans text-sm w-6 text-center" style={{ color: 'var(--color-white)' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-sm flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
                          style={{ border: '1px solid var(--color-grey)', color: 'var(--color-white)' }}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id, item.name)}
                          className="ml-auto p-1 cursor-pointer transition-colors hover:text-[var(--color-red-bright)]"
                          style={{ color: 'var(--color-grey)' }}
                          aria-label={`Remove ${item.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="px-6 py-5 space-y-4"
                style={{ borderTop: '1px solid rgba(89,87,87,0.3)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm" style={{ color: 'var(--color-grey)' }}>Subtotal</span>
                  <span className="price-tag text-lg">₵{subtotal.toLocaleString('en-GH')}</span>
                </div>
                <p className="font-sans text-xs" style={{ color: 'var(--color-grey)' }}>
                  Shipping & taxes calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full text-center block"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-outline w-full text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

const CloseIcon = () => (
  <svg
    aria-hidden="true"
    style={{ pointerEvents: 'none', display: 'block' }}
    width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

const EmptyBagIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-grey)' }}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)
