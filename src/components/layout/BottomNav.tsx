import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const tabs = [
  { to: '/', label: 'Início', icon: HomeIcon },
  { to: '/colecao', label: 'Coleção', icon: GridIcon },
]

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export default function BottomNav() {
  const { profile } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur border-t border-brand-border pb-safe">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-gold' : 'text-brand-muted hover:text-brand-text'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
        {profile && (
          <NavLink
            to={`/u/${profile.username}`}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-gold' : 'text-brand-muted hover:text-brand-text'
              }`
            }
          >
            <UserIcon />
            Perfil
          </NavLink>
        )}
      </div>
    </nav>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
