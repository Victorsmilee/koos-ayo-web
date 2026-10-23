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

/** The only schemas this project uses. The migration creates exactly these. */
export const SCHEMAS = ['public', 'staging'] as const
export type DbSchema = (typeof SCHEMAS)[number]

/**
 * Table names, defined once. They must match supabase/migrations/0001_research.sql,
 * which is the other place they exist; nothing else may spell them out.
 */
export const TABLES = {
  responses: 'research_responses',
  contacts: 'research_contacts',
} as const

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `See .env.example. SUPABASE_DB_SCHEMA must be one of ` +
        `${SCHEMAS.map((s) => `'${s}'`).join(' or ')}.`,
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

  if (!SCHEMAS.includes(schema as DbSchema)) {
    throw new Error(
      `SUPABASE_DB_SCHEMA must be one of ` +
        `${SCHEMAS.map((s) => `'${s}'`).join(' or ')}, received '${schema}'.`,
    )
  }

  return createClient(url, secretKey, {
    db: { schema: schema as DbSchema },
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
