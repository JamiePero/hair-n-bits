import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

import Navbar      from './components/Navbar'
import Footer      from './components/Footer'
import CartDrawer  from './components/CartDrawer'

import HomePage        from './pages/HomePage'
import ShopPage        from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CheckoutPage    from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import AdminPage       from './pages/AdminPage'
import NotFoundPage    from './pages/NotFoundPage'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

function AnimatedPage({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.div>
  )
}

const HIDE_FOOTER = ['/checkout', '/admin']

export default function App() {
  const location = useLocation()
  const hideFooter = HIDE_FOOTER.some(p => location.pathname.startsWith(p))

  return (
    <>
      <Navbar />
      <CartDrawer />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
          <Route path="/shop" element={<AnimatedPage><ShopPage /></AnimatedPage>} />
          <Route path="/product/:id" element={<AnimatedPage><ProductDetailPage /></AnimatedPage>} />
          <Route path="/checkout" element={<AnimatedPage><CheckoutPage /></AnimatedPage>} />
          <Route path="/order-success/:orderId" element={<AnimatedPage><OrderSuccessPage /></AnimatedPage>} />
          <Route path="/admin" element={<AnimatedPage><AdminPage /></AnimatedPage>} />
          <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>

      {!hideFooter && <Footer />}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(89,87,87,0.4)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </>
  )
}
