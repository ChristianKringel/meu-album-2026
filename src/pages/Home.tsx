import { useAuth } from '@/contexts/AuthContext'
import { useUsers } from '@/hooks/useUsers'
import UserCard from '@/components/feed/UserCard'
import SearchBar from '@/components/feed/SearchBar'
import { Link } from 'react-router-dom'

export default function Home() {
  const { firebaseUser, profile } = useAuth()
  const { users, loading, search } = useUsers()

  // Unauthed landing page
  if (!firebaseUser) {
    return <Landing />
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 space-y-4 animate-fade-in">
      {/* Welcome */}
      <div>
        {profile ? (
          <h1 className="text-xl font-black text-brand-text">
            Olá, {profile.name.split(' ')[0]}! 👋
          </h1>
        ) : (
          <h1 className="text-xl font-black text-brand-text">Início</h1>
        )}
        <p className="text-sm text-brand-muted mt-0.5">
          Encontre alguém para trocar figurinhas
        </p>
      </div>

      {/* Quick actions */}
      {profile && (
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/colecao"
            className="flex flex-col gap-1 bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/40 transition-colors"
          >
            <span className="text-2xl">📖</span>
            <span className="font-semibold text-brand-text text-sm">Minha Coleção</span>
            <span className="text-xs text-brand-muted">Marcar figurinhas</span>
          </Link>
          <Link
            to={`/u/${profile.username}`}
            className="flex flex-col gap-1 bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/40 transition-colors"
          >
            <span className="text-2xl">👤</span>
            <span className="font-semibold text-brand-text text-sm">Meu Perfil</span>
            <span className="text-xs text-brand-muted">Ver & compartilhar</span>
          </Link>
        </div>
      )}

      {/* Search */}
      <SearchBar onSearch={search} />

      {/* Feed */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-7 h-7 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🔎</div>
            <p className="text-sm text-brand-muted">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          users.map((u) => (
            <UserCard
              key={u.uid}
              user={u}
            />
          ))
        )}
      </div>

      {/* TODO: Phase 2 - Mapa de trocadores com Google Maps */}
    </div>
  )
}

function Landing() {
  return (
    <div className="min-h-[calc(100dvh-56px)] flex flex-col items-center justify-center px-6 text-center space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="space-y-3">
        <div className="text-7xl">⚽</div>
        <h1 className="text-4xl font-black">
          <span className="text-brand-gold">Troca</span>
          <span className="text-brand-text"> 2026</span>
        </h1>
        <p className="text-brand-muted text-base max-w-xs mx-auto leading-relaxed">
          Conecte-se com colecionadores do álbum Panini da Copa do Mundo 2026 e troque figurinhas facilmente.
        </p>
      </div>

      {/* Features */}
      <div className="w-full max-w-xs space-y-3">
        {[
          ['📖', 'Marque sua coleção', 'Tenho, falta ou repetida — tudo organizado'],
          ['🔄', 'Encontre trocas', 'Veja quem tem o que você precisa'],
          ['💬', 'Combine pelo WhatsApp', 'Contato direto com a mensagem pronta'],
        ].map(([icon, title, desc]) => (
          <div
            key={title}
            className="flex items-start gap-3 bg-brand-card border border-brand-border rounded-xl p-3 text-left"
          >
            <span className="text-2xl shrink-0">{icon}</span>
            <div>
              <div className="font-semibold text-brand-text text-sm">{title}</div>
              <div className="text-xs text-brand-muted">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/login"
        className="w-full max-w-xs py-4 rounded-xl bg-brand-gold text-black font-black text-lg hover:bg-brand-gold-light transition-colors"
      >
        Começar agora →
      </Link>
    </div>
  )
}
