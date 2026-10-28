import { z } from 'zod'
import raw from '@/data/results.json'

/**
 * The published survey results, validated at build time.
 *
 * `src/data/results.json` is written by `scripts/analyse_responses.py` in the
 * PRIVATE repository and committed here after a human has read it. That is the
 * whole design: this site never holds a credential and never queries the
 * research tables, so publishing is a reviewed commit rather than a runtime
 * behaviour, and there is nothing here to leak.
 *
 * The schema below is not a formality. It encodes the promises the privacy
 * notice makes to respondents, so a file that breaks one of them fails the
 * build instead of reaching the web:
 *
 *   - no free text, ever. Not verbatim, not summarised. It is the one place a
 *     respondent may have identified themselves or their partner.
 *   - no Q6. Religious belief is Article 9 special-category data and is not
 *     publishable even in aggregate.
 *   - no cell below `minCell`. Two or three small cells together re-identify
 *     people in a small sample, which is why a suppressed cell is `null` and
 *     not a number.
 *   - every figure carries its own base. A percentage without an n is
 *     marketing, not evidence.
 */

/** The faith question, matched on its text. Never publishable. */
const SPECIAL_CATEGORY_TEXT =
  'How important is faith or religion in how you approach your relationship?'

const questionSchema = z.object({
  number: z.number().int().positive(),
  text: z.string().min(1),
  /** How many people answered THIS question, not how many started the survey. */
  base: z.number().int().nonnegative(),
  /**
   * Option text to count, or null where the count was suppressed.
   *
   * null and 0 are different claims and must stay different. Zero is a
   * finding: nobody chose this. Null is "we are not telling you, the cell is
   * too small to publish safely". Collapsing them would publish a false
   * finding, which is worse than publishing nothing.
   */
  counts: z.record(z.number().int().nonnegative().nullable()),
})

const resultsSchema = z
  .object({
    status: z.enum(['open', 'closed']),
    surveyVersion: z.string().min(1),
    generatedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    collectionWindow: z
      .object({
        first: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        last: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .partial(),
    responsesStarted: z.number().int().nonnegative(),
    responsesCompleted: z.number().int().nonnegative(),
    minCell: z.number().int().positive(),
    dropOff: z.array(
      z.object({
        section: z.number().int().positive(),
        title: z.string().min(1),
        reached: z.number().int().nonnegative(),
      }),
    ),
    questions: z.array(questionSchema),
  })
  .superRefine((value, ctx) => {
    const fail = (message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message })

    if (value.responsesCompleted > value.responsesStarted) {
      fail('responsesCompleted cannot exceed responsesStarted')
    }

    // Reach is cumulative, so it can only fall. A rise would mean somebody
    // reached a later section without reaching an earlier one, which says the
    // counting is wrong rather than that the data is surprising.
    value.dropOff.forEach((step, i) => {
      const previous = i === 0 ? value.responsesStarted : value.dropOff[i - 1].reached
      if (step.reached > previous) {
        fail(
          `dropOff section ${step.section} reports ${step.reached} reached, ` +
            `more than the ${previous} before it`,
        )
      }
    })

    for (const q of value.questions) {
      if (q.text === SPECIAL_CATEGORY_TEXT) {
        fail(
          `Q${q.number} is Article 9 special-category data and must never be ` +
            `published. The generator excludes it; this file was hand-edited.`,
        )
      }
      // A published count below the threshold is the re-identification risk
      // the threshold exists to remove. Catch it here rather than trusting
      // that whoever generated the file passed the right --min-cell.
      for (const [option, n] of Object.entries(q.counts)) {
        if (n !== null && n > 0 && n < value.minCell) {
          fail(
            `Q${q.number} publishes ${n} for "${option}", below minCell ` +
              `${value.minCell}. Suppressed cells must be null.`,
          )
        }
        if (n !== null && n > q.base) {
          fail(`Q${q.number} publishes ${n} for "${option}" over a base of ${q.base}`)
        }
      }
    }
  })

export type Results = z.infer<typeof resultsSchema>
export type ResultsQuestion = z.infer<typeof questionSchema>

/**
 * Parsed once at module load, which is build time for a static page. An
 * invalid file fails `npm run build` rather than rendering something wrong.
 */
export const results: Results = resultsSchema.parse(raw)

/**
 * Figures are shown only once collection has closed.
 *
 * Live results bias the sample: later respondents anchor on what earlier ones
 * said, and the willingness-to-pay answers are the most susceptible, which are
 * also the hardest signal to get. While the study is open the page says so
 * instead.
 */
export const showFigures = results.status === 'closed' && results.responsesStarted > 0

/** A percentage of the question's own base, or null when there is no base. */
export function share(n: number | null, base: number): number | null {
  if (n === null || base === 0) return null
  return Math.round((1000 * n) / base) / 10
}
