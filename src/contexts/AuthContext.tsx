import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { auth } from '@/firebase/config'
import { getUserByUid } from '@/firebase/db'
import type { UserProfile } from '@/types'

interface AuthContextValue {
  firebaseUser: User | null
  profile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(user: User) {
    try {
      const p = await getUserByUid(user.uid)
      setProfile(p)
    } catch {
      // Regras do Firestore não deployadas ou sem permissão — trata como sem perfil
      setProfile(null)
    }
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      setFirebaseUser(user)
      if (user) {
        await loadProfile(user)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [])

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signUpWithEmail(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  async function refreshProfile() {
    if (firebaseUser) {
      setLoading(true)
      await loadProfile(firebaseUser)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
