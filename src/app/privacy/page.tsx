import type { Metadata } from 'next'
import Link from 'next/link'
import Eyebrow from '@/components/eyebrow'
import SiteHeader from '@/components/site-header'
import { CONTACT_EMAIL, RETENTION_PERIOD } from '@/lib/questions'

/**
 * GDPR privacy notice for the research survey (INF-57).
 *
 * STATUS (23 Oct 2026):
 *   [x] RETENTION_PERIOD  - 24 months (questions.ts)
 *   [x] CONTACT_EMAIL     - hello@koos-ayo.com (questions.ts)
 *   [x] Country           - Estonia
 *   [x] CONTROLLER_NAME   - Victor Ibrahim, a natural person (PO, 22 Oct 2026)
 *   [x] CONTROLLER_ADDRESS - Paldiski mnt 227c, 13520 Tallinn (PO, 23 Oct 2026)
 *
 * Every blank in this notice is now filled. The one thing still outstanding
 * before the link is shared is the legal review (INF-67), and the controller
 * switch when the company is registered (INF-103).
 *
 * This block must keep matching docs/gdpr/ropa.md section 1 in the PRIVATE repo
 * Victorsmilee/koos-ayo. A regulator compares the published notice against that
 * record, so the two change in the same pass, never separately.
 *
 * If the company is not yet registered when the survey goes live, the
 * controller is Victor Ibrahim as a natural person, at an Estonian address.
 * A controller must be an identifiable person or entity; "a company we are
 * about to form" is not one. Set CONTROLLER_NAME accordingly, then update it
 * when the company is registered.
 *
 * Still needs review by someone legally qualified (INF-67) before the link is
 * shared.
 */

export const metadata: Metadata = {
  title: 'Privacy notice',
  description: 'How KOOS handles the answers you give in The AYO Relationship Study.',
  robots: { index: false, follow: false },
}

// Estonia confirmed 21 Oct 2026. Name set 22 Oct 2026. Address completed
// 23 Oct 2026. No placeholder remains, so <Todo> now renders these as ordinary
// prose rather than highlighting them.
const CONTROLLER_NAME = 'Victor Ibrahim'
const CONTROLLER_ADDRESS = 'Paldiski mnt 227c, 13520 Tallinn'
const CONTROLLER_COUNTRY = 'Estonia'

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-10 sm:px-6 sm:py-14">
      <article className="mx-auto max-w-2xl">
        <Eyebrow>Research survey</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
          Privacy notice
        </h1>
        <p className="mt-3 text-base text-muted">
          How we handle the answers you give in The AYO Relationship Study.
        </p>

        <Block title="Who is responsible for your data">
          <p>
            The data controller is <Todo>{CONTROLLER_NAME}</Todo>, registered in{' '}
            {CONTROLLER_COUNTRY}, at <Todo>{CONTROLLER_ADDRESS}</Todo>.
          </p>
          <p className="mt-3">
            If you have any question about your data, or want to exercise any of the
            rights below, contact us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-accent underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
            . We answer within one month.
          </p>
        </Block>

        <Block title="What we collect">
          <p>We collect two separate things, and we keep them apart on purpose.</p>
          <ol className="mt-4 space-y-4">
            <li>
              <strong className="font-semibold">Your survey answers.</strong> These are
              anonymous. We do not ask for your name and we ask you not to include
              identifying details about yourself, your partner or anyone else. We do not
              record your IP address or your browser details, and the survey page runs no
              analytics and no third-party scripts of any kind.
            </li>
            <li>
              <strong className="font-semibold">
                Your email address, only if you choose to give it.
              </strong>{' '}
              This is stored in a completely separate table with no identifier, no
              timestamp and no link of any kind back to your answers. We cannot match
              your email to what you answered, and neither can anyone else.
            </li>
          </ol>
        </Block>

        <Block title="Partial answers">
          <p>
            If you start the survey and stop partway through, the answers you already
            gave are kept. Knowing where people stop tells us which questions are too
            long or too uncomfortable, which is genuinely useful to this research. You
            consent to this at the first question, before anything at all is stored.
          </p>
        </Block>

        <Block title="Questions about faith or religion">
          <p>
            One question asks how important faith or religion is in how you approach your
            relationship. Under the GDPR this is{' '}
            <strong className="font-semibold">special-category data</strong> (Article 9),
            which needs a higher standard of consent than ordinary answers.
          </p>
          <p className="mt-3">
            That question is optional. You can skip it, or select &ldquo;Prefer not to
            say&rdquo;. If you do answer it, you are giving your explicit consent for us
            to process that answer for this research only, under Article 9(2)(a).
          </p>
        </Block>

        <Block title="Why we are allowed to use it">
          <p>
            Our lawful basis is your <strong className="font-semibold">consent</strong>{' '}
            (Article 6(1)(a)), and for the faith question, your{' '}
            <strong className="font-semibold">explicit consent</strong> (Article
            9(2)(a)). You give that consent at the first question, and you are free not
            to.
          </p>
        </Block>

        <Block title="What we use it for">
          <p>
            Only to decide what to build, and what not to build. We use the answers to
            understand what people actually experience in relationships and what support
            would genuinely help. We do not sell this data, we do not share it for
            advertising, and we do not use it to train any public AI model.
          </p>
          <p className="mt-3">
            We may publish <strong className="font-semibold">anonymous summary
            statistics</strong> from this research: counts and percentages across all
            respondents. Those summaries never include your individual answers, anything
            you typed in your own words, or the question about faith. They are published
            only after the survey closes.
          </p>
        </Block>

        <Block title="How long we keep it">
          <p>
            Survey answers are kept for <strong className="font-semibold">
              {RETENTION_PERIOD}
            </strong>{' '}
            from the date you submit them, and then deleted. Email addresses are deleted as soon as the
            follow-up research they were given for is finished, or sooner if you ask.
          </p>
        </Block>

        <Block title="Who else can see it">
          <p>
            Only the KOOS research team. Published summaries are aggregates. No one
            outside the team sees an individual response. Three service providers process
            data on our behalf under data processing agreements, and none of them use it
            for their own purposes:
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <strong className="font-semibold">Hetzner Online GmbH</strong> (Germany):
              hosts the website.
            </li>
            <li>
              <strong className="font-semibold">Supabase</strong>: hosts the database, in
              Frankfurt, Germany.
            </li>
            <li>
              <strong className="font-semibold">Cloudflare</strong>: serves and protects
              the site.
            </li>
          </ul>
          <p className="mt-3">
            Your answers are stored in the European Union, in Frankfurt, Germany, and
            are not transferred outside it for storage.
          </p>
        </Block>

        <Block title="Your rights">
          <p>
            You have the right to access your data, correct it, have it deleted, restrict
            or object to how it is used, receive a copy of it, and withdraw consent at any
            time. You can also complain to your national data protection authority.
          </p>
          <p className="mt-3">
            <strong className="font-semibold">
              One important limit, stated honestly.
            </strong>{' '}
            Because your survey answers are genuinely anonymous, we have no way to find
            which response was yours. That means we cannot retrieve, correct or delete an
            individual set of answers once submitted, not for you, and not for anyone
            else who might ask. We consider that a protection rather than a limitation,
            but you should know it before you take part.
          </p>
          <p className="mt-3">
            Your email address is different: it is personal data, we can find it, and we
            will delete it on request. Email{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-accent underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            and we will remove it within one month.
          </p>
        </Block>

        <Block title="Cookies">
          <p>
            The survey sets one cookie. It holds a random identifier so that your answers
            are saved as you move between sections, and it expires after four hours. It
            is strictly necessary for the survey to work, it contains nothing about you,
            and it is not used for tracking or advertising. There are no other cookies on
            this site.
          </p>
        </Block>

        <Block title="Changes">
          <p>
            If we change this notice we will update this page. The research survey itself
            will not be reused for a different purpose than the one described here.
          </p>
        </Block>

        <p className="mt-12 rounded-koos border border-line bg-surface p-4 text-sm text-muted">
          KOOS is not a crisis service. If anything in the survey raised concerns about
          your safety or wellbeing, please contact your local emergency services or a
          support service in your country.
        </p>
      </article>
      </main>
    </>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-0 text-base text-ink">{children}</div>
    </section>
  )
}

/** Visible, unmissable marker for a value that must be filled before launch. */
/**
 * Highlights a value only while it is still unresolved.
 *
 * It used to highlight unconditionally, which meant a value that had been filled
 * in went on looking like a draft - and made the highlight useless as a signal,
 * because everything carried it. Now the marker decides: a string still holding
 * [TEAM TO CONFIRM is highlighted, anything else renders as normal prose. So
 * resolving a blank is a one-line change and the notice stops advertising it.
 */
function Todo({ children }: { children: React.ReactNode }) {
  const unresolved =
    typeof children !== 'string' || children.includes('[TEAM TO CONFIRM')
  if (!unresolved) return <>{children}</>
  return (
    <mark className="rounded bg-accent-soft px-1 font-semibold text-ink">{children}</mark>
  )
}
