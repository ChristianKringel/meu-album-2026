/**
 * Cria um usuário de teste no Firebase usando as credenciais admin do Firebase CLI.
 * Não requer email/password habilitado no console.
 * Uso: node scripts/create-test-user.mjs
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { homedir } from 'os'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

// ── Lê .env.local ──────────────────────────────────────────────────────────────
const envRaw = readFileSync(join(root, '.env.local'), 'utf-8')
const env = Object.fromEntries(
  envRaw
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
)
const PROJECT = env.VITE_FIREBASE_PROJECT_ID
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`
const IDP_BASE = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT}`

// ── Lê token do Firebase CLI ───────────────────────────────────────────────────
const cliConfigPath = join(homedir(), '.config/configstore/firebase-tools.json')
const cliConfig = JSON.parse(readFileSync(cliConfigPath, 'utf-8'))
let accessToken = cliConfig.tokens?.access_token

if (!accessToken) throw new Error('Firebase CLI não tem token. Execute: firebase login')

// Se o token expirou, renova via refresh_token
const expiresAt = cliConfig.tokens?.expires_at
if (expiresAt && Date.now() > expiresAt - 60000) {
  console.log('🔄 Token expirado, renovando...')
  const refreshToken = cliConfig.tokens.refresh_token
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8yndajaBE6jMaH3Yg',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await r.json()
  if (data.error) throw new Error(`Refresh falhou: ${data.error_description}`)
  accessToken = data.access_token
  console.log('   ✓ Token renovado')
}

// ── Perfil do usuário de teste ─────────────────────────────────────────────────
const TEST_EMAIL    = 'testetrocador@troca2026.app'
const TEST_USERNAME = 'testetrocador'
const TEST_NAME     = 'João Teste'
const TEST_CITY     = 'Cristal, RS'
const TEST_WHATSAPP = '5551912345678'

// ── Helpers ────────────────────────────────────────────────────────────────────
async function adminPost(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  return r.json()
}

async function fsPatch(path, fields) {
  const r = await fetch(`${FS_BASE}/${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ fields }),
  })
  if (!r.ok) {
    const err = await r.json()
    throw new Error(`Firestore PATCH ${path} falhou: ${JSON.stringify(err?.error?.message ?? err)}`)
  }
  return r.json()
}

async function fsGet(path) {
  const r = await fetch(`${FS_BASE}/${path}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })
  return r.json()
}

function strVal(v)  { return { stringValue: String(v) } }
function boolVal(v) { return { booleanValue: Boolean(v) } }
function intVal(v)  { return { integerValue: String(Math.round(v)) } }
function tsVal()    { return { timestampValue: new Date().toISOString() } }

function toFsMap(obj) {
  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, strVal(v)])
      ),
    },
  }
}

function toFsIntMap(obj) {
  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, intVal(v)])
      ),
    },
  }
}

// ── Gera coleção de teste ──────────────────────────────────────────────────────
const stickersTs = readFileSync(join(root, 'src/data/stickers.ts'), 'utf-8')
const allIds = [...stickersTs.matchAll(/id: '([^']+)'/g)].map(m => m[1])
console.log(`📦 ${allIds.length} figurinhas encontradas`)

function assignStatus(id, idx) {
  const teamCode = id.replace(/\d+$/, '')

  if (teamCode === 'BRA') {
    // Brasil: muita duplicada — João pode oferecer
    return idx % 3 === 0 ? 'missing' : idx % 3 === 1 ? 'have' : 'duplicate'
  }
  if (teamCode === 'ARG') {
    // Argentina: maioria faltando — João quer receber
    return idx % 5 < 4 ? 'missing' : 'have'
  }
  if (teamCode === 'FRA') {
    // França: bastante duplicada
    const r = idx % 4
    return r < 2 ? 'duplicate' : r === 2 ? 'have' : 'missing'
  }
  if (teamCode === 'POR') {
    // Portugal: duplicada
    return idx % 3 === 2 ? 'duplicate' : 'have'
  }
  if (['MEX', 'USA', 'CAN'].includes(teamCode)) {
    // Sede: tem bastante
    return idx % 5 === 0 ? 'missing' : idx % 5 < 3 ? 'have' : 'duplicate'
  }

  // Demais: distribuição realista (30% missing, 50% have, 20% duplicate)
  const r = (idx * 2654435761) % 100
  if (r < 30) return 'missing'
  if (r < 80) return 'have'
  return 'duplicate'
}

const stickers = {}
const quantities = {}
let haveCount = 0

allIds.forEach((id, idx) => {
  const status = assignStatus(id, idx)
  stickers[id] = status
  if (status === 'have' || status === 'duplicate') haveCount++
  if (status === 'duplicate') quantities[id] = 2
})

const completionPct = Math.round((haveCount / allIds.length) * 100)
const dupIds = Object.entries(stickers).filter(([, s]) => s === 'duplicate').map(([id]) => id)
const missingIds = Object.entries(stickers).filter(([, s]) => s === 'missing').map(([id]) => id)

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  // ── Cria usuário no Firebase Auth (Admin API) ──────────────────────────────
  console.log('\n🔐 Criando usuário no Firebase Auth (admin API)...')

  // Verifica se já existe pelo email
  const lookupRes = await adminPost(`${IDP_BASE}/accounts:lookup`, {
    email: [TEST_EMAIL],
  })

  let uid
  if (lookupRes.users?.length > 0) {
    uid = lookupRes.users[0].localId
    console.log(`   Usuário já existe — UID: ${uid}`)
  } else {
    // Cria novo usuário
    const createRes = await adminPost(`${IDP_BASE}/accounts`, {
      email: TEST_EMAIL,
      password: 'Teste@2026',
      displayName: TEST_NAME,
      emailVerified: true,
      disabled: false,
    })

    if (createRes.error) {
      throw new Error(`Criação falhou: ${JSON.stringify(createRes.error)}`)
    }
    uid = createRes.localId
    console.log(`   ✓ Usuário criado. UID: ${uid}`)
  }

  // ── usernames/{username} ──────────────────────────────────────────────────────
  // Verifica se o username já aponta para outro uid
  console.log('\n🔑 Verificando username...')
  const existingUsername = await fsGet(`usernames/${TEST_USERNAME}`)
  if (existingUsername.fields?.uid?.stringValue && existingUsername.fields.uid.stringValue !== uid) {
    throw new Error(`Username "${TEST_USERNAME}" já está em uso por outro uid!`)
  }
  await fsPatch(`usernames/${TEST_USERNAME}`, { uid: strVal(uid) })
  console.log('   ✓ Username indexado')

  // ── users/{uid} ───────────────────────────────────────────────────────────────
  console.log('\n👤 Gravando perfil...')
  await fsPatch(`users/${uid}`, {
    uid:          strVal(uid),
    name:         strVal(TEST_NAME),
    username:     strVal(TEST_USERNAME),
    photo:        strVal(''),
    city:         strVal(TEST_CITY),
    whatsapp:     strVal(TEST_WHATSAPP),
    showWhatsapp: boolVal(true),
    isPublic:     boolVal(true),
    completionPct: intVal(completionPct),
    createdAt:    tsVal(),
  })
  console.log('   ✓ Perfil gravado')

  // ── collections/{uid} ─────────────────────────────────────────────────────────
  console.log('\n📚 Gravando coleção...')
  console.log(`   • missing:    ${missingIds.length}`)
  console.log(`   • have:       ${allIds.length - missingIds.length - dupIds.length}`)
  console.log(`   • duplicate:  ${dupIds.length}`)
  console.log(`   • completionPct: ${completionPct}%`)

  await fsPatch(`collections/${uid}`, {
    stickers:     toFsMap(stickers),
    quantities:   toFsIntMap(quantities),
    completionPct: intVal(completionPct),
    updatedAt:    tsVal(),
  })
  console.log('   ✓ Coleção gravada')

  console.log(`
✅ Usuário de teste criado com sucesso!

  URL do perfil:  http://localhost:5173/u/${TEST_USERNAME}
  URL de troca:   http://localhost:5173/troca/${TEST_USERNAME}
  Email:          ${TEST_EMAIL}
  Senha:          Teste@2026
  Cidade:         ${TEST_CITY}  ← aparece em "Perto de você" no feed
  WhatsApp:       ${TEST_WHATSAPP}

João tem:
  • BRA duplicado  → pode te oferecer em troca
  • ARG faltando   → vai querer suas repetidas de Argentina
  • FRA duplicado  → mais material de troca
  • POR duplicado  → mais ainda
  • MEX/USA/CAN    → mix de have/duplicate

Para recriar: node scripts/create-test-user.mjs
`)
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message)
  process.exit(1)
})
