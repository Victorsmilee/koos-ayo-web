/**
 * Charts for the published results. Inline SVG, server rendered, no library.
 *
 * WHY NO CHART LIBRARY
 * This page is static and holds no interactivity. A charting library would make
 * it a client component, ship a few hundred kilobytes of JavaScript, and add a
 * third-party dependency to the one page whose entire argument is that it is a
 * reviewed commit with nothing in it. Two SVG shapes are cheaper and cannot
 * break.
 *
 * WHY THESE FORMS AND NOT OTHERS
 * A pie or donut is only honest for part-to-whole with few slices, so there is
 * exactly one: completion, which is two slices of a real whole.
 *
 * There is deliberately no pie per question. Half the questions are "select up
 * to three", where the answers do not sum to the number of people and a pie
 * would draw slices adding past 100%. The rest have five to nine options, which
 * is past the point where slices can be told apart or labelled. Those stay as
 * bars, which read at any category count and can show a suppressed value as
 * withheld rather than as a missing slice.
 *
 * COLOUR
 * One hue, the accent. These are single-series charts, so no categorical
 * palette is needed, which is just as well: the eight section colours were
 * tested as a chart palette and failed on chroma, colourblind separation and
 * normal-vision separation. They are section accents, not series colours.
 */

/** Where the ring is drawn. Values are SVG user units, not pixels. */
const DONUT = { size: 120, stroke: 14 }

export function CompletionDonut({
  completed,
  started,
}: {
  completed: number
  started: number
}) {
  const share = started === 0 ? 0 : completed / started
  const radius = (DONUT.size - DONUT.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const centre = DONUT.size / 2

  return (
    <figure className="m-0 flex items-center gap-5">
      <svg
        viewBox={`0 0 ${DONUT.size} ${DONUT.size}`}
        className="h-[120px] w-[120px] shrink-0"
        role="img"
        aria-label={`${completed} of ${started} people finished the whole study`}
      >
        {/* The track is the whole, drawn first. A donut without a visible
            whole is a fraction with no denominator. */}
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          stroke="var(--koos-line)"
          strokeWidth={DONUT.stroke}
        />
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          stroke="var(--koos-accent)"
          strokeWidth={DONUT.stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * share} ${circumference}`}
          // Start at twelve o'clock rather than three, which is where people
          // expect a proportion to begin.
          transform={`rotate(-90 ${centre} ${centre})`}
        />
      </svg>
      <figcaption className="min-w-0">
        <p className="text-3xl font-bold leading-none text-ink">
          {Math.round(share * 100)}%
        </p>
        <p className="mt-2 text-sm text-muted">
          finished the whole study
          <br />
          {completed} of {started} who started
        </p>
      </figcaption>
    </figure>
  )
}

/**
 * Where people stopped, section by section.
 *
 * Ordered and cumulative, so a bar is the right form and a pie is not: these
 * are stages of one journey, not parts of a whole. The step down between two
 * bars is the finding, which is why each one carries the number lost.
 */
export function DropOffChart({
  sections,
  started,
}: {
  sections: { section: number; title: string; reached: number }[]
  started: number
}) {
  if (started === 0 || sections.length === 0) return null

  return (
    <figure className="m-0">
      <ul className="space-y-2.5">
        {sections.map((step, i) => {
          const previous = i === 0 ? started : sections[i - 1].reached
          const lost = previous - step.reached
          const width = started === 0 ? 0 : (100 * step.reached) / started
          return (
            <li key={step.section}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <span className="text-sm text-ink">
                  {step.section}. {step.title}
                </span>
                <span className="text-sm text-muted">
                  {step.reached}
                  {lost > 0 ? ` · ${lost} stopped here` : ''}
                </span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-raised ring-1 ring-inset ring-line">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
      <figcaption className="mt-3 text-sm text-muted">
        Everyone who reached each section, including people who stopped later.
        Answers given before someone stopped are kept and counted, which is why
        a section further in can still have a useful number behind it.
      </figcaption>
    </figure>
  )
}

/**
 * How the study is going: respondents so far against the target, and how long
 * is left.
 *
 * It sits in the "still running" panel, where the alternative is an empty page,
 * so it is doing real work: it says the study is alive, that it ends, and that
 * taking part moves something. The bar is the chart; a donut would imply a part
 * of a whole that is already fixed, and this whole is a target we may miss.
 */
export function SurveyProgress({
  count,
  target,
  daysLeft,
  closed,
  showCount,
  closesOn,
}: {
  count: number | null
  target: number
  daysLeft: number
  closed: boolean
  showCount: boolean
  closesOn: string
}) {
  const percent = count === null ? 0 : Math.min(100, (100 * count) / target)
  const remaining = closed
    ? 'Closed'
    : daysLeft === 0
      ? 'Closes today'
      : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`

  return (
    <figure className="m-0 rounded-koos border border-line bg-raised p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          {showCount ? (
            <p className="flex items-baseline gap-2">
              <span className="text-4xl font-bold leading-none text-ink">
                {count}
              </span>
              <span className="text-base text-muted">
                respondents of {target} so far
              </span>
            </p>
          ) : (
            <p className="text-base font-semibold text-ink">
              Aiming for {target} respondents
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
          {remaining}
        </span>
      </div>

      {showCount ? (
        <div className="mt-4">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-surface ring-1 ring-inset ring-line"
            role="img"
            aria-label={`${count} of ${target} respondents so far`}
          >
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted">
            <span>{Math.round(percent)}% of the target</span>
            <span>{target}</span>
          </div>
        </div>
      ) : null}

      <figcaption className="mt-4 text-sm text-muted">
        Open until {closesOn}.{' '}
        {showCount
          ? 'Anyone who has answered at least one question is counted.'
          : 'The running count appears once a few more people have taken part.'}
      </figcaption>
    </figure>
  )
}
