import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { UserProfile, UserCollection } from '@/types'
import { getUserByUsername, getCollection } from '@/firebase/db'
import ProfileHeader from '@/components/profile/ProfileHeader'
import StickerGrid from '@/components/stickers/StickerGrid'
import { useAuth } from '@/contexts/AuthContext'
import { CollectionProvider } from '@/contexts/CollectionContext'

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const { profile: myProfile } = useAuth()
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined)
  const [collection, setCollection] = useState<UserCollection | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const isOwn = myProfile?.username === username

  useEffect(() => {
    if (!username) return
    setLoadingData(true)
    getUserByUsername(username)
      .then(async (u) => {
        setUser(u)
        if (u) {
          const col = await getCollection(u.uid)
          setCollection(col)
        }
      })
      .finally(() => setLoadingData(false))
  }, [username])

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
      </div>
    )
  }

  if (user === null) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="text-lg font-bold text-brand-text mb-1">Usuário não encontrado</h2>
        <p className="text-sm text-brand-muted">@{username} não existe ou o perfil é privado.</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <CollectionProvider>
      <div className="max-w-2xl mx-auto px-3 py-4 space-y-4 animate-fade-in">
        <ProfileHeader
          profile={user}
          collection={collection}
          isOwn={isOwn}
        />

        {collection && (
          <div>
            <h2 className="text-base font-bold text-brand-text mb-3 px-1">
              Coleção de {user.name.split(' ')[0]}
            </h2>
            <StickerGrid collection={collection} readonly={true} />
          </div>
        )}
      </div>
    </CollectionProvider>
  )
}
