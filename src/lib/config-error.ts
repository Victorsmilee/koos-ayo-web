/**
 * A missing or invalid environment variable, as opposed to a database error.
 *
 * It lives in its own module, with no `server-only` guard, for one reason: it
 * is a plain Error subclass carrying no secret and no connection, and both the
 * failure logger and its tests need to recognise it. `supabase-server.ts`
 * re-exports it and keeps its own guard, so the secret key is no less
 * protected than before.
 *
 * Typed rather than a bare Error so that save-failure.ts can log its message
 * safely: we wrote these messages, and they name an environment variable
 * rather than any value held in one.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}
