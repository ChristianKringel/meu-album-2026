import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { CollectionProvider } from '@/contexts/CollectionContext'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Setup from '@/pages/Setup'
import Collection from '@/pages/Collection'
import Profile from '@/pages/Profile'
import Trade from '@/pages/Trade'
import NavBar from '@/components/layout/NavBar'
import BottomNav from '@/components/layout/BottomNav'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!firebaseUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

function SetupGuard({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!firebaseUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

function FullScreenLoader() {
  return (
    <div className="min-h-dvh bg-brand-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
    </div>
  )
}

const SETUP_EXEMPT = ['/setup', '/login']

function AppLayout() {
  const { firebaseUser, profile, loading } = useAuth()
  const location = useLocation()

  // Usuário logado sem perfil → redireciona para /setup (exceto nas rotas de auth)
  if (!loading && firebaseUser && !profile && !SETUP_EXEMPT.includes(location.pathname)) {
    return <Navigate to="/setup" replace />
  }

  return (
    <div className="min-h-dvh bg-brand-bg flex flex-col">
      <NavBar />
      <main className="flex-1 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<SetupGuard><Setup /></SetupGuard>} />
          <Route
            path="/colecao"
            element={<ProtectedRoute><Collection /></ProtectedRoute>}
          />
          <Route path="/u/:username" element={<Profile />} />
          <Route
            path="/troca/:username"
            element={<ProtectedRoute><Trade /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {firebaseUser && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CollectionProvider>
          <AppLayout />
        </CollectionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
