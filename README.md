# 🎀 YARA Kids - Moda Infantil

Loja virtual YARA Kids em Angular + Tailwind.

## 🚀 Como rodar

```bash
npm install
npm start
```

Acesse: `http://localhost:4200`

## 🔐 Configuração de runtime (obrigatória para modo real)

O projeto lê chaves de integração via `window.__APP_CONFIG__` (arquivo `public/app-config.js`).

Edite `public/app-config.js`:

```js
window.__APP_CONFIG__ = {
  supabaseUrl: 'https://SEU-PROJETO.supabase.co',
  supabaseAnonKey: 'SUA_ANON_KEY',
  geminiApiKey: 'SUA_GEMINI_KEY'
};
```

> Não use senha/atalho de admin no frontend. O acesso admin é baseado em `role` do usuário autenticado no Supabase.

## ✅ Deploy

O build de produção é gerado com:

```bash
npm run build
```

Saída: `dist/yara-kids`


## 🔁 Fluxo automático recomendado (work -> PR -> main -> Firebase)

### 1) Trabalhar sempre na branch `work`
Se o clone ainda não tiver a branch `work` (erro: `pathspec 'work' did not match`), crie e publique uma vez:

```bash
git checkout -b work
git push -u origin work
```

Depois disso, use normalmente:

```bash
git checkout work
git pull --rebase origin work
```

### 2) Fazer alterações e enviar para `work`
```bash
git add .
git commit -m "feat: sua alteração"
git push origin work
```

### 3) Abrir Pull Request no GitHub
- Base: `main`
- Compare: `work`
- URL rápida: `https://github.com/kiro66666666/Yara-kids/compare/main...work`

### 4) CI automática no PR
Ao abrir PR para `main`, a Action roda build automático (job `ci`).

### 5) Merge no GitHub
Após aprovar PR e o CI passar, faça merge de `work` em `main`.

### 6) Deploy automático no Firebase
No push em `main`, a Action roda build + deploy (job `deploy`).

## 🔐 Secrets que você precisa configurar no GitHub
Vá em: **Settings > Secrets and variables > Actions > New repository secret**

Crie estes secrets:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `FIREBASE_TOKEN`

Sem esses secrets, a Action pode falhar na etapa de build/deploy.
