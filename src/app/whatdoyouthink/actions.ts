'use server'

import { cookies } from 'next/headers'
import { getSupabase } from '@/lib/supabase-server'
import {
  answersSchema,
  emailSchema,
  followUpSchema,
  sectionPayloadSchema,
} from '@/lib/validation'
import { SURVEY_VERSION } from '@/lib/questions'

/**
 * Server Actions for the research survey.
 *
 * PROGRESSIVE SAVE
 *   The response row is created when the respondent finishes the first section
 *   and updated as they go, so an abandoned survey still tells us where people
 *   stop. Consent is taken at Q1 before anything is written, so partial rows
 *   are consented. The privacy notice says partial answers are kept.
 *
 * THE ROW ID NEVER REACHES THE BROWSER
 *   It lives in an httpOnly cookie. A respondent cannot read or alter it from
 *   the page, and it is the only cookie this route sets — strictly necessary,
 *   therefore exempt from consent-banner requirements.
 *
 * TWO TABLES, NEVER JOINED
 *   An email goes to research_contacts and nowhere else. q35 is stripped from
 *   the answers payload defensively on every single write, regardless of what
 *   the client sent.
 *
 * LOGGING
 *   No answer text, no email, and no payload is ever logged — not to the
 *   console, not to an error reporter. Only the shape of a failure is recorded.
 */

const RESPONSE_COOKIE = 'koos_rid'
const COOKIE_MAX_AGE = 60 * 60 * 4 // 4 hours — long enough to finish, then gone
const MIN_ELAPSED_MS = 15_000 // a human cannot complete 36 questions faster

export interface ActionResult {
  ok: boolean
  message?: string
}

const GENERIC_ERROR =
  "Sorry — that didn't save. Please check your connection and try again."

/** q35 is the email question. It must never appear in the answers table. */
function stripEmail(answers: Record<string, unknown>): Record<string, unknown> {
  const { q35, q35_other, ...rest } = answers
  void q35
  void q35_other
  return rest
}

async function readResponseId(): Promise<string | null> {
  const store = await cookies()
  return store.get(RESPONSE_COOKIE)?.value ?? null
}

async function writeResponseId(id: string): Promise<void> {
  const store = await cookies()
  store.set(RESPONSE_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/whatdoyouthink',
    maxAge: COOKIE_MAX_AGE,
  })
}

/**
 * Save progress at the end of a section. Creates the row on first call.
 * Called on every Next, so it must be cheap and must never block the UI on
 * failure — a save error is reported but the respondent keeps their answers
 * client-side and can continue.
 */
export async function saveSection(input: unknown): Promise<ActionResult> {
  const parsed = sectionPayloadSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: GENERIC_ERROR }
  }

  const { sectionIndex, answers, honeypot } = parsed.data

  // Bot: pretend everything worked, write nothing.
  if (honeypot && honeypot.trim().length > 0) {
    return { ok: true }
  }

  const payload = stripEmail(answers)

  try {
    const supabase = getSupabase()
    const existingId = await readResponseId()

    if (existingId) {
      const { error } = await supabase
        .from('research_responses')
        .update({
          answers: payload,
          last_section: sectionIndex,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingId)
      // NOTE: no .select() chained. With RLS on and no policies, asking
      // PostgREST to return the row would fail with 42501.

      if (error) return { ok: false, message: GENERIC_ERROR }
      return { ok: true }
    }

    const id = crypto.randomUUID()
    const { error } = await supabase.from('research_responses').insert({
      id,
      survey_version: SURVEY_VERSION,
      answers: payload,
      last_section: sectionIndex,
      completed: false,
    })

    if (error) return { ok: false, message: GENERIC_ERROR }

    await writeResponseId(id)
    return { ok: true }
  } catch {
    // Deliberately swallowing the cause: it can contain answer content.
    return { ok: false, message: GENERIC_ERROR }
  }
}

/**
 * Final submit. Marks the response complete and, separately, stores the
 * follow-up email if one was given.
 */
export async function submitSurvey(input: unknown): Promise<ActionResult> {
  const parsed = sectionPayloadSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: GENERIC_ERROR }
  }

  const { answers, honeypot, startedAt } = parsed.data

  if (honeypot && honeypot.trim().length > 0) {
    return { ok: true }
  }

  if (startedAt && Date.now() - startedAt < MIN_ELAPSED_MS) {
    return { ok: true }
  }

  const payload = stripEmail(answers)

  try {
    const supabase = getSupabase()
    const existingId = await readResponseId()
    const id = existingId ?? crypto.randomUUID()

    if (existingId) {
      const { error } = await supabase
        .from('research_responses')
        .update({
          answers: payload,
          completed: true,
          last_section: 8,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingId)
      if (error) return { ok: false, message: GENERIC_ERROR }
    } else {
      const { error } = await supabase.from('research_responses').insert({
        id,
        survey_version: SURVEY_VERSION,
        answers: payload,
        completed: true,
        last_section: 8,
      })
      if (error) return { ok: false, message: GENERIC_ERROR }
      await writeResponseId(id)
    }

    return { ok: true }
  } catch {
    return { ok: false, message: GENERIC_ERROR }
  }
}

/**
 * Store a follow-up email. Separate call, separate table, no response id, and
 * a DATE rather than a timestamp — so a row here cannot be matched to an
 * answer row by submission time.
 */
export async function saveEmail(
  rawEmail: unknown,
  rawFollowUp: unknown,
): Promise<ActionResult> {
  const email = emailSchema.safeParse(rawEmail)
  if (!email.success) {
    return { ok: false, message: 'That email address does not look right.' }
  }

  const followUp = followUpSchema.safeParse(
    typeof rawFollowUp === 'string' ? rawFollowUp.toLowerCase() : rawFollowUp,
  )
  if (!followUp.success) {
    return { ok: false, message: GENERIC_ERROR }
  }

  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('research_contacts').insert({
      email: email.data,
      follow_up: followUp.data,
    })
    if (error) return { ok: false, message: GENERIC_ERROR }
    return { ok: true }
  } catch {
    return { ok: false, message: GENERIC_ERROR }
  }
}

/** Validate answers without writing. Used by the client before final submit. */
export async function validateAnswers(input: unknown): Promise<ActionResult> {
  return answersSchema.safeParse(input).success
    ? { ok: true }
    : { ok: false, message: GENERIC_ERROR }
}
