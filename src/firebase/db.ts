import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './config'
import type { UserProfile, UserCollection, StickerStatus } from '@/types'
import { buildInitialCollection, ALL_STICKERS } from '@/data/stickers'

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserByUid(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const ref = await getDoc(doc(db, 'usernames', username.toLowerCase()))
  if (!ref.exists()) return null
  const { uid } = ref.data() as { uid: string }
  return getUserByUid(uid)
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'usernames', username.toLowerCase()))
  return !snap.exists()
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, 'uid' | 'createdAt'>
): Promise<void> {
  const username = data.username.toLowerCase()
  await setDoc(doc(db, 'usernames', username), { uid })
  await setDoc(doc(db, 'users', uid), { ...data, uid, createdAt: serverTimestamp() })
  await initializeCollection(uid)
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data)
}

// ─── Collections ─────────────────────────────────────────────────────────────

export async function initializeCollection(uid: string): Promise<void> {
  const initial = buildInitialCollection()
  await setDoc(doc(db, 'collections', uid), {
    stickers: initial,
    quantities: {},
    completionPct: 0,
    updatedAt: serverTimestamp(),
  })
}

export function subscribeToCollection(
  uid: string,
  callback: (col: UserCollection | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'collections', uid), (snap) => {
    callback(snap.exists() ? (snap.data() as UserCollection) : null)
  })
}

export async function getCollection(uid: string): Promise<UserCollection | null> {
  const snap = await getDoc(doc(db, 'collections', uid))
  return snap.exists() ? (snap.data() as UserCollection) : null
}

export async function updateStickerStatus(
  uid: string,
  stickerId: string,
  status: StickerStatus,
  quantity?: number
): Promise<void> {
  const colRef = doc(db, 'collections', uid)
  const snap = await getDoc(colRef)
  if (!snap.exists()) return

  const current = snap.data() as UserCollection
  const updatedStickers = { ...current.stickers, [stickerId]: status }
  const updatedQuantities = { ...current.quantities }

  if (status === 'duplicate' && quantity != null) {
    updatedQuantities[stickerId] = quantity
  } else {
    delete updatedQuantities[stickerId]
  }

  const haveCount = Object.values(updatedStickers).filter(
    (s) => s === 'have' || s === 'duplicate'
  ).length
  const completionPct = Math.round((haveCount / ALL_STICKERS.length) * 100)

  await updateDoc(colRef, {
    [`stickers.${stickerId}`]: status,
    quantities: updatedQuantities,
    completionPct,
    updatedAt: serverTimestamp(),
  })

  // Denormalize completionPct to users doc for easy feed display
  await updateDoc(doc(db, 'users', uid), { completionPct })
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function getPublicUsers(limitCount = 20): Promise<UserProfile[]> {
  const q = query(
    collection(db, 'users'),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as UserProfile)
}

export async function searchUsers(term: string): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), where('isPublic', '==', true), limit(50))
  const snap = await getDocs(q)
  const lower = term.toLowerCase()
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter(
      (u) =>
        u.name.toLowerCase().includes(lower) || u.city.toLowerCase().includes(lower)
    )
}
