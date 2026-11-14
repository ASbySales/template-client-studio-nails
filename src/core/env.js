import { LOJA_TEMA } from '../config/tema'

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://lbtbxkwffixnvbsibcip.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JT7TZAE_0fxQcBHD8X-XpA_CHHmR9FT'

export const TENANT_ID =
  import.meta.env.VITE_TENANT_ID ||
  import.meta.env.VITE_TENANT_SLUG ||
  LOJA_TEMA.defaultTenantId

export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || LOJA_TEMA.defaultWhatsapp

export const TORRE_STATUS_TOKEN =
  import.meta.env.VITE_TORRE_STATUS_TOKEN || LOJA_TEMA.torreToken || ''

export const STORAGE_PREFIX = LOJA_TEMA.storagePrefix
export const STUDIO_LOGO = LOJA_TEMA.logo
