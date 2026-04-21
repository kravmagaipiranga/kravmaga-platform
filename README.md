# 🥋 Krav Magá — Plataforma de Gestão

Plataforma web responsiva (PWA) para gestão completa de academias de Krav Magá.
Multi-tenant, mobile-first, instalável em qualquer smartphone.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Estilo | Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deploy | Vercel |
| Repositório | GitHub |

---

## Como implementar do zero

### 1. Criar conta no Supabase (gratuito)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **SQL Editor** e cole o conteúdo de `supabase/migrations/001_initial.sql`
4. Execute o SQL para criar todas as tabelas
5. Copie as chaves em **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Fork e configuração local

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/kravmaga-platform.git
cd kravmaga-platform

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase

# Rode localmente
npm run dev
```

Acesse: http://localhost:3000

### 3. Deploy na Vercel (gratuito)

1. Acesse [vercel.com](https://vercel.com) e conecte seu GitHub
2. Importe o repositório `kravmaga-platform`
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**

Cada push na branch `main` faz deploy automático. ✅

### 4. Instalar no smartphone (PWA)

**Android (Chrome):**
- Acesse a URL do deploy
- Menu → "Adicionar à tela inicial"

**iOS (Safari):**
- Acesse a URL do deploy
- Botão compartilhar → "Adicionar à Tela de Início"

---

## Estrutura de flows

| Flow | Status |
|------|--------|
| ✅ Flow 1 — Matrícula end-to-end | Completo |
| 🔜 Flow 2 — Auth & perfis por role | Em breve |
| 🔜 Flow 3 — Check-in | Em breve |
| 🔜 Flow 4 — Financeiro | Em breve |
| 🔜 Flow 5 — Loja | Em breve |
| 🔜 Flow 6 — Curriculum & Graduação | Em breve |
| 🔜 Flow 7 — Eventos & Avisos | Em breve |

---

## Roles

| Role | Acesso |
|------|--------|
| `admin` | Total — gerencia toda a academia |
| `instructor` | Parcial — turmas, check-ins, histórico |
| `student` | Próprio perfil, check-in, loja, eventos, avisos |

---

## URLs públicas

| Rota | Descrição |
|------|-----------|
| `/register?academia=SLUG` | Ficha de matrícula pública |
| `/login` | Login de todos os usuários |

---

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

---

Desenvolvido com ❤️ para academias de Krav Magá
