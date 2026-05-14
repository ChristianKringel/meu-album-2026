import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Avatar from '@/components/ui/Avatar'

export default function NavBar() {
  const { firebaseUser, profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-brand-surface/90 backdrop-blur border-b border-brand-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-brand-gold">
            ⚽ Troca
          </span>
          <span className="text-xl font-black tracking-tight text-brand-text">
            2026
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {firebaseUser ? (
            <>
              {profile && (
                <Link
                  to={`/u/${profile.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar
                    src={profile.photo}
                    name={profile.name}
                    size="sm"
                    className="ring-2 ring-brand-gold/40"
                  />
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-brand-muted hover:text-brand-text text-sm transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-brand-gold hover:text-brand-gold-light transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
