
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL_ROOT: string
  // Ajoutez d'autres variables VITE_ si nécessaire plus tard
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}