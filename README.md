# Troca 2026

App social mobile-first para colecionadores do álbum Panini FIFA World Cup 2026. Conecta pessoas para trocar figurinhas via WhatsApp.
Acessível via: https://meu-album-2026-98c04.web.app/

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (tema escuro + dourado)
- Firebase (Auth + Firestore + Storage)
- React Router v6

## Setup local

### 1. Criar projeto Firebase

1. Acesse https://console.firebase.google.com
2. Crie um projeto chamado `troca-2026`
3. Ative **Authentication** → Google + Email/senha
4. Ative **Firestore Database** (modo produção)
5. Ative **Storage**
6. Em Configurações do projeto → Seus apps → Adicionar app Web → copie `firebaseConfig`

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores do seu projeto Firebase.

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

App disponível em `http://localhost:5173`

### 4. Deploy das regras do Firestore

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # aponte para o projeto correto
firebase deploy --only firestore:rules
```

## Deploy (Vercel)

```bash
npm install -g vercel
vercel
```

Configure as variáveis de ambiente `VITE_FIREBASE_*` no painel da Vercel.

## Estrutura de dados (Firestore)

```
users/{uid}         → perfil público do usuário
usernames/{slug}    → índice de unicidade de usernames
collections/{uid}   → estado da coleção com todas as 1.972 figurinhas
```

## Figurinhas

O arquivo `dados.txt` contém 1.972 figurinhas:
- 9 especiais (00 + FWC1–FWC8)
- 96 seleções × 20 figurinhas cada
- 12 Coca-Cola Insert Set

Os dados são pré-processados em `src/data/stickers.ts` (gerado automaticamente).

## Fase 2 (planejada)

- Mapa de trocadores com Google Maps
- Pontos de troca comunitários
- Notificações push (FCM)
- Histórico de trocas com confirmação dupla
- Ranking de colecionadores
