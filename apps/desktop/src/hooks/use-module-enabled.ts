import { useMemo } from 'react'

const CORE_MODULES = ['products', 'customers', 'transactions', 'orders', 'payments']

export interface Shop {
  id: string
  features_config: string | null
}

/**
 * Hook para verificar se um módulo está habilitado
 * @param moduleCode - Código do módulo a verificar
 * @param featuresConfig - JSON string do features_config (opcional)
 * @param shop - Shop object com features_config (opcional)
 * @returns true se o módulo estiver habilitado, false caso contrário
 */
export function useModuleEnabled(
  moduleCode: string,
  featuresConfig?: string | null,
  shop?: Shop | null
): boolean {
  return useMemo(() => {
    // Módulos core sempre habilitados
    if (CORE_MODULES.includes(moduleCode)) {
      return true
    }

    // Se shop foi passado, usar features_config do shop
    const configString = shop?.features_config ?? featuresConfig

    // Sem configuração = todos habilitados (compatibilidade retroativa)
    if (!configString) {
      return true
    }

    try {
      const config = JSON.parse(configString)
      return config[moduleCode] === true
    } catch {
      // JSON inválido = todos habilitados (safe default)
      return true
    }
  }, [moduleCode, featuresConfig, shop])
}
