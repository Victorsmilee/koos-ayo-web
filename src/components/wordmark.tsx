/**
 * KOOS-AYO wordmark.
 *
 * The two O's of KOOS overlap — *koos*, together, and the lens is the space they
 * share. The O of AYO carries a halo of short rays — *ayo*, joy. One lockup
 * holding both halves of the name.
 *
 * Two things keep it legible, and both were found by rendering it rather than by
 * looking at the geometry:
 *
 *   1. The AYO O has NO filled centre. A solid counter stops it being a letter —
 *      the first version read as a gear and the word stopped saying AYO.
 *   2. Its radius and stroke match the two O's of KOOS, so the eye reads one
 *      glyph repeated, not a symbol pasted into a word.
 *
 * Responsive: the rays are hidden below `sm`, where they would close up against
 * the Y and turn the end of the word to mush. Same DOM either way — no file
 * swap, no flash.
 *
 * Live <text> is fine here because Inter is self-hosted by next/font. The
 * standalone files in docs/brand/logo/ are a different case: convert those to
 * outlines before sending them anywhere.
 */
export default function Wordmark({
  short = false,
  className = '',
}: {
  /** KOOS alone — the product name (Brief v2, D6). Full wordmark is the company. */
  short?: boolean
  className?: string
}) {
  const label = short ? 'KOOS' : 'KOOS-AYO'
  return (
    <svg
      viewBox={short ? '0 0 146 64' : '0 0 284 64'}
      role="img"
      aria-label={label}
      className={className}
      style={{ height: '1.6em', width: 'auto' }}
    >
      <defs>
        <clipPath id="koos-lens">
          <circle cx="62" cy="33" r="16" />
        </clipPath>
      </defs>

      <text
        x="6"
        y="49"
        fontFamily="var(--font-inter), system-ui, sans-serif"
        fontSize="46"
        fontWeight="700"
        letterSpacing="-1"
        fill="currentColor"
      >
        K
      </text>

      {/* koos — two people, and the space they share */}
      <g fill="none" stroke="currentColor" strokeWidth="5.5">
        <circle cx="62" cy="33" r="16" />
        <circle cx="89" cy="33" r="16" />
      </g>
      <g clipPath="url(#koos-lens)">
        <circle cx="89" cy="33" r="16" fill="var(--koos-rose)" />
      </g>

      <text
        x="110"
        y="49"
        fontFamily="var(--font-inter), system-ui, sans-serif"
        fontSize="46"
        fontWeight="700"
        letterSpacing="-1"
        fill="currentColor"
      >
        S
      </text>

      {!short && (
        <>
          <text
            x="146"
            y="49"
            fontFamily="var(--font-inter), system-ui, sans-serif"
            fontSize="46"
            fontWeight="700"
            letterSpacing="-1"
            fill="var(--koos-rose)"
          >
            -AY
          </text>

          {/* ayo — the O, with joy around it */}
          <g stroke="var(--koos-rose)">
            <circle cx="248" cy="33" r="16" fill="none" strokeWidth="5.5" />
            <g className="hidden sm:inline" strokeWidth="3.4" strokeLinecap="round">
              <path d="M248 7.5v4M248 54.5v4M272.5 33h4" />
              <path d="M264.5 16.5l2.8-2.8M264.5 49.5l2.8 2.8" />
            </g>
          </g>
        </>
      )}
    </svg>
  )
}
