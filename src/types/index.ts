import type { Timestamp } from 'firebase/firestore'

export type StickerStatus = 'missing' | 'have' | 'duplicate'

export interface Sticker {
  id: string
  name: string
  team: string
  teamCode: string
  number: number
  isFoil: boolean
  isCocaCola: boolean
  isTeamLogo: boolean
  isTeamPhoto: boolean
}

export interface UserProfile {
  uid: string
  username: string
  name: string
  photo: string
  city: string
  whatsapp?: string
  showWhatsapp?: boolean
  isPublic: boolean
  completionPct?: number
  createdAt: Timestamp
}

export interface UserCollection {
  stickers: Record<string, StickerStatus>
  quantities: Record<string, number>
  completionPct: number
  updatedAt: Timestamp
}

export interface TradeMatch {
  iCanOffer: Sticker[]
  theyCanOffer: Sticker[]
}
