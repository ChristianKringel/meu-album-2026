import { useState } from 'react'
import type { Sticker, UserCollection, UserProfile } from '@/types'
import { ALL_STICKERS } from '@/data/stickers'
import type { StickerStatus } from '@/types'

interface Props {
  myCollection: UserCollection
  theirCollection: UserCollection
  theirProfile: UserProfile
}

function computeMatch(mine: UserCollection, theirs: UserCollection) {
  // trocas mútuas: eu tenho duplicada e eles precisam, e vice-versa
  const iCanOffer = ALL_STICKERS.filter(
    (s) =>
      (mine.stickers[s.id] as StickerStatus) === 'duplicate' &&
      (theirs.stickers[s.id] as StickerStatus) === 'missing'
  )
  const theyCanOffer = ALL_STICKERS.filter(
    (s) =>
      (theirs.stickers[s.id] as StickerStatus) === 'duplicate' &&
      (mine.stickers[s.id] as StickerStatus) === 'missing'
  )
  // posso vender/dar: tenho duplicada mas o outro já tem
  const iCanSell = ALL_STICKERS.filter(
    (s) =>
      (mine.stickers[s.id] as StickerStatus) === 'duplicate' &&
      (theirs.stickers[s.id] as StickerStatus) !== 'missing'
  )
  // outro pode vender/dar pra mim: ele tem duplicada mas eu já tenho
  const theyCanSell = ALL_STICKERS.filter(
    (s) =>
      (theirs.stickers[s.id] as StickerStatus) === 'duplicate' &&
      (mine.stickers[s.id] as StickerStatus) !== 'missing'
  )
  return { iCanOffer, theyCanOffer, iCanSell, theyCanSell }
}

function buildWhatsAppUrl(phone: string, iOffer: Sticker[], theyOffer: Sticker[]): string {
  const offerStr = iOffer
    .slice(0, 15)
    .map((s) => s.id)
    .join(', ')
  const wantStr = theyOffer
    .slice(0, 15)
    .map((s) => s.id)
    .join(', ')
  const suffix =
    iOffer.length > 15 || theyOffer.length > 15 ? ' (e mais!)' : ''
  const msg = `Oi! Vi no Troca 2026 que a gente pode trocar figurinhas. Tenho ${offerStr} que você precisa e preciso de ${wantStr} que você tem. Vamos combinar?${suffix}`
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

export default function TradeCompatibility({ myCollection, theirCollection, theirProfile }: Props) {
  const { iCanOffer, theyCanOffer, iCanSell, theyCanSell } = computeMatch(myCollection, theirCollection)
  const score = Math.min(iCanOffer.length, theyCanOffer.length)
  const firstName = theirProfile.name.split(' ')[0]
  const [showExtras, setShowExtras] = useState(false)

  // Ofertas unilaterais: eu posso dar mas não recebo nada em troca (ou vice-versa)
  const iGiveOnly = iCanOffer.length > 0 && theyCanOffer.length === 0
  const theyGiveOnly = theyCanOffer.length > 0 && iCanOffer.length === 0

  return (
    <div className="space-y-4">
      {/* Score summary */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-4 text-center">
        <div className="text-4xl font-black text-brand-gold mb-1">{score}</div>
        <div className="text-sm text-brand-muted">trocas mútuas possíveis</div>
        <p className="text-xs text-brand-muted mt-2">
          Você tem {iCanOffer.length} fig. que {firstName} precisa
          &nbsp;·&nbsp;
          {firstName} tem {theyCanOffer.length} que você precisa
        </p>
      </div>

      {/* Aviso de oferta unilateral */}
      {iGiveOnly && (
        <div className="bg-brand-have/10 border border-brand-have/30 rounded-xl p-3 text-center">
          <p className="text-xs text-brand-have font-semibold">
            Você pode dar {iCanOffer.length} fig. a {firstName}, mas ele/ela não tem nada para oferecer em troca.
            Considere vender ou aguardar {firstName} colecionar mais.
          </p>
        </div>
      )}
      {theyGiveOnly && (
        <div className="bg-brand-duplicate/10 border border-brand-duplicate/30 rounded-xl p-3 text-center">
          <p className="text-xs text-brand-duplicate font-semibold">
            {firstName} pode te dar {theyCanOffer.length} fig., mas você não tem nada para oferecer em troca.
            Considere comprar ou aguardar ter mais repetidas.
          </p>
        </div>
      )}

      {/* Side by side — trocas */}
      {(iCanOffer.length > 0 || theyCanOffer.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <StickerList
            title={`Você oferece (${iCanOffer.length})`}
            stickers={iCanOffer}
            color="text-brand-have"
            emptyMsg={`Você não tem repetidas que ${firstName} precisa`}
          />
          <StickerList
            title={`Você recebe (${theyCanOffer.length})`}
            stickers={theyCanOffer}
            color="text-brand-duplicate"
            emptyMsg={`${firstName} não tem o que você precisa`}
          />
        </div>
      )}

      {/* WhatsApp CTA */}
      {(iCanOffer.length > 0 || theyCanOffer.length > 0) && theirProfile.whatsapp ? (
        <a
          href={buildWhatsAppUrl(theirProfile.whatsapp, iCanOffer, theyCanOffer)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-base hover:bg-[#1da851] transition-colors active:scale-[0.98]"
        >
          <WhatsAppIcon />
          {score > 0 ? 'Chamar no WhatsApp para trocar' : 'Chamar no WhatsApp para negociar'}
        </a>
      ) : (iCanOffer.length > 0 || theyCanOffer.length > 0) ? (
        <div className="text-center py-3 rounded-xl border border-brand-border text-brand-muted text-sm">
          {firstName} não cadastrou o WhatsApp
        </div>
      ) : (
        <div className="text-center py-4 rounded-xl bg-brand-card border border-brand-border">
          <div className="text-2xl mb-2">😕</div>
          <p className="text-sm text-brand-muted">
            Nenhuma troca possível no momento.
            <br />
            Volte quando tiver mais repetidas!
          </p>
        </div>
      )}

      {/* Extras para vender/dar */}
      {(iCanSell.length > 0 || theyCanSell.length > 0) && (
        <div className="rounded-xl border border-brand-border overflow-hidden">
          <button
            onClick={() => setShowExtras((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-brand-surface text-sm text-brand-muted hover:text-brand-text transition-colors"
          >
            <span className="font-semibold">Repetidas que não se encaixam nesta troca</span>
            <span>{showExtras ? '▲' : '▼'}</span>
          </button>

          {showExtras && (
            <div className="p-3 space-y-3 bg-brand-card">
              {iCanSell.length > 0 && (
                <div>
                  <p className="text-xs text-brand-muted mb-1.5">
                    Suas repetidas que <strong>{firstName} já tem</strong> — pode vender/dar para outros ({iCanSell.length})
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {iCanSell.map((s) => (
                      <span
                        key={s.id}
                        title={`${s.name} — ${s.team}`}
                        className="text-[10px] bg-brand-surface border border-brand-border px-1.5 py-0.5 rounded text-brand-muted"
                      >
                        {s.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {theyCanSell.length > 0 && (
                <div>
                  <p className="text-xs text-brand-muted mb-1.5">
                    Repetidas de <strong>{firstName}</strong> que <strong>você já tem</strong> — ele/ela pode vender/dar para outros ({theyCanSell.length})
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {theyCanSell.map((s) => (
                      <span
                        key={s.id}
                        title={`${s.name} — ${s.team}`}
                        className="text-[10px] bg-brand-surface border border-brand-border px-1.5 py-0.5 rounded text-brand-muted"
                      >
                        {s.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StickerList({
  title,
  stickers,
  color,
  emptyMsg,
}: {
  title: string
  stickers: Sticker[]
  color: string
  emptyMsg: string
}) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-3 space-y-2">
      <h3 className={`text-xs font-bold ${color}`}>{title}</h3>
      {stickers.length === 0 ? (
        <p className="text-xs text-brand-muted italic">{emptyMsg}</p>
      ) : (
        <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
          {stickers.map((s) => (
            <span
              key={s.id}
              title={`${s.name} — ${s.team}`}
              className="text-[10px] bg-brand-surface border border-brand-border px-1.5 py-0.5 rounded text-brand-text"
            >
              {s.id}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
