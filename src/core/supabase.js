import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env'

// Adaptador para PostgREST local (Docker) e tuneis (Localtunnel/Ngrok)
const isLocalOrTunnel = Boolean(SUPABASE_URL && !SUPABASE_URL.includes('supabase.co'))

const customFetch = async (input, init = {}) => {
  if (isLocalOrTunnel) {
    let url = typeof input === 'string' ? input : (input?.url || input?.toString() || '')
    url = url.replace('/rest/v1/', '/')

    const headers = new Headers(
      input instanceof Request ? input.headers : (init.headers || {})
    )
    headers.delete('authorization')
    headers.delete('Authorization')

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }

    return fetch(url, { ...init, headers })
  }
  return fetch(input, init)
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: isLocalOrTunnel ? { fetch: customFetch } : {},
})
