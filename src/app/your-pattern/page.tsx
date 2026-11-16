import type { Metadata } from 'next'
import SiteFooter from '@/components/site-footer'
import Wordmark from '@/components/wordmark'
import QuizClient from './quiz-client'

/**
 * The onboarding quiz, at /your-pattern.
 *
 * The route is part of the product, not decoration. An advertisement points
 * here, so the slug is what carries any search value: "your pattern" is close
 * to what people actually type when the same argument keeps coming back, and
 * it is specific enough not to be one of ten thousand pages called /quiz.
 *
 * Indexed, unlike the survey. /whatdoyouthink is noindex because it is a
 * research instrument and a stray search result would skew who answers it.
 * This is a landing page and wants to be found.
 *
 * No analytics, no pixel, no third-party script. The survey found that data
 * security and privacy were respondents' first and second objections, and
 * roughly half said a privacy concern would make them stop using a product
 * like this. A tracking pixel on the page where we ask how someone argues
 * would be the cheapest possible way to prove them right.
 */
export const metadata: Metadata = {
  title: 'Your pattern',
  description:
    'Eight questions about what happens when you disagree, and the one thing most likely to change how the next one goes.',
  openGraph: {
    title: 'Your pattern, in eight questions',
    description:
      'Two minutes. At the end, the one thing most likely to change how your next disagreement goes.',
    type: 'website',
  },
}

export default function YourPattern() {
  return (
    <>
      <header className="border-b border-line px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl justify-center sm:justify-start">
          <a href="/" aria-label="KooS home">
            <Wordmark width="140px" />
          </a>
        </div>
      </header>

      <main id="main" className="min-h-[70dvh]">
        <QuizClient />
      </main>

      <SiteFooter />
    </>
  )
}
