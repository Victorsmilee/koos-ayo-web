import 'server-only'
import { TABLES, getSupabase } from '@/lib/supabase-server'

/**
 * How many people have taken part, and how long is left.
 *
 * Product Owner, 29 Oct 2026: a target of 150 respondents, with the running
 * count shown only once it reaches 10.
 *
 * Product Owner, 15 November 2026: the closing date is dropped and collection
 * stays open. It had been published as 15 November, and nothing ever enforced
 * it: the date lived only on this page, while `/whatdoyouthink` went on taking
 * answers. Rather than let the page say "Closed" over a survey that was still
 * running, the claim is withdrawn. A date is a promise to a respondent, so it
 * comes back only when something actually closes the survey on it.
 *
 * WHY A LIVE COUNT IS ALLOWED HERE, WHEN PUBLISHED FIGURES ARE NOT
 * A respondent count is not an answer. Published results while the survey is
 * open bias later respondents, worst of all on willingness to pay; knowing
 * that forty people have taken part anchors nobody's opinion of anything. So
 * the figures stay a reviewed commit and only the count is live.
 *
 * This does read the research table, which the results page otherwise never
 * does. It reads `count(*)` and no row, so no answer and nothing about any
 * individual leaves the database. The alternative, a daily job committing the
 * number, would have to fight branch protection to push to `main`.
 *
 * The page revalidates hourly, so this runs at most once an hour rather than
 * once a visitor.
 */

/** Respondents we are aiming for. A published commitment, not a guess. */
export const TARGET = 150


/**
 * Below this, the count is hidden and only the closing date is shown.
 *
 * Social proof runs both ways: "3 of 150" tells a visitor that nobody is doing
 * this, which is the opposite of what the bar is for. Ten is the point where a
 * number reads as a study under way rather than as an empty room.
 */
export const SHOW_COUNT_FROM = 10

export interface Progress {
  /** Null when the count could not be read. The page still renders. */
  count: number | null
}

export async function getProgress(): Promise<Progress> {
  let count: number | null = null

  try {
    // head: true asks PostgREST for the count without returning a single row.
    const { count: rows, error } = await getSupabase()
      .from(TABLES.responses)
      .select('*', { count: 'exact', head: true })
    if (!error && typeof rows === 'number') count = rows
  } catch {
    // A page that cannot say how many people took part is still worth showing.
    // Never let a counter take down the page it sits on.
  }

  return { count }
}
