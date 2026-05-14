import { useState, useEffect } from 'react'
import { getPublicUsers, searchUsers } from '@/firebase/db'
import type { UserProfile } from '@/types'

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicUsers(30)
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  async function search(term: string) {
    if (!term.trim()) {
      setLoading(true)
      const results = await getPublicUsers(30)
      setUsers(results)
      setLoading(false)
      return
    }
    setLoading(true)
    const results = await searchUsers(term)
    setUsers(results)
    setLoading(false)
  }

  return { users, loading, search }
}
