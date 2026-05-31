import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase/config'

const AuthContext = createContext(null)
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@hairnbits.com'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const isAdmin = user?.email === ADMIN_EMAIL

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signUpWithEmail = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (name) await updateProfile(cred.user, { displayName: name })
    return cred
  }

  const loginWithGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider())

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginWithEmail, signUpWithEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
