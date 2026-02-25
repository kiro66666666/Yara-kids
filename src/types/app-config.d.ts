export {};

declare global {
  interface Window {
    __APP_CONFIG__?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      geminiApiKey?: string;
      firebaseApiKey?: string;
      firebaseAuthDomain?: string;
      firebaseProjectId?: string;
      firebaseStorageBucket?: string;
      firebaseMessagingSenderId?: string;
      firebaseAppId?: string;
      firebaseMeasurementId?: string;
      firebaseVapidKey?: string;
    };
  }
}
