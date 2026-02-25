const runtimeConfig = typeof window !== 'undefined' ? (window.__APP_CONFIG__ ?? {}) : {};

export const environment = {
  production: false,
  geminiApiKey: runtimeConfig.geminiApiKey || '',
  supabase: {
    url: runtimeConfig.supabaseUrl || '',
    anonKey: runtimeConfig.supabaseAnonKey || ''
  },
  firebase: {
    config: {
      apiKey: runtimeConfig.firebaseApiKey || '',
      authDomain: runtimeConfig.firebaseAuthDomain || '',
      projectId: runtimeConfig.firebaseProjectId || '',
      storageBucket: runtimeConfig.firebaseStorageBucket || '',
      messagingSenderId: runtimeConfig.firebaseMessagingSenderId || '',
      appId: runtimeConfig.firebaseAppId || '',
      measurementId: runtimeConfig.firebaseMeasurementId || ''
    },
    vapidKey: runtimeConfig.firebaseVapidKey || ''
  }
};
