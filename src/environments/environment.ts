const runtimeConfig = typeof window !== 'undefined' ? (window.__APP_CONFIG__ ?? {}) : {};
const cleanConfigValue = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/^\s+/, '').replace(/,\s*$/, '');
};

export const environment = {
  production: false,
  geminiApiKey: cleanConfigValue(runtimeConfig.geminiApiKey),
  supabase: {
    url: cleanConfigValue(runtimeConfig.supabaseUrl),
    anonKey: cleanConfigValue(runtimeConfig.supabaseAnonKey)
  },
  firebase: {
    config: {
      apiKey: cleanConfigValue(runtimeConfig.firebaseApiKey),
      authDomain: cleanConfigValue(runtimeConfig.firebaseAuthDomain),
      projectId: cleanConfigValue(runtimeConfig.firebaseProjectId),
      storageBucket: cleanConfigValue(runtimeConfig.firebaseStorageBucket),
      messagingSenderId: cleanConfigValue(runtimeConfig.firebaseMessagingSenderId),
      appId: cleanConfigValue(runtimeConfig.firebaseAppId),
      measurementId: cleanConfigValue(runtimeConfig.firebaseMeasurementId)
    },
    vapidKey: cleanConfigValue(runtimeConfig.firebaseVapidKey)
  }
};
