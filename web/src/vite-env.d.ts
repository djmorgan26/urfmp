/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_COMPANY_NAME: string
  readonly VITE_PRODUCT_NAME: string
  readonly VITE_COMPANY_NAME_SHORT: string
  readonly VITE_PRODUCT_FULL_NAME: string
  readonly VITE_TAGLINE: string
  readonly VITE_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
