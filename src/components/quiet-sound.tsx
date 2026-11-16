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
 * GENERATED, NOT A FILE. A soft chord of sine waves through a low-pass filter,
 * a few hundred bytes of code instead of a megabyte of audio, nothing to
 * download on a phone, and no third-party host to request it from. That last
 * point is the one that matters: this page carries no third-party connection
 * of any kind, and a hosted audio file would have been the first.
 *
 * WHY THE FIRST VERSION WAS SILENT, because all three are easy to repeat:
 *
 *   1. It played at 110Hz. Laptop and phone speakers roll off hard below about
 *      200Hz, so the note existed and nothing reproduced it. The chord now
 *      sits at 196 to 392Hz, which small speakers actually carry.
 *   2. The level was 0.045, roughly -27dBFS, under a 420Hz low-pass that was
 *      also cutting most of what little was there.
 *   3. It never called resume(). A context can be created suspended; Chrome
 *      usually resumes it on a gesture but Safari and iOS do not, and a
 *      suspended context produces silence with no error anywhere.
 *
 * It is still quiet on purpose. The target is "noticed only when it stops".
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

    // A context can be created suspended even inside a click handler. Without
    // this it produces silence and reports no error at all.
    if (c.state === 'suspended') void c.resume()

    const g = c.createGain()
    g.gain.setValueAtTime(0, c.currentTime)
    // Quiet, but above the floor of a phone speaker. The time constant is
    // short enough that the toggle feels connected to the sound: at 1.5s the
    // first version read as "nothing happened" even when it worked.
    g.gain.setTargetAtTime(0.1, c.currentTime, 0.35)

    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1200

    // G3, D4, G4: an open fifth and its octave, which is about as close to
    // "no emotional direction" as a chord gets. The 0.4Hz offset on one voice
    // beats slowly against its neighbour, and that slow movement is what stops
    // a held chord sounding like a test signal.
    for (const hz of [196, 294, 294.4, 392]) {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = hz
      const voice = c.createGain()
      // The upper voices sit back, so the chord reads as one soft sound
      // rather than three tones.
      voice.gain.value = hz > 300 ? 0.45 : 1
      osc.connect(voice)
      voice.connect(filter)
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
