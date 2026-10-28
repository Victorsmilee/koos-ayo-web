import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { ConfigError } from './config-error'

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
export { ConfigError }

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
    throw new ConfigError(
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

  // supabase-js appends /rest/v1 itself, so a URL that already carries a path
  // produces /rest/v1/rest/v1 and PostgREST answers PGRST125, an unrecognised
  // path. That looked like a generic save failure for three days on 28 Oct 2026,
  // because the value was right in GitHub Actions and wrong in Vercel. Caught
  // here, where the message can name the variable.
  const path = new URL(url).pathname.replace(/\/+$/, '')
  if (path) {
    throw new ConfigError(
      `SUPABASE_URL must be the project URL with no path, received one ending ` +
        `'${path}'. The client appends /rest/v1 itself; leaving it on makes ` +
        `PostgREST return PGRST125.`,
    )
  }

  if (!SCHEMAS.includes(schema as DbSchema)) {
    throw new ConfigError(
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
