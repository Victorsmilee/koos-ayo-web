'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import OptionRow from '@/components/option-row'
import QuietSound from '@/components/quiet-sound'
import QuizMark from '@/components/quiz-mark'
import {
  PATHS,
  SOLO_PATHS,
  isSolo,
  questionsFor,
  type PathId,
  type QuizAnswers,
} from '@/lib/quiz'
import { complete, saveProgress } from './actions'

/**
 * One question per screen, four or five options, instant advance.
 *
 * WHY NO NEXT BUTTON on single-select. Tapping an option and then tapping Next
 * is two actions to express one decision, and across eight screens that is
 * sixteen taps instead of eight. The screens that do carry a button are the
 * ones where the answer is not complete until you say so: multi-select, and
 * the consent screen.
 *
 * WHY THE ADVANCE IS DELAYED. Roughly a third of a second, so the option can
 * be seen to select before the screen changes. Without it the tap feels like
 * it did nothing and people tap twice. It is skipped entirely under
 * prefers-reduced-motion, where the honest thing is to move at once.
 *
 * STATE LIVES HERE, NOT ON THE SERVER. Answers are held in React and saved in
 * the background. A failed save never blocks anyone: they keep their answers
 * and keep going, which is the lesson the survey learned the expensive way
 * when a refresh deleted them.
 */

type Step = 'consent' | number | 'result'

export default function QuizClient() {
  const [step, setStep] = useState<Step>('consent')
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [path, setPath] = useState<PathId | null>(null)
  const [claimToken, setClaimToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  /*
   * Draws the eye to the starting point once, when the result appears.
   *
   * NOT a pulse. Anything that moves on a loop for more than five seconds has
   * to come with a way to stop it (WCAG 2.2.2), it reads as an advertisement
   * on a page about something personal, and attention that is demanded
   * continuously stops being attention after the second repeat. One movement
   * does the same job and then leaves the person alone to read.
   */
  const [revealed, setRevealed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heading = useRef<HTMLHeadingElement | null>(null)

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Move focus to the new question. Without this a screen reader stays where
  // the old option was and never announces that the question changed.
  useEffect(() => {
    heading.current?.focus()
  }, [step])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  // One frame after the result mounts, so the transition has a start state to
  // move from. Under prefers-reduced-motion the classes do not animate, and
  // the card is simply there.
  useEffect(() => {
    if (step !== 'result') return
    const id = setTimeout(() => setRevealed(true), 250)
    return () => clearTimeout(id)
  }, [step])

  /*
   * Which questions get asked depends on the first answer. Someone single or
   * separated takes a shorter path about past patterns, because the main path
   * asks six questions about a relationship they are not in.
   *
   * Recomputed on every render rather than stored, so going Back to the first
   * question and changing the answer re-routes immediately instead of leaving
   * someone part way down a path that no longer applies.
   */
  const questions = questionsFor(answers)
  const total = questions.length
  const index = typeof step === 'number' ? step : 0
  const question = questions[Math.min(index, total - 1)]

  const advance = useCallback(
    (next: QuizAnswers, from: number) => {
      // The length of the path THIS answer set implies, not the one on screen
      // a moment ago: answering the first question is what chooses the path.
      const length = questionsFor(next).length
      const done = from + 1 >= length
      const go = () => {
        if (done) {
          setBusy(true)
          complete({ answers: next, questionIndex: length })
            .then((r) => {
              setPath((r.path as PathId) ?? 'interrupt')
              setClaimToken(r.claimToken ?? null)
              setStep('result')
            })
            .finally(() => setBusy(false))
        } else {
          setStep(from + 1)
          // Fire and forget: the answer is already in React, and a save that
          // fails must not stop anyone finishing.
          void saveProgress({ answers: next, questionIndex: from + 1 })
        }
      }
      if (reduced) go()
      else timer.current = setTimeout(go, 320)
    },
    [reduced],
  )

  function choose(optionId: string, value: string) {
    const q = question
    if (q.multiple) {
      const current = answers[q.id] ?? []
      const has = current.includes(value)
      const limit = q.maxSelections ?? q.options.length
      if (!has && current.length >= limit) return
      setAnswers({
        ...answers,
        [q.id]: has ? current.filter((v) => v !== value) : [...current, value],
      })
      return
    }
    const next = { ...answers, [q.id]: [value] }
    setAnswers(next)
    advance(next, index)
  }

  /* ------------------------------- consent ------------------------------- */

  if (step === 'consent') {
    return (
      <Shell progress={0}>
        <QuizMark className="mx-auto mb-7 h-20 w-auto sm:h-24" />

        <h1
          ref={heading}
          tabIndex={-1}
          className="text-center font-serif text-3xl leading-tight focus-visible:[outline:none] sm:text-4xl"
        >
          Eight questions about what happens when you disagree
        </h1>
        <p className="mt-4 text-center text-base text-muted">
          About two minutes. At the end you get the one thing most likely to
          change how your next disagreement goes.
        </p>

        <div className="mt-8 rounded-koos border border-line bg-surface p-5 text-sm">
          <p className="text-ink">
            We keep your answers so KooS can be useful to you from the first
            day, and so we can ask you the hard one again later and show you
            what changed.
          </p>
          <ul className="mt-3 space-y-1.5 text-muted">
            <li>No name, no email, unless you give one at the end.</li>
            <li>No advertising, no tracking, nothing sold.</li>
            <li>
              You can ask us to delete it at any time, at{' '}
              <a
                href="mailto:hello@koos-ayo.com"
                className="text-accent underline underline-offset-4"
              >
                hello@koos-ayo.com
              </a>
              .
            </li>
          </ul>
          <p className="mt-3 text-muted">
            <Link href="/privacy" className="text-accent underline underline-offset-4">
              How we handle your answers
            </Link>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStep(0)}
          className="mt-8 min-h-[52px] w-full rounded-koos bg-accent px-6 text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover"
        >
          I agree, start
        </button>
        <p className="mt-3 text-center text-sm text-muted">
          Starting is how you agree. Nothing is stored before you do.
        </p>
      </Shell>
    )
  }

  /* -------------------------------- result ------------------------------- */

  if (step === 'result' && path) {
    const p = PATHS[path]
    // Same destination, different sentences: the partnered copy says "your
    // next disagreement" to somebody who is not having one.
    const copy = isSolo(answers) ? SOLO_PATHS[path] : p
    return (
      <Shell progress={1}>
        <p className="text-sm font-semibold uppercase tracking-eyebrow text-accent">
          Where to start
        </p>
        <h1
          ref={heading}
          tabIndex={-1}
          className="mt-3 font-serif text-3xl leading-tight focus-visible:[outline:none] sm:text-4xl"
        >
          {copy.headline}
        </h1>
        <p className="mt-5 text-lg text-muted">{copy.body}</p>

        {/*
          The starting point, made the loudest thing on the screen.

          It used to be a quiet outline box holding two words, below a headline
          that was three times its size, which meant the one piece of the page
          a person is meant to leave with was the piece they scrolled past.

          Tinted rather than outlined, and carrying what the thing actually
          DOES. `ink` on `accent-soft` is a pair the contrast guard already
          proves in both themes, which is why the fill is that one and not a
          new colour.

          It reveals once, a moment after the result lands, instead of
          pulsing. See `revealed` below.
        */}
        <div
          className={[
            'mt-8 rounded-koos border-2 border-accent bg-accent-soft p-5 sm:p-6',
            'transition-all duration-500 ease-out motion-reduce:transition-none',
            revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          ].join(' ')}
        >
          <p className="text-sm font-semibold uppercase tracking-eyebrow text-accent">
            Your starting point
          </p>
          <p className="mt-1.5 font-serif text-3xl leading-tight text-ink">
            {p.name}
          </p>
          <p className="mt-3 text-base text-ink">{p.does}</p>

          <ul className="mt-4 space-y-2.5">
            {p.gives.map((line) => (
              <li key={line} className="flex gap-2.5 text-base text-ink">
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="mt-1 h-4 w-4 shrink-0"
                  fill="none"
                >
                  <circle cx="8" cy="8" r="7.25" stroke="var(--koos-accent)" strokeWidth="1.5" />
                  <path
                    d="M4.8 8.3l2.2 2.2 4.2-4.6"
                    stroke="var(--koos-accent)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/*
          The claim token travels in the URL because sign-up is on a different
          origin: app.koos-ayo.com cannot read a cookie set here. It is an
          opaque handle on one row, and the app validates it as a uuid before
          it stores anything.

          Absent when the save failed, and then the link simply has no token:
          promising someone their answers are waiting when no row was written
          would be worse than saying nothing.
        */}
        <a
          href={
            claimToken
              ? `https://app.koos-ayo.com/signin?quiz=${encodeURIComponent(claimToken)}`
              : 'https://app.koos-ayo.com/signin'
          }
          className="mt-8 block min-h-[52px] rounded-koos bg-accent px-6 py-3.5 text-center text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover"
        >
          Create an account and start here
        </a>
        {claimToken ? (
          <p className="mt-3 text-center text-sm text-muted">
            Your answers come with you.
          </p>
        ) : null}
        <p className="mt-4 text-sm text-muted">
          {isSolo(answers)
            ? 'KooS never sends messages for you, and nobody else sees what you write.'
            : 'KooS never sends messages for you, and never shows your partner what you write.'}
        </p>
      </Shell>
    )
  }

  /* ------------------------------- questions ----------------------------- */

  const selected = answers[question.id] ?? []
  const limit = question.maxSelections ?? question.options.length

  return (
    <Shell progress={index / total}>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {index + 1} of {total}
        </span>
        {index > 0 && (
          <button
            type="button"
            onClick={() => setStep(index - 1)}
            className="font-semibold text-accent underline underline-offset-4"
          >
            Back
          </button>
        )}
      </div>

      <h1
        ref={heading}
        // Focused on every step so a screen reader announces the new
        // question instead of staying silent where the old option was. The
        // ring is suppressed because this is a heading, not a control: a
        // keyboard user hears it, and nobody needs to see a box drawn round
        // text they did not tab to.
        tabIndex={-1}
        id={`q-${question.id}`}
        className="mt-5 font-serif text-2xl leading-tight focus-visible:[outline:none] sm:text-3xl"
      >
        {question.text}
      </h1>
      {question.help && <p className="mt-3 text-base text-muted">{question.help}</p>}

      {/*
        role="group" with aria-labelledby, not <fieldset>. A <legend> cannot be
        laid out as a block and overflows the card: docs/brand/foundations.
      */}
      <div
        role="group"
        aria-labelledby={`q-${question.id}`}
        className="mt-7 space-y-3"
      >
        {question.options.map((option, i) => (
          <OptionRow
            key={option}
            id={`${question.id}-${i}`}
            name={question.id}
            label={option}
            multiple={Boolean(question.multiple)}
            checked={selected.includes(option)}
            disabled={
              Boolean(question.multiple) &&
              !selected.includes(option) &&
              selected.length >= limit
            }
            onToggle={() => choose(`${question.id}-${i}`, option)}
          />
        ))}
      </div>

      {question.multiple && (
        <button
          type="button"
          disabled={selected.length === 0 || busy}
          onClick={() => advance(answers, index)}
          className="mt-7 min-h-[52px] w-full rounded-koos bg-accent px-6 text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {index + 1 >= total ? 'See where to start' : 'Continue'}
        </button>
      )}
    </Shell>
  )
}

/** The card, the progress bar and the gutter. One place, so every step agrees. */
function Shell({
  progress,
  children,
}: {
  progress: number
  children: React.ReactNode
}) {
  return (
    <div className="relative mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
      {/*
        Concentric rings, the same two overlapping circles opened out. Quiet
        enough to read as texture rather than as a picture, and placed behind
        the card so no text ever sits on a gradient. aria-hidden and
        pointer-events-none: it is decoration and must not be reachable.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 mx-auto h-[26rem] max-w-2xl opacity-70 motion-reduce:hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 30%, var(--koos-accent-soft), transparent 58%),' +
            'radial-gradient(circle at 72% 38%, rgb(160 84 104 / 0.14), transparent 55%)',
        }}
      />
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="How far through you are"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${Math.max(progress * 100, 2)}%` }}
        />
      </div>
      <div className="mt-8 rounded-koos border border-line bg-surface p-5 sm:p-7">
        {children}
      </div>
      {/* Below the card, not in the header: it is an option, not a control
          anyone needs to find before they start. Off until asked for. */}
      <div className="mt-4 flex justify-center">
        <QuietSound />
      </div>
    </div>
  )
}
