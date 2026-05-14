import { Link } from 'react-router-dom'
import type { UserProfile } from '@/types'
import Avatar from '@/components/ui/Avatar'

interface Props {
  user: UserProfile
  duplicateCount?: number
}

export default function UserCard({ user, duplicateCount }: Props) {
  return (
    <Link
      to={`/u/${user.username}`}
      className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-xl p-3 hover:border-brand-gold/40 transition-colors active:scale-[0.98]"
    >
      {/* Avatar */}
      <Avatar
        src={user.photo}
        name={user.name}
        size="md"
        className="shrink-0 ring-2 ring-brand-border"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-brand-text truncate">{user.name}</div>
        <div className="text-xs text-brand-muted">@{user.username}</div>
        {user.city && (
          <div className="text-xs text-brand-muted mt-0.5">📍 {user.city}</div>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="text-lg font-black text-brand-gold">
          {user.completionPct ?? 0}%
        </div>
        {duplicateCount != null && duplicateCount > 0 && (
          <span className="text-xs bg-brand-duplicate/20 text-brand-duplicate px-1.5 py-0.5 rounded-full">
            {duplicateCount} rep.
          </span>
        )}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-4 h-4 text-brand-muted"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  )
}
