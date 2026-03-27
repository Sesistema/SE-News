# SeNews

Aplicacao web corporativa para comunicados, novidades e atualizacoes de sistema ERP.

## Stack

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + JWT + Multer
- Banco: MySQL (phpMyAdmin)

## Estrutura

```txt
WikiNovo/
  backend/
  frontend/
  database/schema.sql
```

## Funcionalidades

- Area publica:
  - listagem de postagens
  - abas por projeto (Sesiag7, Seicon7, Sepdv)
  - busca por palavra-chave
  - filtros por categoria, modulo e versao ERP
  - destaques e postagens fixadas
  - detalhe da postagem
- Area admin:
  - login com JWT
  - criacao de novas abas de projetos
  - criar, editar e excluir postagens
  - editor rico (WYSIWYG)
  - upload de imagem
  - status publicado/rascunho
  - logs de alteracoes

## Banco de dados (phpMyAdmin)

1. Crie o banco MySQL.
2. Importe o arquivo `database/schema.sql`.
3. Se ja tinha banco anterior sem projetos, rode tambem `database/migration_projects.sql`.

## Ambiente local

### Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Criar admin inicial:

```bash
npm run seed:admin -- "Administrador" "admin@empresa.com" "Admin@123"
```

### Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

## Variaveis de ambiente

### Backend (`backend/.env`)

- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `FRONTEND_URLS` (separe por virgula)
- `UPLOAD_DIR`

### Frontend (`frontend/.env`)

- `VITE_API_URL`
- `VITE_APP_BASE`

## Endpoints principais

- `POST /api/auth/login`
- `GET /api/posts`
- `GET /api/posts/highlights`
- `GET /api/posts/meta`
- `GET /api/posts/:slugOrId`
- `GET /api/posts/:slugOrId/private` (auth)
- `GET /api/admin/posts` (admin)
- `GET /api/admin/projects` (admin)
- `POST /api/admin/projects` (admin)
- `POST /api/admin/posts` (admin)
- `PUT /api/admin/posts/:id` (admin)
- `DELETE /api/admin/posts/:id` (admin)
- `GET /api/admin/logs` (admin)

## Deploy em producao na Hostinger

### 1) Banco MySQL

1. Abra o phpMyAdmin da Hostinger.
2. Importe `database/schema.sql`.
3. Anote host, usuario, senha e nome do banco.

### 2) Backend Node.js (API)

1. No painel da Hostinger, crie uma Node App (exemplo: `api.seudominio.com`).
2. Suba a pasta `backend`.
3. Rode `npm install` no backend.
4. Crie `backend/.env` baseado em `backend/.env.production.example`.
5. Ajuste os valores:
   - `DB_*` com dados MySQL da Hostinger
   - `JWT_SECRET` forte
   - `FRONTEND_URLS=https://wiki.seudominio.com,https://www.wiki.seudominio.com`
6. Start command sugerido: `npm start`.
7. Gere admin inicial:
   - `npm run seed:admin -- "Administrador" "admin@empresa.com" "SENHA_FORTE"`

### 3) Frontend Vite (site)

1. No seu ambiente local, em `frontend/.env.production`:
   - `VITE_API_URL=https://api.seudominio.com/api`
   - `VITE_APP_BASE=/`
2. Gere build:
   - `npm install`
   - `npm run build:prod`
3. Suba o conteudo de `frontend/dist` para `public_html` (ou subpasta do seu dominio).
4. O arquivo `frontend/public/.htaccess` ja entra no build para permitir rotas SPA.

### 4) Checklist rapido

- API responde: `https://api.seudominio.com/api/health`
- Frontend carrega sem erro de CORS
- Login admin funciona
- Criacao de post com imagem funciona
- Upload salva em `backend/uploads`

## Observacoes

- Troque senha padrao imediatamente em producao.
- Recomendado manter backup do banco e da pasta `uploads`.
