import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { subscribeToCollection, updateStickerStatus } from '@/firebase/db'
import type { UserCollection, StickerStatus } from '@/types'
import { useAuth } from './AuthContext'

interface CollectionContextValue {
  collection: UserCollection | null
  loading: boolean
  setStatus: (id: string, status: StickerStatus, qty?: number) => Promise<void>
  cycleStatus: (id: string) => Promise<void>
}

const CollectionContext = createContext<CollectionContextValue | null>(null)

const STATUS_CYCLE: StickerStatus[] = ['missing', 'have', 'duplicate']

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuth()
  const [collection, setCollection] = useState<UserCollection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseUser) {
      setCollection(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = subscribeToCollection(firebaseUser.uid, (col) => {
      setCollection(col)
      setLoading(false)
    })
    return unsub
  }, [firebaseUser])

  const setStatus = useCallback(
    async (id: string, status: StickerStatus, qty?: number) => {
      if (!firebaseUser) return
      await updateStickerStatus(firebaseUser.uid, id, status, qty)
    },
    [firebaseUser]
  )

  const cycleStatus = useCallback(
    async (id: string) => {
      if (!collection || !firebaseUser) return
      const current = collection.stickers[id] ?? 'missing'
      const idx = STATUS_CYCLE.indexOf(current)
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
      const qty = next === 'duplicate' ? (collection.quantities[id] ?? 2) : undefined
      await updateStickerStatus(firebaseUser.uid, id, next, qty)
    },
    [collection, firebaseUser]
  )

  return (
    <CollectionContext.Provider value={{ collection, loading, setStatus, cycleStatus }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be used within CollectionProvider')
  return ctx
}
