/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CINETPAY_SITE_ID: string;
  readonly VITE_CINETPAY_API_KEY: string;
  readonly VITE_TEMPO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
