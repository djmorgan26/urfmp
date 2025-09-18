export interface BrandConfig {
  companyName: string
  companyNameShort: string
  productName: string
  productFullName: string
  tagline: string
  description: string
}

export const defaultBrandConfig: BrandConfig = {
  companyName: 'URFMP',
  companyNameShort: 'URFMP',
  productName: 'URFMP',
  productFullName: 'Universal Robot Fleet Management Platform',
  tagline: 'The Stripe of Robotics',
  description: 'Monitor any robot in 7 lines of code'
}

// Environment variable override support
export const getBrandConfig = (): BrandConfig => {
  if (typeof process !== 'undefined' && process.env) {
    return {
      companyName: process.env.VITE_COMPANY_NAME || process.env.COMPANY_NAME || defaultBrandConfig.companyName,
      companyNameShort: process.env.VITE_COMPANY_NAME_SHORT || process.env.COMPANY_NAME_SHORT || defaultBrandConfig.companyNameShort,
      productName: process.env.VITE_PRODUCT_NAME || process.env.PRODUCT_NAME || defaultBrandConfig.productName,
      productFullName: process.env.VITE_PRODUCT_FULL_NAME || process.env.PRODUCT_FULL_NAME || defaultBrandConfig.productFullName,
      tagline: process.env.VITE_TAGLINE || process.env.TAGLINE || defaultBrandConfig.tagline,
      description: process.env.VITE_DESCRIPTION || process.env.DESCRIPTION || defaultBrandConfig.description
    }
  }

  return defaultBrandConfig
}