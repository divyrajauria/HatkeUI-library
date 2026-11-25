'use client'
/**
 * Hatke UI · Squish stepper
 * The buttons push the number. Each press squeezes the number from that side and only the
 * digits that change roll. Hold a button and it speeds up until the digits blur. At the limit
 * the number squashes flat against the wall and the limit is announced.
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { useEffect, useId, useRef, useState } from 'react'

type SquishStepperProps = {
  label: string
  min?: number
  max?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  decreaseLabel?: string
  increaseLabel?: string
  className?: string
}

export function SquishStepper({ label, min = 0, max = 99, value, defaultValue = min, onValueChange, decreaseLabel = `Decrease ${label}`, increaseLabel = `Increase ${label}`, className = '' }: SquishStepperProps) {
  const id = useId()
  const [inner, setInner] = useState(defaultValue)
  const n = value ?? inner
  const [roll, setRoll] = useState({ from: n, dir: 0, fast: false, key: 0 })
  const [wall, setWall] = useState(false)
  const [live, setLive] = useState('')
  const num = useRef<HTMLSpanElement>(null)
  const latest = useRef(n)
  latest.current = n
  const hold = useRef({ timer: 0, rate: 0 })
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => () => clearTimeout(hold.current.timer), [])

  function squeeze(d: number, hard: boolean) {
    if (calm() || !num.current) return
    num.current.style.transformOrigin = d > 0 ? 'left center' : 'right center' // pushed from the button's side
    const sx = hard ? 0.66 : 0.84
    num.current.animate([{ transform: 'none' }, { transform: `scale(${sx},${(2 - sx) * 0.98})`, offset: 0.3 }, { transform: 'scale(1.04,.97)', offset: 0.65 }, { transform: 'none' }], { duration: hard ? 420 : 300, easing: 'ease-out' })
  }
  function step(d: number, fast = false) {
    const cur = latest.current, next = cur + d
    if (next < min || next > max) {
      squeeze(d, true); setWall(true); setTimeout(() => setWall(false), 380)
      setLive(d > 0 ? `Maximum is ${max}` : `Minimum is ${min}`); stop(); return
    }
    latest.current = next
    if (value === undefined) setInner(next)
    onValueChange?.(next)
    setRoll(r => ({ from: cur, dir: d, fast, key: r.key + 1 }))
    squeeze(d, false); setLive(`${label}: ${next}`)
  }
  function stop() { clearTimeout(hold.current.timer); hold.current.timer = 0; setRoll(r => (r.fast ? { ...r, fast: false } : r)) } // un-blur when the hold ends
  function start(d: number) {
    step(d); hold.current.rate = 380
    const repeat = () => { hold.current.timer = window.setTimeout(() => { hold.current.rate = Math.max(45, hold.current.rate * 0.72); step(d, hold.current.rate < 120); if (hold.current.timer) repeat() }, hold.current.rate) }
    repeat()
  }

  // roll only the digits that changed
  const len = Math.max(String(roll.from).length, String(n).length)
  const a = String(roll.from).padStart(len), b = String(n).padStart(len)
  const btn = 'grid size-[46px] cursor-pointer touch-manipulation select-none place-items-center rounded-full border border-[var(--hk-line,#d5d9df)] bg-[var(--hk-paper,#fff)] p-0 text-[var(--hk-ink,#121418)] transition-[transform,border-color] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] [-webkit-tap-highlight-color:transparent] hover:border-[var(--hk-ink,#121418)] active:scale-90 active:duration-[120ms] aria-disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hk-accent,#2f54eb)]'
  const button = (d: number, aria: string, path: string) => (
    <button type="button" aria-label={aria} aria-disabled={d < 0 ? n <= min : n >= max} className={btn}
      onPointerDown={e => { if (e.button === 0) start(d) }} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      onClick={e => { if (e.detail === 0) step(d) }}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] fill-none stroke-current stroke-[2.2] [stroke-linecap:round]"><path d={path} /></svg>
    </button>
  )

  return (
    <div role="group" aria-labelledby={id} className={`flex w-[280px] max-w-full items-center justify-between gap-5 ${className}`}>
      <style href="hk-squish-stepper" precedence="hk">{`
        @keyframes hk-roll-in { from { transform: translateY(calc(var(--dir) * 100%)) } }
        @keyframes hk-roll-out { to { transform: translateY(calc(var(--dir) * -100%)) } }
        @media (prefers-reduced-motion: reduce) { .hk-roll-in { animation: none !important } .hk-roll-out { display: none } }
      `}</style>
      <span id={id}>{label}</span>
      <div className="flex items-center gap-2">
        {button(-1, decreaseLabel, 'M6 12h12')}
        <span ref={num} aria-hidden="true" className={`inline-flex min-w-16 justify-center rounded-[14px] border bg-[var(--hk-paper,#fff)] px-2.5 py-1.5 font-[family-name:var(--font-display,inherit)] text-[26px] font-bold leading-[1.25] tabular-nums ${wall ? 'border-[var(--hk-danger,#d92d20)] text-[var(--hk-danger,#d92d20)]' : 'border-[var(--hk-line,#d5d9df)]'}`}>
          {b.split('').map((ch, k) => {
            const changed = roll.dir !== 0 && a[k] !== ch
            return (
              <span key={`${k}-${changed ? roll.key : 's'}`} style={{ ['--dir' as string]: roll.dir }} className={`relative inline-block h-[1.25em] overflow-hidden ${roll.fast ? 'blur-[.6px]' : ''}`}>
                {changed && <span className="hk-roll-out absolute inset-0" style={{ animation: `hk-roll-out ${roll.fast ? '.12s' : '.32s'} cubic-bezier(.2,.8,.2,1) both` }}>{a[k].trim()}</span>}
                <span className={`block ${changed ? 'hk-roll-in' : ''}`} style={changed ? { animation: `hk-roll-in ${roll.fast ? '.12s' : '.32s'} cubic-bezier(.2,.8,.2,1) both` } : undefined}>{ch.trim()}</span>
              </span>
            )
          })}
        </span>
        {button(1, increaseLabel, 'M6 12h12M12 6v12')}
      </div>
      <span aria-live="polite" className="sr-only">{live}</span>
    </div>
  )
}
