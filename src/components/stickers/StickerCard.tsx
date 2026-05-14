import type { Sticker, StickerStatus } from '@/types'

interface Props {
  sticker: Sticker
  status: StickerStatus
  quantity?: number
  onToggle?: () => void
  onQuantityChange?: (qty: number) => void
  readonly?: boolean
}

const STATUS_LABEL: Record<StickerStatus, string> = {
  missing: 'Falta',
  have: 'Tenho',
  duplicate: 'Rep.',
}

const STATUS_COLOR: Record<StickerStatus, string> = {
  missing: 'text-brand-missing',
  have: 'text-brand-have',
  duplicate: 'text-brand-duplicate',
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
  const sizeClass = ''

  let bgClass = 'bg-brand-card'
  let extraClass = ''

  if (sticker.isFoil) {
    bgClass = 'sticker-foil'
  } else if (sticker.isCocaCola) {
    bgClass = 'sticker-coca'
  } else if (status === 'have') {
    extraClass = 'ring-2 ring-brand-have'
  } else if (status === 'duplicate') {
    extraClass = 'ring-2 ring-brand-duplicate'
  } else {
    extraClass = 'opacity-50 ring-1 ring-brand-border'
  }

  if (sticker.isFoil && status === 'have') extraClass = 'ring-2 ring-brand-gold'
  if (sticker.isFoil && status === 'duplicate') extraClass = 'ring-2 ring-brand-duplicate'
  if (sticker.isFoil && status === 'missing') extraClass = 'opacity-60'

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={readonly ? undefined : onToggle}
        disabled={readonly}
        className={`${cardBase} ${sizeClass} ${bgClass} ${extraClass} ${
          readonly ? 'cursor-default' : 'cursor-pointer active:scale-95 hover:brightness-110'
        }`}
        title={`${sticker.id} — ${sticker.name}`}
      >
        {/* Sticker ID */}
        <span
          className={`text-[10px] font-bold w-full text-center truncate ${
            sticker.isFoil || sticker.isCocaCola ? 'text-black/70' : 'text-brand-muted'
          }`}
        >
          {sticker.id}
        </span>

        {/* Name */}
        <span
          className={`text-[9px] text-center leading-tight px-0.5 line-clamp-3 ${
            sticker.isFoil || sticker.isCocaCola ? 'text-black/80 font-semibold' : 'text-brand-text'
          }`}
        >
          {sticker.isTeamLogo
            ? '🏅 Logo'
            : sticker.isTeamPhoto
            ? '📸 Foto'
            : sticker.name}
        </span>

        {/* Status badge */}
        {!readonly && (
          <span
            className={`text-[10px] font-bold ${
              sticker.isFoil || sticker.isCocaCola ? 'text-black/70' : STATUS_COLOR[status]
            }`}
          >
            {STATUS_LABEL[status]}
          </span>
        )}
      </button>

      {/* Quantity stepper for duplicates */}
      {status === 'duplicate' && !readonly && onQuantityChange && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onQuantityChange(Math.max(2, (quantity ?? 2) - 1))}
            className="w-4 h-4 rounded-full bg-brand-card text-brand-muted text-xs flex items-center justify-center hover:text-brand-text"
          >
            −
          </button>
          <span className="text-[10px] text-brand-duplicate font-bold min-w-[12px] text-center">
            {quantity ?? 2}
          </span>
          <button
            onClick={() => onQuantityChange((quantity ?? 2) + 1)}
            className="w-4 h-4 rounded-full bg-brand-card text-brand-muted text-xs flex items-center justify-center hover:text-brand-text"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
