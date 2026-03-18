declare module "*.png" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  readonly VITE_ADMIN_UID: string;
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_FACULTY_UID: string;
  readonly VITE_FACULTY_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
