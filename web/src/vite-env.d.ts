/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_COMPANY_NAME: string
  readonly VITE_PRODUCT_NAME: string
  readonly VITE_COMPANY_NAME_SHORT: string
  readonly VITE_PRODUCT_FULL_NAME: string
  readonly VITE_TAGLINE: string
  readonly VITE_DESCRIPTION: string
  readonly VITE_URFMP_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
