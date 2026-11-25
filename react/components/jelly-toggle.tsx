'use client'
/**
 * Hatke UI · Jelly toggle
 * The knob is jelly on a spring: it squashes when pressed, stretches with its speed and
 * wobbles into place. Tap it like any switch, or grab the knob and throw it.
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { useEffect, useId, useRef, useState } from 'react'

type JellyToggleProps = {
  label: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

const TRAVEL = 30 // px the knob moves between off and on

export function JellyToggle({ label, checked, defaultChecked = false, onCheckedChange, className = '' }: JellyToggleProps) {
  const id = useId()
  const [inner, setInner] = useState(defaultChecked)
  const on = checked ?? inner
  const knob = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const pos = useRef(new Spring(on ? TRAVEL : 0, 420, 20)).current
  const press = useRef(new Spring(0, 600, 30)).current
  const drag = useRef<{ x0: number; start: number; moved: boolean; lastX: number; lastT: number; vel: number } | null>(null)

  function paint() {
    if (!knob.current || !fill.current) return
    const stretch = Math.min(Math.abs(pos.v) / 700, 0.6)
    const over = pos.x < 0 ? -pos.x : pos.x > TRAVEL ? pos.x - TRAVEL : 0 // squash against the ends
    const sx = 1 + stretch + press.x * 0.22 - over * 0.02
    const sy = 1 - stretch * 0.35 - press.x * 0.1 + over * 0.02
    knob.current.style.transform = `translateX(${pos.x.toFixed(2)}px) scale(${sx.toFixed(3)},${sy.toFixed(3)})`
    const f = clamp(pos.x / TRAVEL, 0, 1)
    fill.current.style.opacity = f.toFixed(3)
    fill.current.style.clipPath = `inset(0 ${(68 - (pos.x + 34 + 4 * f)).toFixed(1)}px 0 0 round 999px)`
  }
  const kick = useFrameLoop(dt => { const a = pos.step(dt), b = press.step(dt); paint(); return a && b && !drag.current }, () => { pos.snap(); press.snap(); paint() })

  useEffect(() => { pos.t = on ? TRAVEL : 0; kick() }, [on]) // eslint-disable-line react-hooks/exhaustive-deps

  function set(next: boolean, velocity = 0) {
    if (velocity) pos.v = clamp(velocity, -2500, 2500)
    pos.t = next ? TRAVEL : 0
    if (checked === undefined) setInner(next)
    onCheckedChange?.(next)
    kick()
  }

  return (
    <div className={`flex items-center justify-between gap-6 ${className}`}>
      <span id={id}>{label}</span>
      <button
        type="button" role="switch" aria-checked={on} aria-labelledby={id}
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId)
          drag.current = { x0: e.clientX, start: pos.x, moved: false, lastX: e.clientX, lastT: performance.now(), vel: 0 }
          press.t = 1; kick()
        }}
        onPointerMove={e => {
          const d = drag.current; if (!d) return
          const dx = e.clientX - d.x0
          if (Math.abs(dx) > 3) d.moved = true
          if (!d.moved) return
          const now = performance.now()
          d.vel = (e.clientX - d.lastX) / Math.max(1, now - d.lastT) * 1000; d.lastX = e.clientX; d.lastT = now
          let t = d.start + dx
          if (t < 0) t *= 0.3
          if (t > TRAVEL) t = TRAVEL + (t - TRAVEL) * 0.3 // rubber-band past the ends
          pos.t = t; kick()
        }}
        onPointerUp={() => {
          const d = drag.current; if (!d) return
          drag.current = null; press.t = 0
          if (!d.moved) set(!on)
          else set(pos.x + d.vel * 0.1 > TRAVEL / 2, d.vel) // land on the side it was thrown toward
        }}
        onPointerCancel={() => { drag.current = null; press.t = 0; set(on) }}
        onClick={e => { if (e.detail === 0) { press.v = 18; set(!on) } }} // keyboard: Space or Enter
        className="relative h-[38px] w-[68px] flex-none cursor-grab touch-none rounded-full border-0 bg-[var(--hk-muted,#dde1e7)] p-0 [-webkit-tap-highlight-color:transparent] before:absolute before:-inset-1 before:content-[''] active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--hk-accent,#2f54eb)]"
      >
        <span ref={fill} className="absolute inset-0 rounded-[inherit] bg-[var(--hk-accent,#2f54eb)] opacity-0" />
        <span ref={knob} className="absolute left-1 top-1 size-[30px] rounded-full bg-[var(--hk-knob,#fff)] shadow-[0_1px_2px_rgba(0,0,0,.2),0_4px_10px_rgba(0,0,0,.12)] will-change-transform" />
      </button>
    </div>
  )
}

/* ---- motion helpers (kept in this file so it works on its own) ---- */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/** A damped spring, stepped in small slices so it stays stable at any frame rate. */
class Spring {
  v = 0
  t: number
  constructor(public x: number, public k = 170, public d = 18) { this.t = x }
  step(dt: number) {
    const n = Math.ceil(dt / 0.004), h = dt / n
    for (let i = 0; i < n; i++) { const f = -this.k * (this.x - this.t) - this.d * this.v; this.v += f * h; this.x += this.v * h }
    return Math.abs(this.v) < 0.02 && Math.abs(this.x - this.t) < 0.02
  }
  snap() { this.x = this.t; this.v = 0 }
}

/** Runs frame(dt) every animation frame until it returns true. With reduced motion, calls snap() instead. */
function useFrameLoop(frame: (dt: number) => boolean, snap: () => void) {
  const raf = useRef(0)
  const latest = useRef({ frame, snap })
  latest.current = { frame, snap }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  return useRef(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { latest.current.snap(); return }
    if (raf.current) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000); last = now
      if (latest.current.frame(dt)) { raf.current = 0; return }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }).current
}
