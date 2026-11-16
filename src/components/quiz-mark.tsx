/**
 * The mark at the top of the quiz.
 *
 * Two overlapping circles, with the lens where they meet picked out. That is
 * the wordmark's idea, not a new one: the two O's of the wordmark overlap, *koos*
 * means together, and the shape they share is the point. Using it here means
 * the landing page is recognisably the same brand as the logo above it without
 * repeating the logo.
 *
 * Deliberately not an illustration of a couple. The brand guide rules out
 * stock photography of couples as the category cliche, and a drawing of two
 * people has the same problem: it tells someone what their relationship is
 * supposed to look like before they have answered a single question.
 *
 * Tokens only, so it follows the theme. No fixed colours.
 */
export default function QuizMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 72"
      role="img"
      aria-label="Two overlapping circles, the KooS mark"
      className={className}
    >
      <defs>
        {/* The lens: the intersection of the two discs, drawn by clipping one
            with the other rather than by approximating the shape by hand. */}
        <clipPath id="koos-lens">
          <circle cx="46" cy="36" r="26" />
        </clipPath>
      </defs>

      <circle
        cx="46"
        cy="36"
        r="26"
        fill="var(--koos-accent-soft)"
        stroke="var(--koos-accent)"
        strokeWidth="2.5"
      />
      <circle
        cx="74"
        cy="36"
        r="26"
        fill="none"
        stroke="var(--koos-rose)"
        strokeWidth="2.5"
      />
      <g clipPath="url(#koos-lens)">
        <circle cx="74" cy="36" r="26" fill="var(--koos-accent)" opacity="0.22" />
      </g>
    </svg>
  )
}
