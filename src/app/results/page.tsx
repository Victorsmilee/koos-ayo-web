import type { Metadata } from 'next'
import Link from 'next/link'
import Eyebrow from '@/components/eyebrow'
import SiteHeader from '@/components/site-header'
import { CompletionDonut, DropOffChart } from '@/components/charts'
import { results, share, showFigures } from '@/lib/results'

/**
 * What the research found. INF-109.
 *
 * Static, rendered from a reviewed commit. This page never queries the
 * research tables and holds no credential, so there is nothing here to leak
 * even in principle. `src/lib/results.ts` validates the file at build time
 * against the promises the privacy notice makes.
 *
 * It renders figures only once collection has closed. Showing results while
 * the survey is still open biases the sample: later respondents anchor on what
 * earlier ones said, and willingness to pay is both the most susceptible
 * answer and the hardest signal to get.
 */

export const metadata: Metadata = {
  title: 'What the research found',
  description:
    'Anonymous summary statistics from The AYO Relationship Study: counts and percentages across all respondents, never individual answers.',
}

const { collectionWindow: window } = results

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function ResultsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-10 sm:px-6 sm:py-14">
        <article className="mx-auto max-w-2xl">
          <Eyebrow>The AYO Relationship Study</Eyebrow>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            What the research found
          </h1>
          <p className="mt-3 text-base text-muted">
            Counts and percentages across everyone who answered. Never an individual
            response, never anything anyone typed.
          </p>

          {showFigures ? <Figures /> : <StillRunning />}

          <Method />
        </article>
      </main>
    </>
  )
}

/**
 * The state this page is in until the survey closes, and the honest thing to
 * show. An empty results page with a promise is better than a biased one.
 */
function StillRunning() {
  return (
    <section className="mt-10 rounded-koos border border-line bg-surface p-5">
      <h2 className="text-xl font-bold sm:text-2xl">The study is still running</h2>
      <p className="mt-3 text-base text-ink">
        We publish the summary once collection closes, not while it is open. Showing
        results as they arrive changes the answers people give: it is hard to say what
        you would pay for something after reading what everyone else said they would
        pay.
      </p>
      <p className="mt-3 text-base text-ink">
        So there is nothing to show yet, and that is deliberate.
      </p>
      <Link
        href="/whatdoyouthink"
        className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-koos bg-accent px-6 text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover sm:w-auto"
      >
        Take part in the study
      </Link>
      <p className="mt-4 text-sm text-muted">
        About 8 minutes. No account, no tracking, and you can stop at any point.
      </p>
    </section>
  )
}

function Figures() {
  return (
    <>
      <section className="mt-10 rounded-koos border border-line bg-surface p-5">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <CompletionDonut
            completed={results.responsesCompleted}
            started={results.responsesStarted}
          />
          <dl className="space-y-4">
            <Headline label="People who took part" value={results.responsesStarted} />
            <Headline
              label="Collected"
              value={
                window.first && window.last
                  ? `${formatDate(window.first)} to ${formatDate(window.last)}`
                  : 'Not recorded'
              }
            />
          </dl>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold sm:text-xl">How far people got</h2>
        <p className="mt-1 text-sm text-muted">
          The study has {results.dropOff.length} sections and takes about eight
          minutes.
        </p>
        <div className="mt-4">
          <DropOffChart
            sections={results.dropOff}
            started={results.responsesStarted}
          />
        </div>
      </section>

      {results.questions.map((question) => {
        // Every figure is a share of the people who answered THAT question,
        // which is rarely the number at the top of the page. A question people
        // skipped has a smaller base, and saying so is the difference between
        // evidence and marketing.
        const options = Object.entries(question.counts)
        return (
          <section key={question.number} className="mt-10">
            <h2 className="text-lg font-semibold sm:text-xl">{question.text}</h2>
            <p className="mt-1 text-sm text-muted">
              {question.base} {question.base === 1 ? 'person' : 'people'} answered this
              question
            </p>
            <ul className="mt-4 space-y-3">
              {options.map(([option, count]) => (
                <li key={option}>
                  <Bar option={option} count={count} base={question.base} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}

function Headline({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-ink">{value}</dd>
    </div>
  )
}

function Bar({
  option,
  count,
  base,
}: {
  option: string
  count: number | null
  base: number
}) {
  const percent = share(count, base)

  // A suppressed cell is not a zero. Drawing it as an empty bar would read as
  // "nobody chose this", which is a claim the data does not support.
  if (count === null) {
    return (
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-base text-ink">{option}</span>
        <span className="text-sm text-muted">
          too few to publish
        </span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-base text-ink">{option}</span>
        <span className="text-sm text-muted">
          {count} of {base}
          {percent === null ? '' : ` · ${percent}%`}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-raised ring-1 ring-inset ring-line"
        role="img"
        aria-label={`${option}: ${count} of ${base}`}
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${percent ?? 0}%` }}
        />
      </div>
    </div>
  )
}

/**
 * What is missing from this page, and why. A results page that does not say
 * what it left out is asking to be read as the whole picture.
 */
function Method() {
  return (
    <section className="mt-12 rounded-koos border border-line bg-surface p-5 text-sm text-muted">
      <h2 className="text-base font-semibold text-ink">How to read this</h2>
      <ul className="mt-3 space-y-2">
        <li>
          Every percentage is a share of the people who answered{' '}
          <strong className="font-semibold text-ink">that question</strong>, which is
          usually fewer than the number who took part. Every question but the first
          could be skipped.
        </li>
        <li>
          Where fewer than {results.minCell} people gave an answer, we say so rather
          than publishing the number. Small groups can be identified by combining a
          few answers, so the figure is withheld, not rounded.
        </li>
        <li>
          The question about faith or religion is not published at all, in any form.
          It is special-category data under GDPR.
        </li>
        <li>
          Nothing anyone typed appears here, in any form, including summarised.
        </li>
        <li>
          Questionnaire version {results.surveyVersion}. Figures generated{' '}
          {formatDate(results.generatedOn)}.
        </li>
      </ul>
      <p className="mt-4">
        <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
          How we handle the answers
        </Link>
      </p>
    </section>
  )
}
