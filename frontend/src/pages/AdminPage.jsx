import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, getDocs, addDoc, doc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CLOUDINARY_CLOUD  = 'dovaxxktb'
const CLOUDINARY_PRESET = 'hair-n-bits'
const CLOUDINARY_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`

async function uploadToCloudinary(file) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || 'Image upload failed')
  }
  const data = await res.json()
  return data.secure_url
}

const CATEGORIES = ['wigs', 'hair-mesh', 'beads', 'dresses', 'shoes', 'jewelry']
const STATUS_OPTS = ['pending', 'paid', 'shipped', 'delivered']
const TABS = ['dashboard', 'products', 'orders']

const EMPTY_FORM = { name: '', category: 'wigs', price: '', stock: '', description: '', imageUrl: '' }

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]           = useState('dashboard')
  const [products, setProducts] = useState([])
  const [orders, setOrders]     = useState([])
  const [loadingData, setLoadingData] = useState(false)

  // Product form
  const [editingProduct, setEditingProduct] = useState(null)
  const [formOpen, setFormOpen]  = useState(false)
  const [form, setForm]          = useState(EMPTY_FORM)
  const [imgFile, setImgFile]    = useState(null)
  const [imgPreview, setImgPreview] = useState('')
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const fileInputRef = useRef(null)

  /* ── Load data ─────────────────────────────── */
  useEffect(() => {
    if (!isAdmin) return
    setLoadingData(true)
    Promise.all([
      getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'orders'),   orderBy('createdAt', 'desc'))),
    ]).then(([pSnap, oSnap]) => {
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }).catch(console.error)
    .finally(() => setLoadingData(false))
  }, [isAdmin])

  /* ── Auth guard ────────────────────────────── */
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><SpinnerIcon /></div>
  }

  if (!user) {
    // Not signed in → send to login, remember they wanted /admin
    navigate('/auth', { replace: true, state: { from: '/admin' } })
    return null
  }

  if (!isAdmin) {
    // Signed in but not admin → back to home
    navigate('/', { replace: true })
    return null
  }

  /* ── Dashboard stats ───────────────────────── */
  const totalRevenue  = orders.filter(o => ['paid','shipped','delivered'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  /* ── Product CRUD ──────────────────────────── */
  function openNewProduct() {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setImgFile(null)
    setImgPreview('')
    setFormOpen(true)
  }

  function openEditProduct(p) {
    setEditingProduct(p)
    setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, description: p.description || '', imageUrl: p.imageUrl || '' })
    setImgFile(null)
    setImgPreview(p.imageUrl || '')
    setFormOpen(true)
  }

  function handleImagePick(e) {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    // Show instant local preview
    const objectUrl = URL.createObjectURL(file)
    setImgPreview(objectUrl)
  }

  async function saveProduct(e) {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl = form.imageUrl

      // Upload to Cloudinary if a new file was picked
      if (imgFile) {
        setUploading(true)
        toast.loading('Uploading photo…', { id: 'img-upload' })
        try {
          imageUrl = await uploadToCloudinary(imgFile)
          toast.success('Photo uploaded!', { id: 'img-upload' })
        } catch (uploadErr) {
          toast.error(uploadErr.message, { id: 'img-upload' })
          setSaving(false)
          setUploading(false)
          return
        } finally {
          setUploading(false)
        }
      }
      const data = {
        name:        form.name,
        category:    form.category,
        price:       Number(form.price),
        stock:       Number(form.stock),
        description: form.description,
        imageUrl,
      }
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data)
        setProducts(ps => ps.map(p => p.id === editingProduct.id ? { ...p, ...data } : p))
        toast.success('Product updated')
      } else {
        const ref2 = await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })
        setProducts(ps => [{ id: ref2.id, ...data, createdAt: new Date() }, ...ps])
        toast.success('Product added')
      }
      setFormOpen(false)
    } catch (err) {
      toast.error('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(id, name) {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await deleteDoc(doc(db, 'products', id))
      setProducts(ps => ps.filter(p => p.id !== id))
      toast.success('Product deleted')
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      await updateDoc(doc(db, 'orders', id), { status })
      setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
      toast.success('Order status updated')
    } catch (err) {
      toast.error('Update failed')
    }
  }

  /* ── Render ─────────────────────────────────── */
  return (
    <main className="pt-20 min-h-screen" style={{ background: 'var(--surface-1)' }}>
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center justify-between"
        style={{ background: 'var(--color-black)', borderBottom: '1px solid rgba(89,87,87,0.3)' }}
      >
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-white)' }}>Admin Panel</h1>
          <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--color-grey)' }}>Hair 'N' Bits Management</p>
        </div>
        <span className="font-sans text-xs px-3 py-1 rounded-sm" style={{ background: 'rgba(73,1,1,0.5)', color: 'var(--color-gold-light)', border: '1px solid var(--color-red-dark)' }}>
          {user.email}
        </span>
      </div>

      {/* Tabs */}
      <div className="px-6 flex gap-1" style={{ borderBottom: '1px solid rgba(89,87,87,0.3)', background: 'var(--color-black)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-sans text-sm tracking-wider uppercase px-5 py-4 cursor-pointer transition-all duration-150 border-b-2 ${
              tab === t
                ? 'border-[var(--color-red-primary)] text-white'
                : 'border-transparent text-[var(--color-grey)] hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loadingData ? (
          <div className="flex items-center justify-center py-24"><SpinnerIcon /></div>
        ) : (
          <>
            {/* ── Dashboard ── */}
            {tab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: 'Total Orders', value: orders.length, color: 'var(--color-red-primary)' },
                  { label: 'Total Revenue', value: `₵${totalRevenue.toLocaleString('en-GH')}`, color: 'var(--color-gold-deep)' },
                  { label: 'Pending Orders', value: pendingOrders, color: 'var(--color-red-bright)' },
                ].map(stat => (
                  <div key={stat.label} className="surface-card p-6">
                    <p className="font-sans text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--color-grey)' }}>{stat.label}</p>
                    <p className="font-display text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── Products ── */}
            {tab === 'products' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--color-white)' }}>
                    Products ({products.length})
                  </h2>
                  <button onClick={openNewProduct} className="btn-primary">+ Add Product</button>
                </div>

                {/* Table */}
                <div className="surface-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full font-sans text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(89,87,87,0.3)', background: 'var(--surface-3)' }}>
                          {['Image', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-gold-deep)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid rgba(89,87,87,0.15)' }} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3">
                              <div className="w-10 h-12 overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                                <img src={p.imageUrl || 'https://placehold.co/40x48?text=HNB'} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--color-white)' }}>{p.name}</td>
                            <td className="px-4 py-3"><span className="badge-category">{p.category}</span></td>
                            <td className="px-4 py-3 price-tag">₵{p.price?.toLocaleString('en-GH')}</td>
                            <td className="px-4 py-3" style={{ color: p.stock > 0 ? '#4ade80' : 'var(--color-red-bright)' }}>{p.stock}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => openEditProduct(p)} className="btn-outline text-xs px-3 py-1.5">Edit</button>
                                <button onClick={() => deleteProduct(p.id, p.name)} className="font-sans text-xs px-3 py-1.5 rounded-sm cursor-pointer transition-colors hover:bg-red-900/50" style={{ border: '1px solid var(--color-red-dark)', color: 'var(--color-red-bright)' }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {products.length === 0 && (
                      <p className="text-center py-12 font-sans text-sm" style={{ color: 'var(--color-grey)' }}>No products yet. Add your first product!</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Orders ── */}
            {tab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: 'var(--color-white)' }}>
                  Orders ({orders.length})
                </h2>
                <div className="space-y-4">
                  {orders.length === 0 && (
                    <p className="text-center py-12 font-sans text-sm" style={{ color: 'var(--color-grey)' }}>No orders yet.</p>
                  )}
                  {orders.map(order => (
                    <div key={order.id} className="surface-card p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="font-sans font-medium" style={{ color: 'var(--color-white)' }}>{order.customerName}</p>
                          <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--color-grey)' }}>{order.email} · {order.phone}</p>
                          <p className="font-mono text-xs mt-1" style={{ color: 'var(--color-gold-deep)' }}>#{order.id.slice(0, 12)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="price-tag text-lg">₵{order.total?.toLocaleString('en-GH')}</span>
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                            className="font-sans text-xs px-3 py-2 rounded-sm cursor-pointer outline-none"
                            style={{
                              background: 'var(--surface-3)',
                              border: '1px solid var(--surface-4)',
                              color: statusColor(order.status),
                            }}
                          >
                            {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                          </select>
                        </div>
                      </div>
                      <p className="font-sans text-xs mb-2" style={{ color: 'var(--color-grey)' }}>
                        {order.address}
                      </p>
                      <ul className="space-y-1">
                        {(order.items || []).map((item, i) => (
                          <li key={i} className="font-sans text-xs flex justify-between" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>₵{(item.price * item.quantity).toLocaleString('en-GH')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ── Product Form Modal ── */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[40] bg-black/80"
              onClick={() => setFormOpen(false)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[41] flex items-center justify-center p-6"
            >
              <form
                onSubmit={saveProduct}
                className="surface-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-5"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-semibold" style={{ color: 'var(--color-white)' }}>
                    {editingProduct ? 'Edit Product' : 'New Product'}
                  </h3>
                  <button type="button" onClick={() => setFormOpen(false)} className="p-2 cursor-pointer hover:bg-white/5 rounded-sm">
                    <CloseIcon />
                  </button>
                </div>

                {[
                  { name: 'name',        label: 'Product Name', type: 'text',   required: true, placeholder: 'Brazilian Straight Wig 18"' },
                  { name: 'price',       label: 'Price (GHS)',  type: 'number', required: true, placeholder: '450', min: 0, step: '0.01' },
                  { name: 'stock',       label: 'Stock Qty',    type: 'number', required: true, placeholder: '10', min: 0 },
                ].map(f => (
                  <div key={f.name}>
                    <label htmlFor={`pf-${f.name}`} className="block font-sans text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--color-grey)' }}>{f.label}</label>
                    <input
                      id={`pf-${f.name}`}
                      name={f.name}
                      type={f.type}
                      required={f.required}
                      min={f.min}
                      step={f.step}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={e => setForm(v => ({ ...v, [f.name]: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="pf-cat" className="block font-sans text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--color-grey)' }}>Category</label>
                  <select
                    id="pf-cat"
                    value={form.category}
                    onChange={e => setForm(v => ({ ...v, category: e.target.value }))}
                    className="input-field cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="pf-desc" className="block font-sans text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--color-grey)' }}>Description</label>
                  <textarea
                    id="pf-desc"
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
                    className="input-field resize-none"
                    placeholder="Describe the product..."
                  />
                </div>

                {/* ── Cloudinary image upload ── */}
                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--color-grey)' }}>
                    Product Photo
                  </label>

                  {/* Hidden real file input */}
                  <input
                    ref={fileInputRef}
                    id="pf-img"
                    type="file"
                    accept="image/*"
                    onChange={handleImagePick}
                    className="sr-only"
                    aria-label="Upload product photo"
                  />

                  {imgPreview ? (
                    /* ── Preview state ── */
                    <div className="relative w-full aspect-[4/3] overflow-hidden group"
                      style={{ background: 'var(--surface-3)', border: '2px solid var(--color-red-dark)' }}>
                      <img
                        src={imgPreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Change photo overlay */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                        style={{ background: 'rgba(0,0,0,0.65)' }}
                      >
                        <CameraIcon />
                        <span className="font-sans text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-white)' }}>
                          Change Photo
                        </span>
                      </button>
                      {/* Remove photo */}
                      <button
                        type="button"
                        onClick={() => { setImgFile(null); setImgPreview(''); setForm(v => ({ ...v, imageUrl: '' })) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                        style={{ background: 'rgba(180,8,8,0.8)' }}
                        aria-label="Remove photo"
                      >
                        <CloseIcon size={12} />
                      </button>
                      {imgFile && (
                        <span className="absolute bottom-2 left-2 font-sans text-xs px-2 py-0.5 rounded-sm" style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--color-gold-light)' }}>
                          Ready to upload
                        </span>
                      )}
                    </div>
                  ) : (
                    /* ── Empty / upload prompt state ── */
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-sm cursor-pointer transition-all duration-200 group"
                      style={{
                        background: 'var(--surface-3)',
                        border: '2px dashed var(--surface-4)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-red-mid)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--surface-4)'}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 group-hover:bg-red-900/40"
                        style={{ background: 'var(--surface-4)' }}
                      >
                        <CameraIcon />
                      </div>
                      <div className="text-center">
                        <p className="font-sans text-sm font-semibold" style={{ color: 'var(--color-white)' }}>
                          Upload Photo
                        </p>
                        <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--color-grey)' }}>
                          Tap to choose from your device
                        </p>
                      </div>
                      <span
                        className="font-sans text-xs px-4 py-1.5 rounded-sm transition-colors duration-200"
                        style={{ background: 'var(--color-red-dark)', color: 'var(--color-white)' }}
                      >
                        Browse Photos
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(saving || uploading) ? <SmallSpinner /> : null}
                    {uploading ? 'Uploading…' : saving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                  <button type="button" onClick={() => setFormOpen(false)} className="btn-outline px-6">Cancel</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}

function statusColor(status) {
  switch (status) {
    case 'pending':   return 'var(--color-gold-deep)'
    case 'paid':      return '#4ade80'
    case 'shipped':   return '#60a5fa'
    case 'delivered': return '#a78bfa'
    default:          return 'var(--color-grey)'
  }
}

const SpinnerIcon = () => (
  <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--color-red-primary)' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
  </svg>
)
const SmallSpinner = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
  </svg>
)
const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const CameraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-gold-deep)' }}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
