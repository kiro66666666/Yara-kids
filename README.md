# YARA Kids

Loja virtual Angular com deploy no Firebase Hosting e backend no Supabase.

## Setup local

1. Instale dependencias:
   ```bash
   npm ci
   ```
2. Configure `public/app-config.js` com as chaves publicas do seu projeto.
3. Rode local:
   ```bash
   npm start
   ```

## Runtime config (frontend)

O frontend le configuracao de `window.__APP_CONFIG__` em `public/app-config.js`.

Campos esperados:

- `supabaseUrl`
- `supabaseAnonKey`
- `geminiApiKey`
- `firebaseApiKey`
- `firebaseAuthDomain`
- `firebaseProjectId`
- `firebaseStorageBucket`
- `firebaseMessagingSenderId`
- `firebaseAppId`
- `firebaseMeasurementId`
- `firebaseVapidKey`

Importante:

- `supabaseAnonKey` e chaves Firebase Web sao publicas por natureza.
- Nunca use `SUPABASE_SERVICE_ROLE_KEY` no frontend.

## Deploy automatico (GitHub -> Firebase)

Workflow: `.github/workflows/firebase-deploy.yml`

Crie estes Secrets no GitHub (Settings -> Secrets and variables -> Actions):

- `FIREBASE_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`
- `FIREBASE_VAPID_KEY`

No deploy, o workflow gera `public/app-config.js` em runtime com esses secrets.

## Secrets de backend (Supabase Edge Functions)

Esses secrets devem ficar apenas no Supabase:

- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Exemplo:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=...
supabase secrets set RESEND_API_KEY=...
```

## Admin

Nao existe senha secreta no frontend.

Acesso admin depende de role no Supabase:

- `app_metadata.role = 'admin'` (preferencial)
- fallback: `user_metadata.role = 'admin'`

Rota protegida: `/admin`.
