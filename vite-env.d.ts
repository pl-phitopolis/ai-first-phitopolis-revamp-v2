/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly VITE_GRAPHQL_URL?: string;
  readonly VITE_ASSETS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
