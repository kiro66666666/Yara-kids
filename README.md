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
