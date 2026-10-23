/**
 * Deployment environments, named once. Client-safe: no secrets, no server-only
 * import, so the layout can use it.
 */
export const APP_ENVS = ['production', 'preview', 'staging'] as const
export type AppEnv = (typeof APP_ENVS)[number]

export const PRODUCTION: AppEnv = 'production'

/** True anywhere that is not production, which is what the banner keys off. */
export function isNotProduction(value: string | undefined): boolean {
  return value !== undefined && value !== PRODUCTION
}
