import { ConfigError } from './config-error'

/**
 * Record WHY a write failed, without recording WHAT was being written.
 *
 * The hard rule is that no answer text, email or payload is ever logged. That
 * was previously honoured by logging nothing at all, which meant a real
 * production failure produced the generic "that didn't save" message and no
 * trace anywhere: the first live save failure on Vercel took days to diagnose
 * because the runtime logs were empty and the only route left was curl.
 *
 * This is the narrowest thing that fixes that. It is an ALLOWLIST, not a
 * redaction: nothing is written to the log unless it is on the list below, so
 * a future error shape cannot leak content by being unanticipated.
 *
 *   PostgREST failure   the error CODE only, e.g. 42501, PGRST106.
 *                       A code is an opaque identifier and cannot carry
 *                       respondent data. The message, details and hint are
 *                       NOT logged: PostgREST echoes row values into details
 *                       on a constraint violation.
 *   Config failure      the message, because we wrote it ourselves in
 *                       supabase-server.ts and it names an environment
 *                       variable, never a value.
 *   Anything else       the constructor name only, e.g. 'TypeError'.
 *
 * No `server-only` guard here on purpose: this module formats a string and
 * holds no secret and no connection, and its tests run in plain Node, where
 * `server-only` throws. The guard that matters stays on supabase-server.ts.
 *
 * What the codes mean, so a log line is actionable:
 *   42501     RLS denied the write. Usually .select() chained onto an insert.
 *   42P01     table does not exist in that schema.
 *   PGRST106  the schema is not in Supabase's exposed schemas.
 *   PGRST301  the key was rejected.
 */

/** The operation that failed. Fixed strings, never derived from input. */
export type SaveOperation =
  | 'save-section'
  | 'merge-saved'
  | 'submit-survey'
  | 'save-email'

/** The shape PostgREST errors arrive in. Only `code` is ever read. */
function postgrestCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null
  const code = (error as { code?: unknown }).code
  return typeof code === 'string' && code.length > 0 && code.length < 32
    ? code
    : null
}

/**
 * Build the log line. Exported so the test can assert on it directly rather
 * than capturing console output, which is what makes the privacy guarantee
 * testable instead of asserted.
 */
export function describeSaveFailure(
  operation: SaveOperation,
  error: unknown,
): string {
  const code = postgrestCode(error)
  if (code) return `koos: ${operation} failed, postgrest code ${code}`
  if (error instanceof ConfigError) {
    return `koos: ${operation} failed, configuration: ${error.message}`
  }
  const name =
    error instanceof Error ? error.constructor.name : typeof error
  return `koos: ${operation} failed, unexpected ${name}`
}

/** Write the line. Never called with a payload, and never passed one. */
export function logSaveFailure(operation: SaveOperation, error: unknown): void {
  console.error(describeSaveFailure(operation, error))
}
