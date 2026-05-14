#!/usr/bin/env python3
"""
Regenera src/data/stickers.ts a partir de dados.txt.
Execute: python3 scripts/generate-stickers.py
"""
import re
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PT_NAMES = {
    "Mexico": "México", "South Africa": "África do Sul", "South Korea": "Coreia do Sul",
    "Czechia": "República Tcheca", "Czech Republic": "República Tcheca",
    "Canada": "Canadá", "Bosnia and Herzegovina": "Bósnia e Herzegovina",
    "Qatar": "Catar", "Switzerland": "Suíça", "Brazil": "Brasil",
    "Morocco": "Marrocos", "Haiti": "Haiti", "Germany": "Alemanha",
    "Argentina": "Argentina", "Egypt": "Egito", "New Zealand": "Nova Zelândia",
    "Spain": "Espanha", "France": "França", "Portugal": "Portugal",
    "Italy": "Itália", "England": "Inglaterra", "Belgium": "Bélgica",
    "Netherlands": "Holanda", "Croatia": "Croácia", "Serbia": "Sérvia",
    "Denmark": "Dinamarca", "Austria": "Áustria", "Sweden": "Suécia",
    "Norway": "Noruega", "Turkey": "Turquia", "Türkiye": "Turquia",
    "Poland": "Polônia", "Ukraine": "Ucrânia", "Hungary": "Hungria",
    "Romania": "Romênia", "Slovakia": "Eslováquia", "Slovenia": "Eslovênia",
    "Albania": "Albânia", "Greece": "Grécia", "Scotland": "Escócia",
    "Wales": "País de Gales", "Ireland": "Irlanda", "USA": "Estados Unidos",
    "United States": "Estados Unidos", "Uruguay": "Uruguai", "Colombia": "Colômbia",
    "Chile": "Chile", "Ecuador": "Equador", "Peru": "Peru", "Bolivia": "Bolívia",
    "Venezuela": "Venezuela", "Paraguay": "Paraguai", "Panama": "Panamá",
    "Costa Rica": "Costa Rica", "Honduras": "Honduras", "El Salvador": "El Salvador",
    "Guatemala": "Guatemala", "Cuba": "Cuba", "Jamaica": "Jamaica",
    "Trinidad and Tobago": "Trinidad e Tobago", "Nigeria": "Nigéria",
    "Senegal": "Senegal", "Cameroon": "Camarões", "Ghana": "Gana",
    "Algeria": "Argélia", "Tunisia": "Tunísia", "Ivory Coast": "Costa do Marfim",
    "Côte d'Ivoire": "Costa do Marfim", "Mali": "Mali", "Japan": "Japão",
    "Australia": "Austrália", "Saudi Arabia": "Arábia Saudita", "Iran": "Irã",
    "Iraq": "Iraque", "Uzbekistan": "Uzbequistão", "World Cup": "Copa do Mundo",
    "Coca-Cola": "Coca-Cola", "Russia": "Rússia", "Iceland": "Islândia",
    "Finland": "Finlândia", "North Macedonia": "Macedônia do Norte",
    "Montenegro": "Montenegro", "Bulgaria": "Bulgária", "Georgia": "Geórgia",
    "Armenia": "Armênia", "Azerbaijan": "Azerbaijão", "North Korea": "Coreia do Norte",
    "China": "China", "Indonesia": "Indonésia", "India": "Índia",
    "New Caledonia": "Nova Caledônia", "Dominican Republic": "República Dominicana",
    "Cape Verde": "Cabo Verde", "Comoros": "Comores", "Gambia": "Gâmbia",
    "Rwanda": "Ruanda", "Angola": "Angola", "Kenya": "Quênia",
    "Tanzania": "Tanzânia", "Mozambique": "Moçambique", "Zimbabwe": "Zimbábue",
    "Zambia": "Zâmbia", "DR Congo": "RD Congo", "Gabon": "Gabão",
    "Togo": "Togo", "Benin": "Benin", "Niger": "Níger", "Liberia": "Libéria",
    "Sierra Leone": "Serra Leoa", "Namibia": "Namíbia", "Botswana": "Botsuana",
    "Palestine": "Palestina", "Israel": "Israel", "Jordan": "Jordânia",
    "Lebanon": "Líbano", "Syria": "Síria", "Kuwait": "Kuwait",
    "Bahrain": "Bahrein", "Oman": "Omã", "Thailand": "Tailândia",
    "Vietnam": "Vietnã", "Philippines": "Filipinas", "Malaysia": "Malásia",
    "Singapore": "Singapura", "Myanmar": "Mianmar", "Cambodia": "Camboja",
    "Mongolia": "Mongólia", "Pakistan": "Paquistão", "Bangladesh": "Bangladesh",
    "Sri Lanka": "Sri Lanka", "Nepal": "Nepal", "Maldives": "Maldivas",
    "Fiji": "Fiji", "Papua New Guinea": "Papua Nova Guiné",
    "Solomon Islands": "Ilhas Salomão", "Vanuatu": "Vanuatu", "Tahiti": "Taiti",
    "Luxembourg": "Luxemburgo", "Belarus": "Bielorrússia", "Moldova": "Moldávia",
    "Lithuania": "Lituânia", "Latvia": "Letônia", "Estonia": "Estônia",
    "Cyprus": "Chipre", "Malta": "Malta", "Kosovo": "Kosovo",
    "Faroe Islands": "Ilhas Faroé", "Libya": "Líbia", "Sudan": "Sudão",
    "Ethiopia": "Etiópia", "Somalia": "Somália", "Eritrea": "Eritreia",
    "Uganda": "Uganda", "Burundi": "Burundi", "Madagascar": "Madagáscar",
    "Suriname": "Suriname", "Guyana": "Guiana", "Bermuda": "Bermudas",
    "Curaçao": "Curaçao", "Antigua and Barbuda": "Antígua e Barbuda",
    "Grenada": "Granada", "Barbados": "Barbados",
    "Timor-Leste": "Timor-Leste", "Brunei": "Brunei",
    "Hong Kong": "Hong Kong", "Taiwan": "Taiwan",
    "Equatorial Guinea": "Guiné Equatorial", "Guinea": "Guiné",
    "Guinea-Bissau": "Guiné-Bissau", "Mauritania": "Mauritânia",
    "Burkina Faso": "Burkina Faso", "Chad": "Chade",
    "Central African Republic": "República Centro-Africana",
    "Lesotho": "Lesoto", "Eswatini": "Essuatíni", "Malawi": "Maláui",
    "Seychelles": "Seicheles", "Mauritius": "Maurício",
    "United Arab Emirates": "Emirados Árabes Unidos",
}

def pt(name):
    return PT_NAMES.get(name, name)

stickers = []
seen_ids = set()
in_coca = False

with open(os.path.join(ROOT, 'dados.txt')) as f:
    for line in f:
        stripped = line.strip()
        if 'Coca-Cola USA Set Checklist' in stripped:
            in_coca = True
            continue
        if not stripped or 'Set Checklist' in stripped or '2026 Panini' in stripped or 'Base Stickers' in stripped:
            continue
        if in_coca:
            m = re.match(r'^(\d+)\s+(.+?)\s+-\s+(.+)$', stripped)
            if m:
                num = int(m.group(1))
                sid = f'COCA{num}'
                if sid in seen_ids:
                    continue
                seen_ids.add(sid)
                stickers.append({
                    'id': sid, 'name': m.group(2).strip(), 'team': pt(m.group(3).strip()),
                    'teamCode': 'COCA', 'number': num, 'isFoil': False,
                    'isCocaCola': True, 'isTeamLogo': False, 'isTeamPhoto': False,
                })
        else:
            m = re.match(r'^([A-Z0-9]+)\s+(.+?)(\s+FOIL)?$', stripped)
            if not m:
                continue
            raw_id = m.group(1)
            if raw_id in seen_ids:
                continue
            seen_ids.add(raw_id)
            rest = m.group(2).strip()
            is_foil = bool(m.group(3))
            code_m = re.match(r'^([A-Z]+)', raw_id)
            team_code = code_m.group(1) if code_m else raw_id
            num_m = re.search(r'(\d+)$', raw_id)
            number = int(num_m.group(1)) if num_m else 0
            if raw_id == '00':
                team_code = 'WC'; number = 0
            parts = rest.split(' - ')
            if len(parts) >= 2:
                name = parts[0].strip()
                if name.endswith(' FOIL'):
                    name = name[:-5].strip(); is_foil = True
                team_en = ' - '.join(parts[1:]).strip()
                if team_en.endswith(' FOIL'):
                    team_en = team_en[:-5].strip(); is_foil = True
                team = pt(team_en)
            else:
                name = rest.replace(' FOIL', '').strip()
                team = 'Copa do Mundo' if team_code in ('WC', 'FWC') else pt(team_code)
            is_logo = 'Team Logo' in name
            is_photo = 'Team Photo' in name
            if team_code in ('WC', 'FWC') or raw_id == '00':
                team = 'Copa do Mundo'
                team_code = 'FWC' if raw_id != '00' else 'WC'
            stickers.append({
                'id': raw_id, 'name': name, 'team': team, 'teamCode': team_code,
                'number': number, 'isFoil': is_foil, 'isCocaCola': False,
                'isTeamLogo': is_logo, 'isTeamPhoto': is_photo,
            })

out = os.path.join(ROOT, 'src', 'data', 'stickers.ts')
lines = [
    "import type { Sticker } from '@/types'",
    "",
    "export const ALL_STICKERS: Sticker[] = [",
]
for s in stickers:
    ne = s['name'].replace("'", "\\'")
    te = s['team'].replace("'", "\\'")
    lines.append(
        f"  {{ id: '{s['id']}', name: '{ne}', team: '{te}', teamCode: '{s['teamCode']}', "
        f"number: {s['number']}, isFoil: {str(s['isFoil']).lower()}, "
        f"isCocaCola: {str(s['isCocaCola']).lower()}, isTeamLogo: {str(s['isTeamLogo']).lower()}, "
        f"isTeamPhoto: {str(s['isTeamPhoto']).lower()} }},"
    )
lines += [
    "]",
    "",
    "export function getStickerById(id: string): Sticker | undefined {",
    "  return ALL_STICKERS.find(s => s.id === id)",
    "}",
    "",
    "export function getTeams(): string[] {",
    "  const seen = new Set<string>()",
    "  return ALL_STICKERS",
    "    .filter(s => !s.isCocaCola && s.teamCode !== 'WC')",
    "    .filter(s => { if (seen.has(s.teamCode)) return false; seen.add(s.teamCode); return true })",
    "    .map(s => s.team)",
    "}",
    "",
    "export function getStickersByTeamCode(code: string): Sticker[] {",
    "  return ALL_STICKERS.filter(s => s.teamCode === code)",
    "}",
    "",
    "export function getTeamCodes(): string[] {",
    "  const seen = new Set<string>()",
    "  return ALL_STICKERS",
    "    .filter(s => !s.isCocaCola && s.teamCode !== 'WC' && s.teamCode !== 'FWC')",
    "    .filter(s => { if (seen.has(s.teamCode)) return false; seen.add(s.teamCode); return true })",
    "    .map(s => s.teamCode)",
    "}",
    "",
    "export const COCA_COLA_STICKERS = ALL_STICKERS.filter(s => s.isCocaCola)",
    "",
    "export function buildInitialCollection(): Record<string, 'missing'> {",
    "  return Object.fromEntries(ALL_STICKERS.map(s => [s.id, 'missing' as const]))",
    "}",
    "",
]

with open(out, 'w') as f:
    f.write('\n'.join(lines))

print(f"✓ Gerado {out}")
print(f"  Total: {len(stickers)} figurinhas únicas")
print(f"  FOIL: {sum(1 for s in stickers if s['isFoil'])}")
print(f"  Coca-Cola: {sum(1 for s in stickers if s['isCocaCola'])}")
teams = len(set(s['teamCode'] for s in stickers if not s['isCocaCola'] and s['teamCode'] not in ('WC','FWC')))
print(f"  Seleções: {teams}")
