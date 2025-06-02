/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Ajoute ici toutes tes autres variables VITE_
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
