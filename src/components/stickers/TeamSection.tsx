import { useState } from 'react'
import type { Sticker, StickerStatus, UserCollection } from '@/types'
import StickerCard from './StickerCard'
import { useCollection } from '@/contexts/CollectionContext'
import { getTeamFlag } from '@/utils/teamFlags'

interface Props {
  teamCode: string
  teamName: string
  stickers: Sticker[]
  collection: UserCollection
  readonly?: boolean
}

export default function TeamSection({ teamCode, teamName, stickers, collection, readonly = false }: Props) {
  const [open, setOpen] = useState(false)
  const { cycleStatus, setStatus } = useCollection()

  const haveCount = stickers.filter((s) => {
    const st = collection.stickers[s.id] as StickerStatus
    return st === 'have' || st === 'duplicate'
  }).length

  const pct = Math.round((haveCount / stickers.length) * 100)

  const dupCount = stickers.filter(
    (s) => (collection.stickers[s.id] as StickerStatus) === 'duplicate'
  ).length

  return (
    <div className="border border-brand-border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-brand-card hover:bg-brand-surface transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg leading-none shrink-0" aria-hidden="true">{getTeamFlag(teamCode)}</span>
          <span className="font-semibold text-brand-text truncate">{teamName}</span>
          {dupCount > 0 && (
            <span className="text-xs bg-brand-duplicate/20 text-brand-duplicate px-1.5 py-0.5 rounded-full shrink-0">
              {dupCount} rep.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 rounded-full bg-brand-border overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-gold transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-brand-muted tabular-nums">
              {haveCount}/{stickers.length}
            </span>
          </div>

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={`w-4 h-4 text-brand-muted transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Sticker grid */}
      {open && (
        <div className="px-3 py-4 bg-brand-surface">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                  onQuantityChange={
                    readonly
                      ? undefined
                      : (q) => setStatus(s.id, 'duplicate', q)
                  }
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
