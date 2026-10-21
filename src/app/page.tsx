import Link from 'next/link'
import Eyebrow from '@/components/eyebrow'
import SiteHeader from '@/components/site-header'

/**
 * KOOS marketing home page — first version.
 *
 * Every claim here traces to an approved document:
 *   positioning + loop ... MVP Brief v2 §3, §4
 *   problem framing ..... MVP Brief v2 §1
 *   privacy stance ...... Competitive Strategy §19, MVP Brief v2 §9
 *   boundaries .......... Blueprint §5, MVP Brief v2 §13
 *
 * The product does not exist yet, so the copy stays in the conditional and the
 * only call to action is the research survey. Nothing here promises
 * availability, and nothing claims KOOS is therapy.
 *
 * Mobile-first: single column by default, multi-column only from `sm:` upward.
 */

export default function HomePage() {
  return (
    <>
      <SiteHeader wide badge="In development" />

      <main id="main">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-24 lg:pb-28 lg:pt-28">
          <div className="mx-auto max-w-5xl">
            <Eyebrow>Relationship intelligence · in development</Eyebrow>
            <h1 className="mt-4 max-w-4xl text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[4rem]">
              Learn how your relationship
              <span className="text-rose"> actually works</span>.
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-ink sm:mt-7 sm:text-xl lg:text-2xl">
              You can&rsquo;t always choose what you feel. You can learn to choose what you
              do with it.
            </p>

            <p className="mt-4 max-w-2xl text-base text-muted lg:text-lg">
              KOOS is a private relationship coach being built for the moments that
              actually go wrong — and for learning, over time, what helps you.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
              <Link
                href="/whatdoyouthink"
                className="inline-flex min-h-[52px] items-center justify-center rounded-koos bg-accent px-6 text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover"
              >
                Tell us what you need
              </Link>
              <span className="text-sm text-muted">
                Anonymous research survey · about 8 minutes
              </span>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* The problem — MVP Brief v2 §1                                    */}
        {/* ---------------------------------------------------------------- */}
        <Section title="The hard part isn't knowing what you feel">
          <p className="max-w-2xl text-lg">
            It&rsquo;s what you do in the thirty seconds after.
          </p>
          <PointGrid>
            <Point>
              The same arguments repeat, following a cycle that&rsquo;s almost impossible
              to see while you&rsquo;re in it.
            </Point>
            <Point>
              A feeling can be completely valid while the reaction it produces makes
              things worse.
            </Point>
            <Point>
              Therapy is valuable, but it&rsquo;s rarely available at 9pm on a Tuesday
              when the argument is actually happening.
            </Point>
            <Point>
              General AI gives reasonable advice, then forgets your situation and never
              finds out whether its advice worked.
            </Point>
            <Point>
              One partner often wants to change things while the other isn&rsquo;t ready
              to take part.
            </Point>
          </PointGrid>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* How it works — MVP Brief v2 §4, §5                               */}
        {/* ---------------------------------------------------------------- */}
        <Section title="How KOOS would work" tint>
          <p className="max-w-2xl text-lg">
            Not a chatbot you have to know what to ask. A short guided path through the
            moment itself.
          </p>
          <ol className="mt-8 grid gap-6 md:grid-cols-2 md:gap-x-12 md:gap-y-8">
            <Step n={1} title="Something happened">
              Capture it while it&rsquo;s fresh — what happened, what you feel, and what
              you&rsquo;re tempted to do about it.
            </Step>
            <Step n={2} title="Understand it">
              Separate the feeling from the fact, and both from the story you&rsquo;re
              telling yourself. KOOS can hold your experience and your
              partner&rsquo;s possible experience at the same time, without picking a
              winner.
            </Step>
            <Step n={3} title="Choose a response">
              Pause, calm, curious, constructive, repair, or set a boundary. You pick
              one, or edit it into your own words.
            </Step>
            <Step n={4} title="Act in real life">
              You act — not the app. If it&rsquo;s a message, KOOS can show you how it
              might land before you send it.{' '}
              <strong className="font-semibold">KOOS never sends anything.</strong>
            </Step>
            <Step n={5} title="Say what happened">
              Come back and tell it how things actually went. Better, same or worse.
            </Step>
            <Step n={6} title="It learns what works for you">
              Over time your patterns become visible, and the suggestions start drawing
              on what has genuinely worked for you before.
            </Step>
          </ol>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Differentiation — MVP Brief v2 §3                                */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Why not just ask ChatGPT?">
          <p className="max-w-2xl text-lg">
            You can, and it will answer well. It just won&rsquo;t remember your
            relationship, and it will never learn whether what it told you helped.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
            <Compare label="General AI">Ask → Answer</Compare>
            <Compare label="Couples apps">Prompt → Activity → Connection</Compare>
            <Compare label="KOOS" highlight>
              Experience → Understand → Choose → Act → Measure → Learn → Improve
            </Compare>
          </div>
          <p className="mt-6 text-base text-muted">
            That closing loop is the whole point. Advice you never measure is just
            advice.
          </p>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Privacy — Competitive Strategy §19, MVP Brief v2 §9              */}
        {/* ---------------------------------------------------------------- */}
        <Section title="A safe place to work on yourself" tint>
          <p className="max-w-2xl text-lg">
            Not a surveillance system for your partner.
          </p>
          <PointGrid>
            <Point>Private by default. Your account is yours alone.</Point>
            <Point>
              You can see everything KOOS remembers about you, correct it, or delete it.
            </Point>
            <Point>
              Before KOOS remembers anything lasting, it asks you first.
            </Point>
            <Point>
              No hidden monitoring and no partner access. There is no way for someone
              else to read your private entries.
            </Point>
            <Point>
              It has to be worth using even if your partner never joins — so it focuses
              on what you can understand and change, never on getting them to change.
            </Point>
          </PointGrid>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Boundaries — Blueprint §5, MVP Brief v2 §13                      */}
        {/* ---------------------------------------------------------------- */}
        <Section title="What KOOS is not">
          <ul className="grid gap-4 md:grid-cols-2 md:gap-x-12 md:gap-y-5">
            <Point>
              <strong className="font-semibold">Not therapy.</strong> It is coaching,
              reflection and practice. It will tell you when something needs a
              professional.
            </Point>
            <Point>
              <strong className="font-semibold">Not a judge.</strong> It won&rsquo;t
              decide who was right, and it won&rsquo;t diagnose you or your partner.
            </Point>
            <Point>
              <strong className="font-semibold">Not a monitoring tool.</strong> It will
              never help anyone track, test or control a partner.
            </Point>
            <Point>
              <strong className="font-semibold">Not automatic.</strong> It never sends a
              message or takes an action on your behalf. You decide, every time.
            </Point>
            <Point>
              <strong className="font-semibold">Not a promise.</strong> No app can
              guarantee a relationship. KOOS helps you change what&rsquo;s yours to
              change.
            </Point>
          </ul>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Research CTA                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl rounded-koos border border-line bg-surface p-6 sm:p-10 lg:p-14">
            {/* The campaign line. Deliberately NOT the survey's own title: the
                study includes separated, divorced and single respondents, and
                a couples framing at the top of the instrument would filter
                exactly the people we most need to hear from. */}
            <Eyebrow>Two People, One Journey</Eyebrow>
            <h2 className="mt-3 max-w-3xl text-2xl font-bold sm:text-3xl lg:text-4xl">
              We&rsquo;re deciding what to build. Help us get it right.
            </h2>
            <p className="mt-4 max-w-2xl text-base text-ink sm:text-lg">
              Before writing the product, we want to understand what actually happens in
              real relationships and what kind of support would genuinely help. The
              survey is anonymous, takes about eight minutes, and honest negative
              answers are the most useful ones.
            </p>
            <Link
              href="/whatdoyouthink"
              className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center rounded-koos bg-accent px-6 text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover sm:w-auto"
            >
              Start the survey
            </Link>
            <p className="mt-4 text-sm text-muted">
              No account, no tracking, and you can stop at any point.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-4 text-sm text-muted">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-base font-semibold text-ink">
              KOOS&#8209;AYO
            </span>
            <span>together, with joy</span>
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
            KOOS is not a crisis service. If you are in immediate danger, contact your
            local emergency services.
          </p>
        </div>
      </footer>
    </>
  )
}

/* --------------------------------- bits --------------------------------- */

function Section({
  title,
  children,
  tint = false,
}: {
  title: string
  children: React.ReactNode
  tint?: boolean
}) {
  return (
    <section
      className={`px-4 py-14 sm:px-6 sm:py-20 lg:py-24 ${
        tint ? 'border-y border-line bg-surface' : ''
      }`}
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {/* Prose stays within a readable measure even when the section is wide. */}
        <div className="mt-5">{children}</div>
      </div>
    </section>
  )
}

/** Two readable columns on a wide screen, one on a phone. */
function PointGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-6 grid gap-4 md:grid-cols-2 md:gap-x-12 md:gap-y-5">{children}</ul>
  )
}

function Point({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-rose"
      />
      <span className="text-base text-ink">{children}</span>
    </li>
  )
}

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent">
        {n}
      </span>
      <div>
        <h3 className="font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-base text-muted">{children}</p>
      </div>
    </li>
  )
}

function Compare({
  label,
  children,
  highlight = false,
}: {
  label: string
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-koos border p-4 ${
        highlight ? 'border-accent bg-accent-soft' : 'border-line bg-raised'
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-base font-medium text-ink">{children}</p>
    </div>
  )
}
