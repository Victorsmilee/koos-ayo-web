'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { QUESTIONS, QUIZ, QUIZ_VERSION, resultPath, type QuizAnswers } from '@/lib/quiz'
import { logSaveFailure } from '@/lib/save-failure'
import { TABLES, getSupabase } from '@/lib/supabase-server'

/**
 * Saving the onboarding quiz.
 *
 * WHAT IS STORED AND WHY IT IS ALLOWED
 * Answers are kept so that someone's first day in KOOS is shaped by what they
 * said here, and so that the escalation question can be re-asked later and
 * compared. That is processing before any account exists, so the basis is
 * CONSENT, taken on the first screen, not contract. The published notice and
 * the Article 30 record both describe it before this ships.
 *
 * WHAT IS NEVER STORED
 * No email beside the answers, no IP address, no user agent, no referrer, and
 * nothing a respondent typed is ever logged. The ad network already knows where
 * the click came from.
 *
 * THE COOKIE
 * One cookie, holding one random id. It is strictly necessary: without it a
 * refresh loses the answers and the quiz has to start again. It carries no
 * meaning on its own and is not used for anything else, which is why there is
 * no cookie banner here, exactly as on the survey.
 */

export interface QuizResult {
  ok: boolean
  /** Set only on completion, so the client can show the right path. */
  path?: string
  message?: string
}

const GENERIC_ERROR = 'We could not save that. Your answers are still here.'

const COOKIE = 'koos-quiz'
const QUIZ_PATH = '/your-pattern'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

/**
 * Answers are validated against the instrument rather than accepted as typed.
 * An unknown id or an option that is not on the list is dropped, so a crafted
 * payload cannot write arbitrary json into the row.
 */
const answersSchema = z.record(z.string(), z.array(z.string()))

const payloadSchema = z.object({
  answers: answersSchema,
  questionIndex: z.number().int().min(0).max(QUESTIONS.length),
  /** Hidden field. A human never fills it in. */
  honeypot: z.string().optional(),
})

function clean(raw: Record<string, string[]>): QuizAnswers {
  const out: QuizAnswers = {}
  for (const q of QUIZ) {
    const given = raw[q.id]
    if (!Array.isArray(given)) continue
    const allowed = given.filter((v) => q.options.includes(v))
    if (allowed.length === 0) continue
    const limit = q.multiple ? (q.maxSelections ?? q.options.length) : 1
    out[q.id] = allowed.slice(0, limit)
  }
  return out
}

async function readId(): Promise<string | null> {
  const store = await cookies()
  const value = store.get(COOKIE)?.value
  return value && z.string().uuid().safeParse(value).success ? value : null
}

async function writeId(id: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: QUIZ_PATH,
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
}

/** Progress, saved as someone moves through. Never blocks the UI. */
export async function saveProgress(input: unknown): Promise<QuizResult> {
  const parsed = payloadSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: GENERIC_ERROR }

  const { answers, questionIndex, honeypot } = parsed.data
  // Bot: answer as though it worked, write nothing.
  if (honeypot && honeypot.trim().length > 0) return { ok: true }

  const payload = clean(answers)

  try {
    const supabase = getSupabase()
    const existing = await readId()

    if (existing) {
      const { error } = await supabase
        .from(TABLES.quiz)
        .update({
          answers: payload,
          // The furthest question reached, never the most recent saved. Going
          // back and re-saving must not make drop-off look shallower than it
          // was. Same rule as the survey, same reason.
          last_question: questionIndex,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing)
      // No .select() chained: RLS is on with no policies, so asking PostgREST
      // to return the row fails with 42501.
      if (error) {
        logSaveFailure('quiz-save', error)
        return { ok: false, message: GENERIC_ERROR }
      }
      return { ok: true }
    }

    const id = crypto.randomUUID()
    const { error } = await supabase.from(TABLES.quiz).insert({
      id,
      quiz_version: QUIZ_VERSION,
      answers: payload,
      last_question: questionIndex,
    })
    if (error) {
      logSaveFailure('quiz-start', error)
      return { ok: false, message: GENERIC_ERROR }
    }
    await writeId(id)
    return { ok: true }
  } catch (error) {
    logSaveFailure('quiz-start', error)
    return { ok: false, message: GENERIC_ERROR }
  }
}

/**
 * Finishing. The path is computed on the server so the result cannot be chosen
 * by editing a request, and so the stored row and the screen always agree.
 */
export async function complete(input: unknown): Promise<QuizResult> {
  const parsed = payloadSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: GENERIC_ERROR }

  const { answers, honeypot } = parsed.data
  const payload = clean(answers)
  const path = resultPath(payload)

  // A bot gets a result screen and no row, so the funnel still looks finished.
  if (honeypot && honeypot.trim().length > 0) return { ok: true, path }

  try {
    const supabase = getSupabase()
    const existing = await readId()
    const id = existing ?? crypto.randomUUID()

    const row = {
      answers: payload,
      last_question: QUESTIONS.length,
      completed: true,
      result_path: path,
      updated_at: new Date().toISOString(),
    }

    const { error } = existing
      ? await supabase.from(TABLES.quiz).update(row).eq('id', id)
      : await supabase
          .from(TABLES.quiz)
          .insert({ id, quiz_version: QUIZ_VERSION, ...row })

    if (error) {
      logSaveFailure('quiz-complete', error)
      // The result is still shown. Someone who answered eight questions should
      // not be handed an error because our database had a bad minute.
      return { ok: true, path }
    }
    if (!existing) await writeId(id)
    return { ok: true, path }
  } catch (error) {
    logSaveFailure('quiz-complete', error)
    return { ok: true, path }
  }
}
