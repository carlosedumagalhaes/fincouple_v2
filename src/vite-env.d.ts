/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_KEY: string
  readonly VITE_PASS_CADU: string
  readonly VITE_PASS_STEPHANIE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
