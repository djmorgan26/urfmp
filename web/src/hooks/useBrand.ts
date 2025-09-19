import { useMemo } from 'react'
import { BrandConfig, getBrandConfig } from '@urfmp/types'

export function useBrand(): BrandConfig {
  return useMemo(() => getBrandConfig(), [])
}
