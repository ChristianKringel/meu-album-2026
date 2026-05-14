import { useAuth } from '@/contexts/AuthContext'
import { useCollection } from '@/contexts/CollectionContext'
import StickerGrid from '@/components/stickers/StickerGrid'
import { Navigate } from 'react-router-dom'

export default function Collection() {
  const { firebaseUser, profile } = useAuth()
  const { collection, loading } = useCollection()

  if (!firebaseUser) return <Navigate to="/login" replace />

  if (loading || !collection) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/setup" replace />
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 animate-fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-black text-brand-text">Minha Coleção</h1>
        <p className="text-sm text-brand-muted mt-0.5">
          Toque em uma figurinha para alternar entre{' '}
          <span className="text-brand-missing">Falta</span>
          {' → '}
          <span className="text-brand-have">Tenho</span>
          {' → '}
          <span className="text-brand-duplicate">Repetida</span>
        </p>
      </div>

      <StickerGrid collection={collection} readonly={false} />
    </div>
  )
}
