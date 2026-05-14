# Troca 2026 — Guia para Claude Code

App social mobile-first para colecionadores do álbum Panini FIFA World Cup 2026.
Foco: conectar pessoas para trocar figurinhas via WhatsApp.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Estilo | Tailwind CSS 3 (tema custom) |
| Roteamento | React Router v7 |
| Backend | Firebase 11 (Auth + Firestore + Storage) |
| Deploy alvo | Vercel ou Firebase Hosting |

## Comandos essenciais

```bash
npm run dev        # servidor de desenvolvimento em localhost:5173
npm run build      # tsc + vite build (deve passar sem erros)
npm run preview    # preview do build de produção

python3 scripts/generate-stickers.py  # regenera src/data/stickers.ts a partir de dados.txt
```

## Aliases de import

`@/` aponta para `src/`. Usar sempre em vez de caminhos relativos longos.

```ts
import { useAuth } from '@/contexts/AuthContext'
import { ALL_STICKERS } from '@/data/stickers'
```

---

## Estrutura de arquivos

```
src/
├── App.tsx                         # Router + provider tree (AuthProvider > CollectionProvider)
├── main.tsx
├── index.css                       # Tailwind + animações FOIL shimmer + Coca-Cola
├── vite-env.d.ts
│
├── types/index.ts                  # Sticker, UserProfile, UserCollection, StickerStatus, TradeMatch
│
├── firebase/
│   ├── config.ts                   # initializeApp — lê VITE_FIREBASE_* do .env.local
│   └── db.ts                       # helpers Firestore (getUserByUsername, updateStickerStatus, etc.)
│
├── data/
│   └── stickers.ts                 # 1.972 figurinhas pré-geradas — NÃO editar à mão
│
├── contexts/
│   ├── AuthContext.tsx             # firebaseUser + UserProfile + login/logout
│   └── CollectionContext.tsx       # coleção em tempo real (onSnapshot) + cycleStatus
│
├── hooks/
│   └── useUsers.ts                 # feed público + busca por nome/cidade
│
├── components/
│   ├── layout/
│   │   ├── NavBar.tsx              # logo + avatar + botão sair
│   │   └── BottomNav.tsx          # 3 tabs: Início / Coleção / Perfil
│   ├── stickers/
│   │   ├── StickerCard.tsx        # card individual: toggle de status + FOIL/Coca styles
│   │   ├── StickerGrid.tsx        # grid completo com barra de progresso global
│   │   └── TeamSection.tsx        # accordion por seleção com barra de progresso
│   ├── profile/
│   │   └── ProfileHeader.tsx      # avatar, stats, WhatsApp (só para logados), botão de troca
│   ├── trade/
│   │   └── TradeCompatibility.tsx # algoritmo de matching + link WhatsApp
│   └── feed/
│       ├── UserCard.tsx
│       └── SearchBar.tsx
│
└── pages/
    ├── Home.tsx        # /              → Landing (deslogado) ou Feed (logado)
    ├── Login.tsx       # /login         → Google + email/senha
    ├── Setup.tsx       # /setup         → username + cidade (1º login)
    ├── Collection.tsx  # /colecao       → minha coleção (protegida)
    ├── Profile.tsx     # /u/:username   → perfil público
    └── Trade.tsx       # /troca/:username → matching de trocas (protegida)
```

---

## Firestore — schema

```
users/{uid}
  name: string
  username: string          # único, lowercase
  photo: string
  city: string
  whatsapp?: string         # exibido só para usuários logados
  isPublic: boolean
  completionPct?: number    # denormalizado de collections/{uid} para exibição no feed
  createdAt: Timestamp

usernames/{username}        # índice de unicidade
  uid: string

collections/{uid}
  stickers: Record<stickerId, 'missing' | 'have' | 'duplicate'>
  quantities: Record<stickerId, number>   # apenas duplicadas
  completionPct: number
  updatedAt: Timestamp
```

**Inicialização:** ao criar perfil, `collections/{uid}` é criado com todas as 1.972 figurinhas como `'missing'`.

Arquivo de regras: `firestore.rules` na raiz. Deploy: `firebase deploy --only firestore:rules`.

---

## Design system

Cores custom definidas em `tailwind.config.ts` sob o namespace `brand`:

| Token | Valor | Uso |
|---|---|---|
| `brand-bg` | `#0A0A0F` | background da página |
| `brand-surface` | `#12121A` | superfícies secundárias |
| `brand-card` | `#1A1A26` | cards e inputs |
| `brand-border` | `#2A2A3F` | bordas |
| `brand-gold` | `#D4AF37` | cor primária / destaque |
| `brand-gold-light` | `#F0CC55` | hover do dourado |
| `brand-text` | `#F5F5F5` | texto principal |
| `brand-muted` | `#8888AA` | texto secundário |
| `brand-have` | `#22C55E` | status "tenho" |
| `brand-missing` | `#EF4444` | status "falta" |
| `brand-duplicate` | `#F97316` | status "repetida" |
| `brand-coca` | `#E32636` | tema Coca-Cola |

Classes CSS especiais em `src/index.css`:
- `.sticker-foil` — shimmer dourado animado
- `.sticker-coca` — shimmer vermelho animado

---

## Dados das figurinhas

**Fonte:** `dados.txt` na raiz (1.984 linhas).
**Gerado:** `src/data/stickers.ts` — **não editar manualmente**.

Para regenerar após alterar `dados.txt`:
```bash
python3 scripts/generate-stickers.py
```

Estrutura de cada figurinha:
```ts
interface Sticker {
  id: string        // "MEX1", "FWC3", "COCA1", "00"
  name: string      // "Hirving Lozano", "Team Photo - Mexico", "Official Emblem"
  team: string      // "Mexico", "World Cup", "Coca-Cola"
  teamCode: string  // "MEX", "FWC", "WC", "COCA"
  number: number    // 1-20 (0 para "00")
  isFoil: boolean
  isCocaCola: boolean
  isTeamLogo: boolean
  isTeamPhoto: boolean
}
```

Totais: **1.972 figurinhas** — 9 especiais (00 + FWC1-8) + 96 seleções × 20 + 12 Coca-Cola.

---

## Lógica central

### Ciclo de status de figurinha

`missing → have → duplicate → missing` (via `cycleStatus` no `CollectionContext`).

### Algoritmo de matching (`TradeCompatibility.tsx`)

```ts
iCanOffer  = stickers onde eu tenho duplicate E o outro tem missing
theyCanOffer = stickers onde o outro tem duplicate E eu tenho missing
score = Math.min(iCanOffer.length, theyCanOffer.length)
```

### Link WhatsApp

```ts
`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
```
Mensagem pré-preenchida com até 15 IDs de cada lado.

---

## Variáveis de ambiente

Copiar `.env.example` → `.env.local` e preencher com as credenciais do Firebase:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Status da implementação

### Fase 1 — Concluída ✅

- [x] Auth: Google + email/senha, setup de username
- [x] Coleção: grid por seleção, toggle de status, Firestore em tempo real
- [x] FOIL shimmer e tema Coca-Cola
- [x] Perfil público (`/u/:username`)
- [x] Feed de usuários com busca
- [x] Matching de trocas com botão WhatsApp
- [x] Build sem erros TypeScript

### Fase 2 — Planejada, não implementada

Os TODOs abaixo estão marcados no código com `// TODO: Phase 2`:

- **Mapa de trocadores** — Google Maps com pins de usuários com figurinhas compatíveis (só quem optou). Precisará de campo `location: GeoPoint` no `users/{uid}` e lib `@react-google-maps/api`.

- **Pontos de troca** — nova coleção `tradingSpots/{id}` com `{ name, address, location, ratings[] }`. CRUD com moderação.

- **Notificações push** — Firebase Cloud Messaging. Disparar quando um usuário compatível entrar no app. Exige service worker (`firebase-messaging-sw.js`).

- **Histórico de trocas** — coleção `trades/{id}` com `{ offeredBy, offeredTo, offeredIds[], wantedIds[], status: 'pending'|'confirmed'|'cancelled', confirmedAt }`. Requer confirmação dos dois lados.

- **Ranking** — query simples em `users` ordenada por `completionPct` desc. Adicionar campo `tradeCount` denormalizado.

---

## Pontos de atenção para próximas sessões

- **Profile.tsx** usa um `CollectionProvider` aninhado em modo readonly; `cycleStatus`/`setStatus` são injetados mas nunca chamados. Funciona, mas pode ser refatorado para remover a dependência do contexto em modo readonly.
- **Busca no feed** (`useUsers.ts`) faz client-side filtering; para escalar, adicionar índice Firestore composto ou usar Algolia/Typesense.
- **Chunk de dados** (`sticker-data`) tem ~250 KB minificado. Se o carregamento inicial for lento, considerar lazy import do módulo de dados.
- **Avatar upload** está previsto (Storage já configurado) mas não implementado; `Setup.tsx` atualmente usa apenas a foto do Google OAuth.
