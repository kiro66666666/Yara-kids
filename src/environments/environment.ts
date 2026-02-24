const runtimeConfig = globalThis.window?.__APP_CONFIG__;

export const environment = {
  production: false,
  geminiApiKey: runtimeConfig?.geminiApiKey || '',
  supabase: {
    url: runtimeConfig?.supabaseUrl || '',
    anonKey: runtimeConfig?.supabaseAnonKey || ''
  },
  firebase: {
    config: {
      apiKey: 'AIzaSyAH_MV39FVnB42KnVFXfdr3GG2K8q5Qoac',
      authDomain: 'yara-kids-b48ed.firebaseapp.com',
      projectId: 'yara-kids-b48ed',
      storageBucket: 'yara-kids-b48ed.firebasestorage.app',
      messagingSenderId: '932740760869',
      appId: '1:932740760869:web:df0ecfd475ebccd7b286cc',
      measurementId: 'G-1QNZFB6J88'
    },
    vapidKey: 'BJKDKxSrHiU4ZjaFFIwsaisdeVa6xiiH7DREs1XH_GhYI1o6LtiAOfyrqUbScr4Oq33XJ68Mj9xrxQO7NOJI-tc'
  }
};
