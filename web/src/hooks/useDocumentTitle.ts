import { useEffect } from 'react'
import { useBrand } from './useBrand'

export function useDocumentTitle(pageTitle?: string) {
  const brand = useBrand()

  useEffect(() => {
    const title = pageTitle
      ? `${pageTitle} - ${brand.productName}`
      : `${brand.productName} - ${brand.productFullName}`

    document.title = title
  }, [pageTitle, brand.productName, brand.productFullName])
}
