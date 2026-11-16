'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import OptionRow from '@/components/option-row'
import QuietSound from '@/components/quiet-sound'
import {
  PATHS,
  QUIZ,
  TOTAL_QUESTIONS,
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
  const [busy, setBusy] = useState(false)
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

  const index = typeof step === 'number' ? step : 0
  const question = QUIZ[index]

  const advance = useCallback(
    (next: QuizAnswers, from: number) => {
      const done = from + 1 >= TOTAL_QUESTIONS
      const go = () => {
        if (done) {
          setBusy(true)
          complete({ answers: next, questionIndex: TOTAL_QUESTIONS })
            .then((r) => {
              setPath((r.path as PathId) ?? 'interrupt')
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
    const q = QUIZ[index]
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
        <h1
          ref={heading}
          tabIndex={-1}
          className="font-serif text-3xl leading-tight focus-visible:[outline:none] sm:text-4xl"
        >
          Eight questions about what happens when you disagree
        </h1>
        <p className="mt-4 text-base text-muted">
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
          {p.headline}
        </h1>
        <p className="mt-5 text-lg text-muted">{p.body}</p>

        <div className="mt-8 rounded-koos border border-line bg-surface p-5">
          <p className="text-sm font-semibold uppercase tracking-eyebrow text-muted">
            Your starting point
          </p>
          <p className="mt-2 font-serif text-2xl text-ink">{p.name}</p>
        </div>

        <a
          href="https://app.koos-ayo.com/signin"
          className="mt-8 block min-h-[52px] rounded-koos bg-accent px-6 py-3.5 text-center text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover"
        >
          Create an account and start here
        </a>
        <p className="mt-4 text-sm text-muted">
          KooS never sends messages for you, and never shows your partner what
          you write.
        </p>
      </Shell>
    )
  }

  /* ------------------------------- questions ----------------------------- */

  const selected = answers[question.id] ?? []
  const limit = question.maxSelections ?? question.options.length

  return (
    <Shell progress={index / TOTAL_QUESTIONS}>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {index + 1} of {TOTAL_QUESTIONS}
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
          {index + 1 >= TOTAL_QUESTIONS ? 'See where to start' : 'Continue'}
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
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
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
