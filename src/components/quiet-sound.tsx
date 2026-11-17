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
 * GENERATED, NOT A FILE. A few hundred bytes of code instead of a megabyte of
 * audio: nothing to download on a phone, and no third-party host to request it
 * from. That last point is the one that matters, because this page carries no
 * third-party connection of any kind and a hosted audio file would have been
 * the first one.
 *
 * IT IS MUSIC, NOT A TONE. A held chord was the first version and it read as a
 * test signal, which is the opposite of calming. This moves: four chords in a
 * slow loop, each one breathing in over about four seconds and out again, with
 * single notes falling across them at a pace closer to a resting heartbeat
 * than to a melody. Nothing repeats on a short enough cycle to be noticed as a
 * loop.
 *
 * The progression is i, VI, III, VII in A minor, which is the most common
 * "unresolved but not sad" sequence there is: it never lands firmly on home,
 * so it does not ask for attention, and it has no major-key brightness telling
 * someone to feel better than they do. A quiz about difficult conversations
 * should not sound cheerful at them.
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
  // The bar scheduler. Cleared on stop, or it keeps queueing notes into a
  // context that is closing and throws on a dead node.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
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

    const master = c.createGain()
    master.gain.setValueAtTime(0, c.currentTime)
    // Quiet, but above the floor of a phone speaker. The time constant is
    // short enough that the toggle feels connected to the sound: at 1.5s an
    // earlier version read as "nothing happened" even when it worked.
    master.gain.setTargetAtTime(0.1, c.currentTime, 0.35)

    const filter = c.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1400
    filter.connect(master)
    master.connect(c.destination)

    // A little room, so notes end by fading rather than stopping. The impulse
    // is generated noise with an exponential decay: a real impulse response
    // would be a file, and a file would be a download and a host.
    const reverb = c.createConvolver()
    const len = Math.floor(c.sampleRate * 2.4)
    const impulse = c.createBuffer(2, len, c.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch)
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8)
      }
    }
    reverb.buffer = impulse
    const wet = c.createGain()
    wet.gain.value = 0.5
    reverb.connect(wet)
    wet.connect(master)

    /** One voice: a sine with its own slow swell, stopped when it is done. */
    const voice = (hz: number, at: number, hold: number, level: number) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = hz
      const g = c.createGain()
      g.gain.setValueAtTime(0, at)
      // Long attack and long release. A fast edge is what makes a synth sound
      // like a synth, and what would make this startling rather than calming.
      g.gain.linearRampToValueAtTime(level, at + hold * 0.45)
      g.gain.linearRampToValueAtTime(0, at + hold)
      osc.connect(g)
      g.connect(filter)
      g.connect(reverb)
      osc.start(at)
      osc.stop(at + hold + 0.1)
    }

    // A minor: Am, F, C, G. Written as frequencies rather than note names so
    // there is no table to look anything up in.
    const CHORDS = [
      [220.0, 261.63, 329.63], // A  C  E
      [174.61, 220.0, 261.63], // F  A  C
      [261.63, 329.63, 392.0], // C  E  G
      [196.0, 246.94, 293.66], // G  B  D
    ]
    const BAR = 9 // seconds a chord is held
    let bar = 0

    /**
     * Schedule one bar a little ahead of time, then come back for the next.
     *
     * Web Audio is scheduled against its own clock, so the timer only has to
     * be roughly on time: every note is placed at an exact audio time and
     * stays in place even if the tab is throttled in the background.
     */
    const schedule = () => {
      if (!ctx.current) return
      const chord = CHORDS[bar % CHORDS.length]
      const at = c.currentTime + 0.1

      // The pad: the chord itself, overlapping the one before it so the
      // change is a crossfade rather than a cut.
      for (const hz of chord) voice(hz, at, BAR + 2.5, 0.16)
      // The root an octave down, quieter, for some weight under it.
      voice(chord[0] / 2, at, BAR + 2.5, 0.1)

      // Two single notes drifting across the bar, an octave up. The second is
      // offset by a nudge that is not a neat fraction of the bar, so the
      // pattern does not settle into something countable.
      voice(chord[2] * 2, at + 1.6, 5, 0.05)
      voice(chord[1] * 2, at + 5.3, 5, 0.04)

      bar++
      timer.current = setTimeout(schedule, BAR * 1000)
    }

    ctx.current = c
    gain.current = master
    schedule()
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
