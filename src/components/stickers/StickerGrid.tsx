import { useState } from 'react'
import type { UserCollection, StickerStatus, Sticker } from '@/types'
import { getTeamCodes, getStickersByTeamCode, ALL_STICKERS, COCA_COLA_STICKERS } from '@/data/stickers'
import TeamSection from './TeamSection'
import StickerCard from './StickerCard'
import { useCollection } from '@/contexts/CollectionContext'

interface Props {
  collection: UserCollection
  readonly?: boolean
}

export default function StickerGrid({ collection, readonly = false }: Props) {
  const teamCodes = getTeamCodes().sort((a, b) => {
    const nameA = getStickersByTeamCode(a)[0]?.team ?? a
    const nameB = getStickersByTeamCode(b)[0]?.team ?? b
    return nameA.localeCompare(nameB, 'pt-BR')
  })
  const { cycleStatus, setStatus } = useCollection()

  const haveTotal = Object.values(collection.stickers).filter(
    (s) => s === 'have' || s === 'duplicate'
  ).length
  const totalPct = Math.round((haveTotal / ALL_STICKERS.length) * 100)

  const colaHave = COCA_COLA_STICKERS.filter((s) => {
    const st = collection.stickers[s.id] as StickerStatus
    return st === 'have' || st === 'duplicate'
  }).length

  return (
    <div className="space-y-3 pb-6">
      {/* Global progress */}
      <div className="bg-brand-card rounded-xl p-4 border border-brand-border">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-semibold text-brand-text">Progresso total</span>
          <span className="text-2xl font-black text-brand-gold">{totalPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-brand-border overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-light transition-all duration-700"
            style={{ width: `${totalPct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-brand-muted text-right">
          {haveTotal} de {ALL_STICKERS.length} figurinhas
        </div>
      </div>

      {/* World Cup / FWC specials */}
      <SpecialSection
        teamCode="FWC / WC"
        teamName="World Cup — Especiais"
        stickers={[
          ...getStickersByTeamCode('WC'),
          ...getStickersByTeamCode('FWC'),
        ]}
        collection={collection}
        readonly={readonly}
        cycleStatus={cycleStatus}
        setStatus={setStatus}
      />

      {/* Coca-Cola section */}
      <div className="border border-brand-coca/40 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-brand-coca/10">
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-bold text-sm">🥤 Coca-Cola</span>
            <span className="text-xs text-brand-muted">Insert Set</span>
          </div>
          <span className="text-xs text-brand-muted">{colaHave}/{COCA_COLA_STICKERS.length}</span>
        </div>
        <div className="px-3 py-4 bg-brand-surface">
          <div className="flex flex-wrap gap-2">
            {COCA_COLA_STICKERS.map((s) => {
              const status = (collection.stickers[s.id] ?? 'missing') as StickerStatus
              const qty = collection.quantities[s.id]
              return (
                <StickerCard
                  key={s.id}
                  sticker={s}
                  status={status}
                  quantity={qty}
                  readonly={readonly}
                  onToggle={readonly ? undefined : () => cycleStatus(s.id)}
                  onQuantityChange={readonly ? undefined : (q) => setStatus(s.id, 'duplicate', q)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* All teams */}
      {teamCodes.map((code) => {
        const stickers = getStickersByTeamCode(code)
        if (!stickers.length) return null
        const teamName = stickers[0].team
        return (
          <TeamSection
            key={code}
            teamCode={code}
            teamName={teamName}
            stickers={stickers}
            collection={collection}
            readonly={readonly}
          />
        )
      })}
    </div>
  )
}

interface SpecialSectionProps {
  teamCode: string
  teamName: string
  stickers: Sticker[]
  collection: UserCollection
  readonly: boolean
  cycleStatus: (id: string) => Promise<void>
  setStatus: (id: string, status: StickerStatus, qty?: number) => Promise<void>
}

function SpecialSection({
  teamCode,
  teamName,
  stickers,
  collection,
  readonly,
  cycleStatus,
  setStatus,
}: SpecialSectionProps) {
  const [open, setOpen] = useState(false)
  const haveCount = stickers.filter((s) => {
    const st = collection.stickers[s.id] as StickerStatus
    return st === 'have' || st === 'duplicate'
  }).length
  const pct = stickers.length ? Math.round((haveCount / stickers.length) * 100) : 0

  return (
    <div className="border border-brand-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-brand-card hover:bg-brand-surface transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-brand-muted">{teamCode}</span>
          <span className="font-semibold text-brand-gold">{teamName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-muted">{haveCount}/{stickers.length}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className={`w-4 h-4 text-brand-muted transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-3 py-4 bg-brand-surface">
          <div className="w-full h-1 rounded-full bg-brand-border mb-3 overflow-hidden">
            <div className="h-full bg-brand-gold rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {stickers.map((s) => {
              const status = (collection.stickers[s.id] ?? 'missing') as StickerStatus
              const qty = collection.quantities[s.id]
              return (
                <StickerCard
                  key={s.id}
                  sticker={s}
                  status={status}
                  quantity={qty}
                  readonly={readonly}
                  onToggle={readonly ? undefined : () => cycleStatus(s.id)}
                  onQuantityChange={readonly ? undefined : (q) => setStatus(s.id, 'duplicate', q)}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
