import { z } from 'zod'
import { allQuestions, sections } from './questions'

/**
 * Validation shared by the client and the Server Actions.
 *
 * The server re-validates everything the client already checked. Client-side
 * limits are a courtesy to the respondent; these are the real constraint.
 */

/** Max selections per question, derived from the instrument itself. */
export const MAX_SELECTIONS: Record<string, number> = Object.fromEntries(
  allQuestions
    .filter((q) => typeof q.maxSelections === 'number')
    .map((q) => [q.id, q.maxSelections as number]),
)

/** Valid option strings per question, so free text can't be smuggled in. */
const OPTIONS: Record<string, Set<string>> = Object.fromEntries(
  allQuestions.filter((q) => q.options).map((q) => [q.id, new Set(q.options!)]),
)

const TEXT_MAX = 5000
const OTHER_MAX = 300

/** One answer: a single choice, a list of choices, or free text. */
const answerValue = z.union([
  z.string().max(TEXT_MAX),
  z.array(z.string().max(OTHER_MAX)).max(20),
])

export const answersSchema = z
  .record(z.string().regex(/^q\d{1,2}(_other)?$/), answerValue)
  .superRefine((answers, ctx) => {
    for (const [key, value] of Object.entries(answers)) {
      // "q9_other" holds the free text revealed by an "Other" choice.
      const isOther = key.endsWith('_other')
      const questionId = isOther ? key.replace('_other', '') : key

      if (isOther) {
        if (typeof value !== 'string') {
          ctx.addIssue({ code: 'custom', message: `${key} must be text` })
        }
        continue
      }

      const limit = MAX_SELECTIONS[questionId]
      if (limit && Array.isArray(value) && value.length > limit) {
        ctx.addIssue({
          code: 'custom',
          message: `${questionId} allows at most ${limit} selections`,
        })
      }

      const valid = OPTIONS[questionId]
      if (valid) {
        const chosen = Array.isArray(value) ? value : [value]
        for (const choice of chosen) {
          if (!valid.has(choice)) {
            ctx.addIssue({
              code: 'custom',
              message: `${questionId} received an option that is not on the instrument`,
            })
          }
        }
      }
    }
  })

export const sectionPayloadSchema = z.object({
  sectionIndex: z.number().int().min(0).max(sections.length),
  answers: answersSchema,
  /** Hidden field. Only a bot fills this in. */
  honeypot: z.string().max(200).optional(),
  /** Client clock at mount, used as a cheap "filled in too fast" check. */
  startedAt: z.number().int().optional(),
})

export const emailSchema = z.string().trim().email().max(320)

export const followUpSchema = z.enum(['yes', 'maybe'])

export type Answers = z.infer<typeof answersSchema>
