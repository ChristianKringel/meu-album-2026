import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { UserProfile, UserCollection } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useCollection } from '@/contexts/CollectionContext'
import { ALL_STICKERS } from '@/data/stickers'
import Avatar from '@/components/ui/Avatar'

interface Props {
  profile: UserProfile
  collection: UserCollection | null
  isOwn?: boolean
}

export default function ProfileHeader({ profile, collection, isOwn = false }: Props) {
  const { firebaseUser } = useAuth()
  const { collection: myCollection } = useCollection()

  const tradeScore = useMemo(() => {
    if (!myCollection || !collection || isOwn || !firebaseUser) return null
    const iCanOffer = ALL_STICKERS.filter(
      (s) => myCollection.stickers[s.id] === 'duplicate' && collection.stickers[s.id] === 'missing'
    ).length
    const theyCanOffer = ALL_STICKERS.filter(
      (s) => collection.stickers[s.id] === 'duplicate' && myCollection.stickers[s.id] === 'missing'
    ).length
    return { mutual: Math.min(iCanOffer, theyCanOffer), iCanOffer, theyCanOffer }
  }, [myCollection, collection, isOwn, firebaseUser])

  const haveCount = collection
    ? Object.values(collection.stickers).filter((s) => s === 'have' || s === 'duplicate').length
    : 0

  const dupCount = collection
    ? Object.values(collection.stickers).filter((s) => s === 'duplicate').length
    : 0

  const completionPct = collection?.completionPct ?? 0

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5 space-y-4">
      {/* Avatar + name */}
      <div className="flex items-start gap-4">
        <Avatar
          src={profile.photo}
          name={profile.name}
          size="lg"
          className="ring-2 ring-brand-gold/40 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-brand-text truncate">{profile.name}</h1>
          <p className="text-sm text-brand-muted">@{profile.username}</p>
          {profile.city && (
            <p className="text-sm text-brand-muted mt-0.5 flex items-center gap-1">
              <span>📍</span>
              {profile.city}
            </p>
          )}
        </div>

        {isOwn && (
          <Link
            to="/setup"
            className="text-xs text-brand-gold border border-brand-gold/30 px-2 py-1 rounded-lg hover:bg-brand-gold/10 transition-colors shrink-0"
          >
            Editar
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Concluído" value={`${completionPct}%`} gold />
        <StatCard label="Tenho" value={haveCount.toString()} />
        <StatCard label="Repetidas" value={dupCount.toString()} orange />
      </div>

      {/* Progress bar */}
      <div>
        <div className="w-full h-2 rounded-full bg-brand-border overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-light transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* WhatsApp — exibido só para logados, e apenas se o dono permitiu */}
      {profile.whatsapp && profile.showWhatsapp !== false && firebaseUser && !isOwn && (
        <a
          href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-sm hover:bg-[#25D366]/20 transition-colors"
        >
          <WhatsAppIcon />
          Chamar no WhatsApp
        </a>
      )}

      {/* Trade button */}
      {firebaseUser && !isOwn && (
        <Link
          to={`/troca/${profile.username}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold font-semibold text-sm hover:bg-brand-gold/20 transition-colors"
        >
          <span>🔄 Ver compatibilidade de troca</span>
          {tradeScore !== null && (
            <span className="ml-auto bg-brand-gold text-black text-xs font-black px-2 py-0.5 rounded-full">
              {tradeScore.mutual > 0
                ? `${tradeScore.mutual} trocas`
                : tradeScore.iCanOffer > 0 || tradeScore.theyCanOffer > 0
                  ? 'ver ofertas'
                  : 'sem match'}
            </span>
          )}
        </Link>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  gold,
  orange,
}: {
  label: string
  value: string
  gold?: boolean
  orange?: boolean
}) {
  return (
    <div className="bg-brand-surface rounded-xl p-3 text-center border border-brand-border">
      <div
        className={`text-xl font-black ${
          gold ? 'text-brand-gold' : orange ? 'text-brand-duplicate' : 'text-brand-have'
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-brand-muted mt-0.5">{label}</div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
