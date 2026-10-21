/**
 * The uppercase kicker that sits above a heading.
 *
 * It is doing real work, not decoration: it gives every section a visible
 * starting edge, which is a large part of why the reference design reads as
 * structured rather than as a wall of text.
 */
export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-eyebrow text-accent">
      {children}
    </p>
  )
}
