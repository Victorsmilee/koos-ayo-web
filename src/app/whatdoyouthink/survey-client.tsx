'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { SavedResponse } from '@/lib/resume'
import {
  CONSENT_DECLINE,
  EMAIL_GATE_QUESTION_ID,
  EMAIL_QUESTION_ID,
  EMAIL_SHOWN_WHEN,
  conceptBox,
  consentQuestion,
  declineMessage,
  intro,
  sections,
  thankYou,
  type Question,
} from '@/lib/questions'
import Eyebrow from '@/components/eyebrow'
import OptionRow from '@/components/option-row'
import SiteHeader from '@/components/site-header'
import { saveEmail, saveSection, submitSurvey } from './actions'

/**
 * Short options read better side by side than stacked. Applied automatically so
 * no question has to be hand-tuned: roughly two thirds of the survey compresses,
 * and nothing about the questions themselves changes.
 */
const TWO_COLUMN_MAX_CHARS = 24
function useTwoColumns(options: string[] | undefined): boolean {
  if (!options || options.length < 4) return false
  return options.every((o) => o.length <= TWO_COLUMN_MAX_CHARS)
}

type Answers = Record<string, string | string[]>
type Screen = number | 'done' | 'declined'

const TOTAL = sections.length

/**
 * `saved` is an unfinished response belonging to this visitor, found by the id
 * in their own httpOnly cookie. Starting from it is what makes a refresh
 * survivable: before this, state began empty and the next save overwrote the
 * row, so a refresh at section 5 destroyed sections 1 to 4.
 */
export default function SurveyClient({
  saved,
}: {
  saved: SavedResponse | null
}) {
  const [screen, setScreen] = useState<Screen>(
    // Resume on the section after the furthest one saved, never past the end.
    saved ? (Math.min(saved.lastSection + 1, TOTAL) as Screen) : 0,
  )
  const [answers, setAnswers] = useState<Answers>(saved?.answers ?? {})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startedAt = useRef(Date.now())
  const honeypot = useRef('')
  const topRef = useRef<HTMLDivElement>(null)

  const setAnswer = (id: string, value: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [id]: value }))

  const focusTop = () => {
    topRef.current?.scrollIntoView({ block: 'start' })
    topRef.current?.focus()
  }

  /** Q35 appears only when Q34 is Yes or Maybe. */
  const visibleQuestions = (sectionIndex: number): Question[] => {
    const section = sections[sectionIndex - 1]
    if (!section) return []
    return section.questions.filter((q) => {
      if (q.id !== EMAIL_QUESTION_ID) return true
      const gate = answers[EMAIL_GATE_QUESTION_ID]
      return typeof gate === 'string' && EMAIL_SHOWN_WHEN.includes(gate)
    })
  }

  async function handleConsent() {
    // Q1 "No" ends the survey here. Nothing is stored.
    if (answers[consentQuestion.id] === CONSENT_DECLINE) {
      setScreen('declined')
      return
    }
    setScreen(1)
    focusTop()
  }

  async function handleNext(current: number) {
    setBusy(true)
    setError(null)

    const result = await saveSection({
      sectionIndex: current,
      answers,
      honeypot: honeypot.current,
      startedAt: startedAt.current,
    })

    setBusy(false)

    if (!result.ok) {
      setError(result.message ?? 'Something went wrong.')
      return
    }

    setScreen(current + 1)
    focusTop()
  }

  async function handleSubmit() {
    setBusy(true)
    setError(null)

    const result = await submitSurvey({
      sectionIndex: TOTAL,
      answers,
      honeypot: honeypot.current,
      startedAt: startedAt.current,
    })

    if (!result.ok) {
      setBusy(false)
      setError(result.message ?? 'Something went wrong.')
      return
    }

    // Separate call, separate table. Never linked to the answers above.
    const email = answers[EMAIL_QUESTION_ID]
    const followUp = answers[EMAIL_GATE_QUESTION_ID]
    if (
      typeof email === 'string' &&
      email.trim() &&
      typeof followUp === 'string' &&
      EMAIL_SHOWN_WHEN.includes(followUp)
    ) {
      await saveEmail(email.trim(), followUp.toLowerCase())
    }

    setBusy(false)
    setScreen('done')
    focusTop()
  }

  /* ----------------------------- terminal screens ----------------------- */

  if (screen === 'declined') {
    return (
      <Shell>
        <Card>
          <h1 className="text-2xl font-bold">{declineMessage.heading}</h1>
          <p className="mt-3 text-base text-ink">{declineMessage.body}</p>
          <Link
            href="/"
            className="mt-6 inline-block text-base font-semibold text-accent underline underline-offset-4"
          >
            Back to koos-ayo.com
          </Link>
        </Card>
      </Shell>
    )
  }

  if (screen === 'done') {
    return (
      <Shell>
        <Card>
          <h1 className="text-2xl font-bold">{thankYou.heading}</h1>
          <p className="mt-3 text-base text-ink">{thankYou.body}</p>
          <p className="mt-5 border-l-4 border-accent pl-4 text-base italic text-muted">
            {thankYou.safety}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-base font-semibold text-accent underline underline-offset-4"
          >
            Back to koos-ayo.com
          </Link>
        </Card>
      </Shell>
    )
  }

  /* -------------------------------- intro ------------------------------- */

  if (screen === 0) {
    return (
      <Shell>
        <div ref={topRef} tabIndex={-1} className="outline-none">
          <Eyebrow>{intro.eyebrow}</Eyebrow>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            {intro.title}
          </h1>
          <p className="mt-3 text-lg text-muted">{intro.subtitle}</p>
          <p className="mt-5 text-base text-ink">{intro.body}</p>

          <section
            aria-labelledby="privacy-heading"
            className="mt-7 rounded-koos border border-l-4 border-line border-l-accent bg-surface p-5"
          >
            <h2 id="privacy-heading" className="text-lg font-bold">
              {intro.privacyHeading}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {intro.privacyPoints.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm text-ink">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  <span>{highlightPlaceholders(point)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-md bg-accent-soft p-3 text-sm text-ink">
              {intro.articleNineNotice}
            </p>
            <p className="mt-3 text-sm text-muted">
              Full detail in our{' '}
              {/*
                Opens in a new tab so reading it never costs the respondent
                their place. rel is required with target _blank: without
                noopener the opened page can reach back through window.opener.
                The label says so out loud, because a link that silently
                hijacks or spawns tabs is worse for screen reader users.
              */}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent underline underline-offset-4"
              >
                privacy notice (opens in a new tab)
              </Link>
              .
            </p>
          </section>

          <p className="mt-6 text-base text-ink">{intro.closing}</p>

          <div className="mt-8">
            <QuestionField
              question={consentQuestion}
              value={answers[consentQuestion.id]}
              otherValue={answers[`${consentQuestion.id}_other`] as string}
              onChange={setAnswer}
            />
          </div>

          <Honeypot onChange={(v) => (honeypot.current = v)} />

          <Nav
            busy={busy}
            error={error}
            nextLabel={answers[consentQuestion.id] === CONSENT_DECLINE ? 'Finish' : 'Start'}
            nextDisabled={!answers[consentQuestion.id]}
            onNext={handleConsent}
          />
          {!answers[consentQuestion.id] && (
            <p className="mt-3 text-sm text-muted">
              Please answer question 1 to continue. Every other question can be skipped.
            </p>
          )}
        </div>
      </Shell>
    )
  }

  /* ------------------------------- sections ----------------------------- */

  const section = sections[screen - 1]
  const questions = visibleQuestions(screen)
  const isLast = screen === TOTAL

  return (
    <Shell>
      <div ref={topRef} tabIndex={-1} className="outline-none">
        <Progress current={screen} total={TOTAL} />

        <div className="mt-7">
          <Eyebrow>
            Section {screen} of {TOTAL} · {section.title}
          </Eyebrow>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
          {section.title}
        </h1>
        {section.helper && (
          <p className="mt-2 text-base italic text-muted">{section.helper}</p>
        )}

        {/* The concept description sits above Q19, as printed. */}
        {screen === 4 && (
          <div className="mt-5 rounded-koos border border-l-4 border-line border-l-accent bg-surface p-5">
            {conceptBox.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-base text-ink first:mt-0">
                {p}
              </p>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-5">
          {questions.map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              value={answers[q.id]}
              otherValue={answers[`${q.id}_other`] as string}
              onChange={setAnswer}
            />
          ))}
        </div>

        <Honeypot onChange={(v) => (honeypot.current = v)} />

        <Nav
          busy={busy}
          error={error}
          nextLabel={isLast ? 'Finish' : 'Next'}
          onNext={() => (isLast ? handleSubmit() : handleNext(screen))}
          onBack={() => {
            setScreen(screen - 1)
            focusTop()
          }}
        />
      </div>
    </Shell>
  )
}

/* ------------------------------- components ------------------------------ */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
    </>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-koos border border-line bg-surface p-6 sm:p-8">
      {children}
    </div>
  )
}

function Progress({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Section {current} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Survey progress"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function QuestionField({
  question,
  value,
  otherValue,
  onChange,
}: {
  question: Question
  value: string | string[] | undefined
  otherValue: string | undefined
  onChange: (id: string, value: string | string[]) => void
}) {
  const selected = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value],
  )
  const atLimit =
    typeof question.maxSelections === 'number' &&
    selected.length >= question.maxSelections

  const showOther = question.hasOther && selected.includes('Other')
  const twoColumns = useTwoColumns(question.options)

  const legend = (
    <>
      <span className="font-semibold text-accent">{question.number}.</span>{' '}
      <span className="font-semibold text-ink">{question.text}</span>{' '}
      {question.instruction && (
        <span className="font-normal italic text-muted">{question.instruction}</span>
      )}
    </>
  )

  if (question.kind === 'text' || question.kind === 'email') {
    const inputId = `field-${question.id}`
    return (
      <div className="rounded-koos border border-line bg-surface p-5">
        <label htmlFor={inputId} className="block text-base leading-relaxed">
          {legend}
        </label>
        {question.helper && (
          <p className="mt-1.5 text-sm italic text-muted">{question.helper}</p>
        )}
        {question.kind === 'email' ? (
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            className="mt-3 min-h-[52px] w-full rounded-koos border border-line bg-raised px-4 text-base text-ink"
          />
        ) : (
          <textarea
            id={inputId}
            rows={4}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            className="mt-3 w-full rounded-koos border border-line bg-raised p-4 text-base text-ink"
          />
        )}
      </div>
    )
  }

  const multiple = question.kind === 'many'

  return (
    <div
      role="group"
      aria-labelledby={`${question.id}-label`}
      className="rounded-koos border border-line bg-surface p-5"
    >
      <p id={`${question.id}-label`} className="text-base leading-relaxed">
        {legend}
      </p>
      {question.helper && (
        <p className="mt-1.5 text-sm italic text-muted">{question.helper}</p>
      )}
      {typeof question.maxSelections === 'number' && (
        <p className="mt-1.5 text-sm text-muted" aria-live="polite">
          {selected.length} of {question.maxSelections} selected
        </p>
      )}

      <div
        className={
          twoColumns
            ? 'mt-3 grid gap-2 sm:grid-cols-2'
            : 'mt-3 grid gap-2'
        }
      >
        {question.options?.map((option) => {
          const isSelected = selected.includes(option)
          const disabled = multiple && atLimit && !isSelected

          return (
            <OptionRow
              key={option}
              id={`${question.id}-${slug(option)}`}
              name={question.id}
              label={option}
              multiple={multiple}
              checked={isSelected}
              disabled={disabled}
              onToggle={() => {
                if (!multiple) {
                  onChange(question.id, option)
                  return
                }
                onChange(
                  question.id,
                  isSelected
                    ? selected.filter((v) => v !== option)
                    : [...selected, option],
                )
              }}
            />
          )
        })}
      </div>

      {showOther && (
        <div className="mt-3">
          <label
            htmlFor={`${question.id}-other-text`}
            className="block text-sm text-muted"
          >
            Please tell us more
          </label>
          <input
            id={`${question.id}-other-text`}
            type="text"
            value={otherValue ?? ''}
            onChange={(e) => onChange(`${question.id}_other`, e.target.value)}
            className="mt-1.5 min-h-[52px] w-full rounded-koos border border-line bg-raised px-4 text-base text-ink"
          />
        </div>
      )}
    </div>
  )
}

function Nav({
  busy,
  error,
  nextLabel,
  nextDisabled,
  onNext,
  onBack,
}: {
  busy: boolean
  error: string | null
  nextLabel: string
  nextDisabled?: boolean
  onNext: () => void
  onBack?: () => void
}) {
  return (
    <div className="mt-10">
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-koos border border-accent bg-accent-soft p-3.5 text-base text-ink"
        >
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="min-h-[52px] rounded-koos border border-line bg-surface px-6 text-base font-semibold text-ink disabled:opacity-50"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={busy || nextDisabled}
          className="min-h-[52px] rounded-koos bg-accent px-8 text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {busy ? 'Saving…' : nextLabel}
        </button>
      </div>
    </div>
  )
}

/** Hidden from people, visible to naive bots. Never shown, never announced. */
function Honeypot({ onChange }: { onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor="koos-website">Website</label>
      <input
        id="koos-website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/* -------------------------------- helpers -------------------------------- */

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** Makes the unresolved [TEAM TO CONFIRM] blanks impossible to miss. */
function highlightPlaceholders(text: string) {
  const parts = text.split(/(\[TEAM TO CONFIRM:[^\]]*\])/g)
  return parts.map((part, i) =>
    part.startsWith('[TEAM TO CONFIRM') ? (
      <mark key={i} className="bg-accent-soft font-semibold text-ink">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}
