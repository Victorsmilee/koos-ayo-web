'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * An optional, very quiet background tone for the quiz.
 *
 * OFF BY DEFAULT, AND THAT IS NOT A HEDGE. Someone may open this on a train,
 * in an open office, or beside a sleeping child, and a product about difficult
 * conversations starting to make noise unannounced is a bad first impression.
 * Browsers also block audio that starts without a gesture, so an autoplaying
 * version would fail silently on most first loads and only work for the people
 * who least expected it.
 *
 * GENERATED, NOT A FILE. Two detuned sine waves through a low-pass filter, a
 * few hundred bytes of code instead of a megabyte of audio, nothing to
 * download on a phone, and no third-party host to request it from. That last
 * point is the one that matters: this page carries no third-party connection
 * of any kind, and a hosted audio file would have been the first.
 *
 * The choice is remembered per browser in localStorage, wrapped in try/catch
 * because reading it throws in some private browsing modes. On failure the
 * answer is simply "off", which is the safe direction.
 */

const KEY = 'koos-quiz-sound'

export default function QuietSound() {
  const [on, setOn] = useState(false)
  const ctx = useRef<AudioContext | null>(null)
  const gain = useRef<GainNode | null>(null)

  // Remembered preference. Never starts sound on load: even if the answer is
  // "on", audio needs a gesture, so it waits for the toggle.
  const [remembered, setRemembered] = useState(false)
  useEffect(() => {
    try {
      setRemembered(localStorage.getItem(KEY) === 'on')
    } catch {
      setRemembered(false)
    }
  }, [])

  const stop = useCallback(() => {
    const g = gain.current
    const c = ctx.current
    if (!g || !c) return
    // Ramp down rather than cut: an abrupt stop clicks.
    g.gain.cancelScheduledValues(c.currentTime)
    g.gain.setTargetAtTime(0, c.currentTime, 0.25)
    window.setTimeout(() => {
      void c.close()
      ctx.current = null
      gain.current = null
    }, 900)
  }, [])

  // Never leave an audio context running behind a closed tab or a route change.
  useEffect(() => stop, [stop])

  function start() {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return false

    const c = new Ctor()
    const g = c.createGain()
    g.gain.setValueAtTime(0, c.currentTime)
    // Deliberately far below speech level. It should be noticed only when it
    // stops.
    g.gain.setTargetAtTime(0.045, c.currentTime, 1.5)

    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 420

    // Two close frequencies beat slowly against each other, which is what
    // stops a held tone sounding like a test signal.
    for (const hz of [110, 110.3]) {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = hz
      osc.connect(filter)
      osc.start()
    }
    filter.connect(g)
    g.connect(c.destination)

    ctx.current = c
    gain.current = g
    return true
  }

  function toggle() {
    const next = !on
    setOn(next)
    try {
      localStorage.setItem(KEY, next ? 'on' : 'off')
    } catch {
      // A browser that will not remember it is not a reason to refuse to play.
    }
    if (next) {
      if (!start()) setOn(false)
    } else {
      stop()
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="inline-flex min-h-[52px] items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
    >
      <span
        aria-hidden="true"
        className={[
          'grid h-6 w-6 place-items-center rounded-full border transition-colors',
          on ? 'border-accent bg-accent text-on-accent' : 'border-control-line',
        ].join(' ')}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
          <path
            d="M3 6.2h2.2L8 3.6v8.8L5.2 9.8H3z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {on ? (
            <path
              d="M10.6 5.6a3.2 3.2 0 0 1 0 4.8"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M10.6 6.2l3 3.6M13.6 6.2l-3 3.6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          )}
        </svg>
      </span>
      {on ? 'Sound on' : remembered ? 'Sound off, tap to resume' : 'Sound off'}
    </button>
  )
}
