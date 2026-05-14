import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import type { UserProfile, UserCollection } from '@/types'
import { getUserByUsername, getCollection } from '@/firebase/db'
import TradeCompatibility from '@/components/trade/TradeCompatibility'
import { useAuth } from '@/contexts/AuthContext'
import { useCollection } from '@/contexts/CollectionContext'

export default function Trade() {
  const { username } = useParams<{ username: string }>()
  const { collection: myCollection } = useCollection()
  const { profile: myProfile } = useAuth()
  const [theirProfile, setTheirProfile] = useState<UserProfile | null | undefined>(undefined)
  const [theirCollection, setTheirCollection] = useState<UserCollection | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!username) return
    setLoadingData(true)
    getUserByUsername(username)
      .then(async (u) => {
        setTheirProfile(u)
        if (u) {
          const col = await getCollection(u.uid)
          setTheirCollection(col)
        }
      })
      .finally(() => setLoadingData(false))
  }, [username])

  if (loadingData || !myCollection) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!theirProfile || !theirCollection) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-sm text-brand-muted">Usuário não encontrado.</p>
        <Link to="/" className="mt-4 inline-block text-brand-gold text-sm">
          Voltar ao início
        </Link>
      </div>
    )
  }

  if (myProfile?.username === username) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">😅</div>
        <p className="text-sm text-brand-muted">Você não pode trocar com você mesmo!</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={`/u/${username}`} className="hover:opacity-70 transition-opacity">
          <Avatar
            src={theirProfile.photo}
            name={theirProfile.name}
            size="md"
            className="ring-2 ring-brand-gold/30"
          />
        </Link>
        <div>
          <h1 className="text-lg font-black text-brand-text">
            Trocar com {theirProfile.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-brand-muted">@{theirProfile.username}</p>
        </div>
      </div>

      <TradeCompatibility
        myCollection={myCollection}
        theirCollection={theirCollection}
        theirProfile={theirProfile}
      />
    </div>
  )
}
