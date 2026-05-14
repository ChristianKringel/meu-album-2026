import type { UserCollection, Sticker } from '@/types'
import { ALL_STICKERS } from '@/data/stickers'
import { getTeamFlag } from '@/utils/teamFlags'

function groupByTeam(stickers: Sticker[]): { team: string; teamCode: string; stickers: Sticker[] }[] {
  const map = new Map<string, { team: string; teamCode: string; stickers: Sticker[] }>()
  for (const s of stickers) {
    if (!map.has(s.teamCode)) map.set(s.teamCode, { team: s.team, teamCode: s.teamCode, stickers: [] })
    map.get(s.teamCode)!.stickers.push(s)
  }
  return [...map.values()].sort((a, b) => a.team.localeCompare(b.team, 'pt-BR'))
}

function formatGroup(
  group: { team: string; teamCode: string; stickers: Sticker[] },
  getLine: (s: Sticker) => string
): string {
  const flag = getTeamFlag(group.teamCode)
  return `${flag} ${group.team}\n${group.stickers.map(getLine).join('\n')}`
}

export function getCollectionCounts(collection: UserCollection) {
  let missing = 0
  let duplicates = 0
  for (const sticker of ALL_STICKERS) {
    const status = collection.stickers[sticker.id] ?? 'missing'
    if (status === 'missing') missing++
    else if (status === 'duplicate') duplicates++
  }
  return { missing, duplicates }
}

export function buildMissingText(collection: UserCollection): string {
  const missing = ALL_STICKERS.filter((s) => (collection.stickers[s.id] ?? 'missing') === 'missing')
  if (!missing.length) return 'Nenhuma figurinha faltando!'
  const groups = groupByTeam(missing)
  const body = groups.map((g) => formatGroup(g, (s) => `${s.name} - ${s.id}${s.isFoil ? ' ✨' : ''}`)).join('\n\n')
  return `❌ FALTANDO (${missing.length})\n${'─'.repeat(24)}\n\n${body}`
}

export function buildDuplicatesText(collection: UserCollection): string {
  const duplicates = ALL_STICKERS.filter((s) => collection.stickers[s.id] === 'duplicate')
  if (!duplicates.length) return 'Nenhuma figurinha repetida!'
  const groups = groupByTeam(duplicates)
  const body = groups.map((g) =>
    formatGroup(g, (s) => {
      const qty = collection.quantities[s.id] ?? 1
      return `${s.name} - ${s.id}${qty > 1 ? ` (x${qty})` : ''}${s.isFoil ? ' ✨' : ''}`
    })
  ).join('\n\n')
  return `♻️ REPETIDAS (${duplicates.length})\n${'─'.repeat(24)}\n\n${body}`
}
