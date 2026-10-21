'use client'

/**
 * A single selectable option.
 *
 * The real <input> stays in the DOM as `sr-only` — visually hidden but still
 * focusable and still in the accessibility tree. `display:none` would remove it
 * from both and silently break keyboard use.
 *
 * The visible circle (radio) or rounded square (checkbox) is drawn by us, so it
 * looks identical in every browser. Native inputs with `accent-color` render
 * differently per platform and never look designed.
 *
 * Focus is shown on the whole row via `has-[:focus-visible]`, so a keyboard user
 * sees the same target a mouse user clicks.
 */
export default function OptionRow({
  id,
  name,
  label,
  multiple,
  checked,
  disabled = false,
  onToggle,
}: {
  id: string
  name: string
  label: string
  multiple: boolean
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <label
      htmlFor={id}
      className={[
        'relative flex min-h-[52px] items-center gap-3 rounded-koos border p-3.5 text-base transition-colors',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2',
        'has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
        checked
          ? 'border-accent bg-accent-soft'
          : 'border-line bg-raised hover:border-line-strong',
        disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
      ].join(' ')}
    >
      <input
        id={id}
        name={name}
        type={multiple ? 'checkbox' : 'radio'}
        value={label}
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className={[
          'grid h-5 w-5 shrink-0 place-items-center border-2 transition-colors',
          multiple ? 'rounded-[6px]' : 'rounded-full',
          checked ? 'border-accent bg-accent' : 'border-control-line bg-transparent',
        ].join(' ')}
      >
        {checked &&
          (multiple ? (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
              <path
                d="M2.5 6.2l2.3 2.3 4.7-4.9"
                stroke="var(--koos-on-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span className="h-2 w-2 rounded-full bg-on-accent" />
          ))}
      </span>

      <span className="text-ink">{label}</span>
    </label>
  )
}
