'use client'

import { useEffect, useState } from 'react'

/**
 * Cycles system -> light -> dark -> system.
 *
 * The *initial* theme is not set here. It is set by a blocking inline script in
 * layout.tsx, before first paint, because a React effect runs after paint and
 * would produce a visible flash of the wrong theme on every load.
 */

export const THEME_KEY = 'koos-theme'
type Mode = 'system' | 'light' | 'dark'
const ORDER: Mode[] = ['system', 'light', 'dark']

function applyMode(mode: Mode) {
  const dark =
    mode === 'dark' ||
    (mode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system')

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Mode | null
    if (stored && ORDER.includes(stored)) setMode(stored)
  }, [])

  // While following the system, track changes to it live.
  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyMode('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]
    setMode(next)
    try {
      if (next === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, next)
    } catch {
      // Private browsing can throw on write. The toggle still works for
      // this page view; it just will not be remembered.
    }
    applyMode(next)
  }

  const labels: Record<Mode, string> = {
    system: 'Theme: following your system. Click for light.',
    light: 'Theme: light. Click for dark.',
    dark: 'Theme: dark. Click to follow your system.',
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={labels[mode]}
      title={labels[mode]}
      className="grid h-9 w-9 place-items-center rounded-koos border border-line bg-raised text-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      {mode === 'system' && <MonitorIcon />}
      {mode === 'light' && <SunIcon />}
      {mode === 'dark' && <MoonIcon />}
    </button>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" {...stroke}>
      <rect x="2.5" y="3.5" width="15" height="10" rx="1.5" />
      <path d="M7 16.5h6M10 13.5v3" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" {...stroke}>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M16 4l-1.4 1.4M5.4 14.6L4 16" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" {...stroke}>
      <path d="M16.5 11.8A7 7 0 1 1 8.2 3.5a5.5 5.5 0 0 0 8.3 8.3z" />
    </svg>
  )
}
