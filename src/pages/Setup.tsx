import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { createUserProfile, isUsernameAvailable, updateUserProfile } from '@/firebase/db'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export default function Setup() {
  const { firebaseUser, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const isEditing = !!profile

  const [name, setName] = useState(profile?.name ?? firebaseUser?.displayName ?? '')
  const [username, setUsername] = useState(profile?.username ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '')
  const [showWhatsapp, setShowWhatsapp] = useState(profile?.showWhatsapp ?? true)
  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!USERNAME_RE.test(username)) {
      setError('Username: 3-20 caracteres, apenas letras minúsculas, números e _')
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        // Verificar disponibilidade só se o username mudou
        if (username !== profile.username) {
          const available = await isUsernameAvailable(username)
          if (!available) {
            setError('Este username já está em uso.')
            setLoading(false)
            return
          }
        }

        await updateUserProfile(firebaseUser!.uid, {
          name: name.trim(),
          city: city.trim(),
          whatsapp: whatsapp.trim(),
          showWhatsapp,
          isPublic,
        })
      } else {
        const available = await isUsernameAvailable(username)
        if (!available) {
          setError('Este username já está em uso.')
          setLoading(false)
          return
        }

        await createUserProfile(firebaseUser!.uid, {
          name: name.trim(),
          username: username.toLowerCase(),
          photo: firebaseUser?.photoURL ?? '',
          city: city.trim(),
          whatsapp: whatsapp.trim(),
          showWhatsapp,
          isPublic,
        })
      }

      await refreshProfile()
      navigate(isEditing ? `/u/${profile?.username ?? username}` : '/')
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8 space-y-6 animate-slide-up">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-brand-text">
          {isEditing ? 'Editar perfil' : 'Complete seu perfil'}
        </h1>
        <p className="text-sm text-brand-muted">
          {isEditing ? 'Atualize suas informações' : 'Só vai levar um minuto'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Seu nome *">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como você se chama"
            required
            className={inputCls}
          />
        </Field>

        <Field
          label="Username *"
          hint={isEditing ? 'O username não pode ser alterado por aqui' : 'Letras minúsculas, números e _'}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) =>
                !isEditing &&
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
              }
              placeholder="seu_username"
              required
              readOnly={isEditing}
              className={`${inputCls} pl-7 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </Field>

        <Field label="Cidade">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="São Paulo, SP"
            className={inputCls}
          />
        </Field>

        <Field label="WhatsApp" hint="Número com código do país, ex: 5511999999999">
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+55 11 9 9999-9999"
            className={inputCls}
          />
        </Field>

        {/* Toggles */}
        <div className="space-y-3 pt-1">
          <Toggle
            enabled={showWhatsapp}
            onChange={setShowWhatsapp}
            label="Exibir WhatsApp no perfil"
            description="Visível apenas para usuários logados"
          />
          <Toggle
            enabled={isPublic}
            onChange={setIsPublic}
            label="Perfil público"
            description="Aparece no feed e pode ser encontrado"
          />
        </div>

        {error && (
          <p className="text-xs text-brand-missing bg-brand-missing/10 border border-brand-missing/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          {isEditing && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3.5 rounded-xl border border-brand-border text-brand-muted font-semibold hover:text-brand-text hover:border-brand-muted transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl bg-brand-gold text-black font-bold text-base hover:bg-brand-gold-light transition-colors disabled:opacity-50"
          >
            {loading
              ? isEditing
                ? 'Salvando...'
                : 'Criando perfil...'
              : isEditing
              ? 'Salvar alterações'
              : 'Começar a colecionar!'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls =
  'w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-gold/50 text-sm transition-colors'

function Toggle({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="w-full flex items-center justify-between gap-3 text-left"
    >
      <div>
        <div className="text-sm text-brand-text">{label}</div>
        {description && <div className="text-xs text-brand-muted">{description}</div>}
      </div>
      <div
        className={`w-10 h-6 rounded-full transition-colors shrink-0 relative ${
          enabled ? 'bg-brand-gold' : 'bg-brand-border'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-brand-muted">{hint}</p>}
    </div>
  )
}
