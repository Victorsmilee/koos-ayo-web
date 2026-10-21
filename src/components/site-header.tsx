import Link from 'next/link'
import ThemeToggle from './theme-toggle'
import Wordmark from './wordmark'

/**
 * One header for every page, so the theme toggle is always reachable and the
 * wordmark is consistent. `wide` matches the marketing page's 5xl measure;
 * the survey and privacy pages use the narrower column.
 */
export default function SiteHeader({
  wide = false,
  badge,
}: {
  wide?: boolean
  badge?: string
}) {
  return (
    <header className="px-4 pt-6 sm:px-6">
      <div
        className={`mx-auto flex items-center justify-between gap-4 ${
          wide ? 'max-w-5xl' : 'max-w-2xl'
        }`}
      >
        <div className="flex items-baseline gap-3">
          <Link href="/" className="text-ink no-underline" aria-label="KOOS-AYO home">
            <Wordmark className="text-ink" />
          </Link>
          {/* koos-ayo: "together, with joy" */}
          <span className="hidden text-sm text-muted sm:inline">
            together, with joy
          </span>
        </div>

        <div className="flex items-center gap-3">
          {badge && (
            <span className="rounded-full border border-line bg-raised px-3 py-1 text-xs font-semibold text-muted">
              {badge}
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
