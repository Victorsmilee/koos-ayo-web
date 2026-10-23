import 'server-only'
import { cookies } from 'next/headers'
import { RESPONSE_COOKIE } from './response-cookie'
import { TABLES, getSupabase } from './supabase-server'

export interface SavedResponse {
  answers: Record<string, string | string[]>
  lastSection: number
}

/**
 * Load an unfinished response so a refresh does not cost the respondent their
 * answers.
 *
 * Without this, state began empty on every load and the next save overwrote the
 * whole answers column, so refreshing at section 5 destroyed sections 1 to 4 in
 * the database. On an eight minute survey on a phone that was going to happen to
 * real people.
 *
 * Reading back is safe here: the row is found only by the id in the
 * respondent's own httpOnly cookie, the secret key bypasses RLS, and the email
 * answer is never in this table to begin with. The CLAUDE.md rule is about
 * chaining .select() onto an insert or update, which fails with 42501 under
 * zero policies. A standalone select does not.
 *
 * A completed response is deliberately NOT resumed. Returning null leaves the
 * stale cookie pointing at a finished row, so the caller clears it and the next
 * save starts a new one rather than overwriting a submitted response.
 */
export async function loadSavedResponse(): Promise<SavedResponse | null> {
  const store = await cookies()
  const id = store.get(RESPONSE_COOKIE)?.value
  if (!id) return null

  try {
    const { data, error } = await getSupabase()
      .from(TABLES.responses)
      .select('answers, last_section, completed')
      .eq('id', id)
      .maybeSingle()

    if (error || !data || data.completed) return null

    return {
      answers: (data.answers ?? {}) as SavedResponse['answers'],
      lastSection: data.last_section ?? 0,
    }
  } catch {
    // Never block the survey on a failed resume: an empty form still works.
    return null
  }
}
