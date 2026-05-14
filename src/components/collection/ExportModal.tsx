import { useState, useMemo } from 'react'
import type { UserCollection } from '@/types'
import { buildMissingText, buildDuplicatesText, getCollectionCounts } from '@/utils/exportCollection'

type Tab = 'missing' | 'duplicates'

interface Props {
  collection: UserCollection
  onClose: () => void
}

export default function ExportModal({ collection, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('missing')
  const [copied, setCopied] = useState(false)

  const counts = useMemo(() => getCollectionCounts(collection), [collection])
  const missingText = useMemo(() => buildMissingText(collection), [collection])
  const duplicatesText = useMemo(() => buildDuplicatesText(collection), [collection])

  const activeText = tab === 'missing' ? missingText : duplicatesText

  async function handleCopy() {
    await navigator.clipboard.writeText(activeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([activeText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = tab === 'missing' ? 'faltando.txt' : 'repetidas.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-brand-surface border border-brand-border rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border flex-shrink-0">
          <h2 className="font-bold text-brand-text">Exportar coleção</h2>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-3 gap-2 flex-shrink-0">
          <button
            onClick={() => { setTab('missing'); setCopied(false) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'missing'
                ? 'bg-brand-missing/20 text-brand-missing border border-brand-missing/40'
                : 'bg-brand-card text-brand-muted border border-brand-border hover:text-brand-text'
            }`}
          >
            ❌ Faltando
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'missing' ? 'bg-brand-missing/30' : 'bg-brand-border'}`}>
              {counts.missing}
            </span>
          </button>
          <button
            onClick={() => { setTab('duplicates'); setCopied(false) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'duplicates'
                ? 'bg-brand-duplicate/20 text-brand-duplicate border border-brand-duplicate/40'
                : 'bg-brand-card text-brand-muted border border-brand-border hover:text-brand-text'
            }`}
          >
            ♻️ Repetidas
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'duplicates' ? 'bg-brand-duplicate/30' : 'bg-brand-border'}`}>
              {counts.duplicates}
            </span>
          </button>
        </div>

        {/* Text area */}
        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            key={tab}
            readOnly
            value={activeText}
            className="w-full h-full min-h-[280px] bg-brand-card border border-brand-border rounded-xl p-3 text-xs text-brand-text font-mono resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 py-3 border-t border-brand-border flex-shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-gold text-brand-bg font-semibold text-sm hover:bg-brand-gold-light transition-colors"
          >
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copiar texto
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-card border border-brand-border text-brand-text text-sm hover:bg-brand-surface transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            .txt
          </button>
        </div>
      </div>
    </div>
  )
}
