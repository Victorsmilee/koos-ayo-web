import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client.
 *
 * The `server-only` import above makes the build FAIL if any client component
 * ever imports this file, so the secret key cannot reach a browser bundle by
 * accident.
 *
 * SUPABASE_DB_SCHEMA has no default on purpose. Defaulting to 'public' is
 * exactly how a preview deployment silently writes test data into the real
 * research dataset. Missing config should break loudly at startup instead.
 */

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `See apps/marketing/.env.example. SUPABASE_DB_SCHEMA must be ` +
        `'public' in production and 'staging' everywhere else.`,
    )
  }
  return value
}

/**
 * The client is generic over its schema, and we choose the schema at runtime,
 * so the concrete type differs between environments. This alias keeps both
 * shapes assignable without leaking `any` into call sites.
 */
type KoosDb = ReturnType<typeof build>

function build() {
  const url = required('SUPABASE_URL')
  const secretKey = required('SUPABASE_SECRET_KEY')
  const schema = required('SUPABASE_DB_SCHEMA')

  if (schema !== 'public' && schema !== 'staging') {
    throw new Error(
      `SUPABASE_DB_SCHEMA must be 'public' or 'staging', received '${schema}'.`,
    )
  }

  return createClient(url, secretKey, {
    db: { schema: schema as 'public' },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

let cached: KoosDb | null = null

export function getSupabase(): KoosDb {
  if (!cached) cached = build()
  return cached
}

export function currentSchema(): string {
  return required('SUPABASE_DB_SCHEMA')
}
