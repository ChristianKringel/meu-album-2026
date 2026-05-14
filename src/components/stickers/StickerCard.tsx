import type React from 'react'
import type { Sticker, StickerStatus } from '@/types'

interface Props {
  sticker: Sticker
  status: StickerStatus
  quantity?: number
  onToggle?: () => void
  onQuantityChange?: (qty: number) => void
  readonly?: boolean
}

const CARD_STYLE: Record<StickerStatus, React.CSSProperties> = {
  missing: { backgroundColor: '#1E1E30', opacity: 0.5 },
  have:    { backgroundColor: '#162B1F', border: '2px solid #22C55E' },
  duplicate: { backgroundColor: '#2B1A0D', border: '2px solid #F97316' },
}

const STATUS_BADGE: Record<StickerStatus, string> = {
  missing:   'bg-white/5 text-brand-muted',
  have:      'bg-green-500/25 text-green-400',
  duplicate: 'bg-orange-500/25 text-orange-400',
}

const STATUS_LABEL: Record<StickerStatus, string> = {
  missing: 'Falta',
  have: '✓ Tenho',
  duplicate: 'Rep.',
}

export default function StickerCard({
  sticker,
  status,
  quantity,
  onToggle,
  onQuantityChange,
  readonly = false,
}: Props) {
  const cardBase =
    'relative flex flex-col items-center justify-between rounded-lg p-1.5 select-none transition-all duration-200 w-full h-24'

  const isSpecial = sticker.isFoil || sticker.isCocaCola
  const bgClass = sticker.isFoil ? 'sticker-foil' : sticker.isCocaCola ? 'sticker-coca' : ''
  const cardStyle = isSpecial ? undefined : CARD_STYLE[status]

  const foilExtra =
    sticker.isFoil && status === 'have' ? 'ring-2 ring-brand-gold' :
    sticker.isFoil && status === 'duplicate' ? 'ring-2 ring-brand-duplicate' :
    sticker.isFoil && status === 'missing' ? 'opacity-60' : ''

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={readonly ? undefined : onToggle}
        disabled={readonly}
        style={cardStyle}
        className={`${cardBase} ${bgClass} ${foilExtra} ${
          readonly ? 'cursor-default' : 'cursor-pointer active:scale-95 hover:brightness-110'
        }`}
        title={`${sticker.id} — ${sticker.name}`}
      >
        {/* Sticker ID */}
        <span
          className={`text-[10px] font-bold w-full text-center truncate ${
            isSpecial ? 'text-black/70' : 'text-brand-muted'
          }`}
        >
          {sticker.id}
        </span>

        {/* Name */}
        <span
          className={`text-[9px] text-center leading-tight px-0.5 line-clamp-3 ${
            isSpecial ? 'text-black/80 font-semibold' : 'text-brand-text'
          }`}
        >
          {sticker.isTeamLogo ? 'Logo' : sticker.isTeamPhoto ? 'Foto' : sticker.name}
        </span>

        {/* Status badge */}
        {!readonly && (
          <span
            className={`text-[9px] font-bold rounded-full px-1.5 py-px ${
              isSpecial ? 'text-black/70' : STATUS_BADGE[status]
            }`}
          >
            {isSpecial ? STATUS_LABEL[status] : status === 'duplicate' && quantity
              ? `×${quantity}`
              : STATUS_LABEL[status]}
          </span>
        )}

        {/* Duplicate corner dot */}
        {!isSpecial && status === 'duplicate' && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-400" />
        )}
      </button>

      {/* Quantity stepper for duplicates */}
      {status === 'duplicate' && !readonly && onQuantityChange && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onQuantityChange(Math.max(2, (quantity ?? 2) - 1))}
            className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center hover:bg-orange-500/40"
          >
            −
          </button>
          <span className="text-[10px] text-orange-400 font-bold min-w-[12px] text-center">
            {quantity ?? 2}
          </span>
          <button
            onClick={() => onQuantityChange((quantity ?? 2) + 1)}
            className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center hover:bg-orange-500/40"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
