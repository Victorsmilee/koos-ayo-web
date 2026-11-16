import Link from 'next/link'
import Wordmark from '@/components/wordmark'
import { COPYRIGHT_HOLDER, OPERATOR_LINE } from '@/lib/operator'

/**
 * The site footer, on every public page rather than only the homepage.
 *
 * Extracted when the quiz was added. A landing page that an advertisement
 * points at is exactly the page where someone wants to know who is asking and
 * what happens to their answers, so the legal band and the privacy link cannot
 * live only on the homepage.
 *
 * The company name and the copyright holder are read from `operator.ts`, never
 * typed here: the published privacy notice reads the same constants, so the
 * footer and the notice cannot name two different entities. A regulator
 * compares the notice against the Article 30 record, and two spellings of one
 * company is the kind of mismatch that reads as a second organisation.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-line px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>together, with joy</span>
          <Link href="/results" className="underline underline-offset-4 hover:text-ink">
            Research results
          </Link>
          <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
            Privacy
          </Link>
          <a
            href="mailto:hello@koos-ayo.com"
            className="underline underline-offset-4 hover:text-ink"
          >
            hello@koos-ayo.com
          </a>
        </div>
        <p>
          KooS is not a crisis service. If you are in immediate danger, contact your
          local emergency services.
        </p>

        {/*
          The operating company, named where anyone can find it. Stacked on a
          phone and split left and right from sm upwards, so the attribution
          never crowds the copyright at 390px. The hairline above it is the
          three-layer rule: a new band needs an edge, not just a gap.

          The wordmark carries an explicit width because footer type is 14px
          and the mark's default 1.6em sizing would land it under the 120px
          minimum in docs/brand/foundations/usage.md.
        */}
        <div
          data-testid="site-footer-legal"
          className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-3 text-ink">
            <Wordmark width="128px" />
            <span className="text-muted">
              &copy; {new Date().getFullYear()} {COPYRIGHT_HOLDER}
            </span>
          </span>
          <span>{OPERATOR_LINE}</span>
        </div>
      </div>
    </footer>
  )
}
