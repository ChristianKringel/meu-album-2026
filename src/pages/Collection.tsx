import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCollection } from '@/contexts/CollectionContext'
import StickerGrid from '@/components/stickers/StickerGrid'
import ExportModal from '@/components/collection/ExportModal'
import { Navigate } from 'react-router-dom'

export default function Collection() {
  const { firebaseUser, profile } = useAuth()
  const { collection, loading } = useCollection()
  const [showExport, setShowExport] = useState(false)

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
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
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
        <button
          onClick={() => setShowExport(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-gold/50 transition-colors text-sm"
          title="Exportar faltantes e repetidas"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar
        </button>
      </div>

      <StickerGrid collection={collection} readonly={false} />

      {showExport && (
        <ExportModal collection={collection} onClose={() => setShowExport(false)} />
      )}
    </div>
  )
}
