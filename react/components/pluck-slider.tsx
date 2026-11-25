'use client'
/**
 * Hatke UI · Pluck slider
 * The track is a guitar string. Drag the thumb and the string bends under it; pull up or down
 * while dragging, let go, and it twangs and settles. A real range input sits on top, invisible,
 * so the value, the keyboard and screen readers all work as normal.
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

type PluckSliderProps = {
  label: string
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
}

export function PluckSlider({ label, min = 0, max = 100, step = 1, value, defaultValue = min, onValueChange, className = '' }: PluckSliderProps) {
  const id = useId()
  const [inner, setInner] = useState(defaultValue)
  const v = value ?? inner
  const area = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  const on = useRef<SVGPathElement>(null)
  const off = useRef<SVGPathElement>(null)
  const out = useRef<HTMLOutputElement>(null)
  const Y = useRef(new Spring(0, 900, 5)).current // low damping: the string rings
  const dragging = useRef(false)
  const current = useRef(v)
  current.current = v

  function paint() {
    if (!area.current || !on.current || !off.current || !thumb.current || !out.current) return
    const W = area.current.clientWidth, mid = area.current.clientHeight / 2
    const tx = 12 + ((current.current - min) / (max - min)) * (W - 24), ty = mid + Y.x, bend = (mid + Y.x * 0.9).toFixed(1)
    on.current.setAttribute('d', `M0,${mid} Q${(tx * 0.5).toFixed(1)},${bend} ${tx.toFixed(1)},${ty.toFixed(1)}`)
    off.current.setAttribute('d', `M${tx.toFixed(1)},${ty.toFixed(1)} Q${((tx + W) * 0.5).toFixed(1)},${bend} ${W},${mid}`)
    thumb.current.style.transform = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px)`
    out.current.style.transform = `translateY(${(Y.x * -0.25).toFixed(2)}px) rotate(${(Y.x * 0.4).toFixed(2)}deg)`
  }
  const kick = useFrameLoop(dt => { const done = Y.step(dt); paint(); return done && !dragging.current }, () => { Y.t = 0; Y.snap(); paint() })
  const pluck = (force: number) => { Y.k = 900; Y.d = 5; Y.v += force; Y.t = 0; kick() }

  useLayoutEffect(() => { paint(); addEventListener('resize', paint); return () => removeEventListener('resize', paint) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(paint, [v]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const release = () => {
      if (!dragging.current) return
      dragging.current = false; area.current?.removeAttribute('data-grab')
      pluck(Math.abs(Y.x) < 3 ? 260 : 0) // a flat release still gets a twang
    }
    addEventListener('pointerup', release); addEventListener('pointercancel', release)
    return () => { removeEventListener('pointerup', release); removeEventListener('pointercancel', release) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`w-[300px] max-w-full ${className}`}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm text-[var(--hk-sub,#5a606c)]">{label}</label>
        <output ref={out} htmlFor={id} className="inline-block font-[family-name:var(--font-display,inherit)] text-[34px] font-bold tabular-nums tracking-[-.03em]">{v}</output>
      </div>
      <div
        ref={area}
        onPointerMove={e => {
          if (!dragging.current || !area.current) return
          const r = area.current.getBoundingClientRect()
          Y.t = Math.max(-22, Math.min(22, (e.clientY - r.top - r.height / 2) * 0.7)); kick()
        }}
        className="group relative h-[72px]"
      >
        <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible fill-none stroke-[3] [stroke-linecap:round]">
          <path ref={off} className="stroke-[var(--hk-muted,#dde1e7)]" />
          <path ref={on} className="stroke-[var(--hk-accent,#2f54eb)]" />
        </svg>
        <span ref={thumb} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 -m-3 size-6 rounded-full bg-[var(--hk-knob,#fff)] shadow-[0_0_0_1px_rgba(0,0,0,.08),0_3px_8px_rgba(0,0,0,.22)] transition-[scale] duration-[250ms] ease-[cubic-bezier(.34,1.56,.64,1)] group-data-grab:scale-[1.3] group-has-[input:focus-visible]:shadow-[0_0_0_3px_var(--hk-paper,#fff),0_0_0_5px_var(--hk-accent,#2f54eb)]" />
        <input
          id={id} type="range" min={min} max={max} step={step} value={v}
          onPointerDown={() => { dragging.current = true; area.current?.setAttribute('data-grab', ''); Y.k = 1400; Y.d = 40; kick() }}
          onChange={e => {
            const n = Number(e.target.value)
            current.current = n
            if (value === undefined) setInner(n)
            onValueChange?.(n)
            if (!dragging.current) pluck(120); else kick() // keyboard changes get a small pluck
          }}
          className="absolute inset-0 m-0 size-full cursor-grab touch-none opacity-0 active:cursor-grabbing"
        />
      </div>
    </div>
  )
}

/* ---- motion helpers (kept in this file so it works on its own) ---- */

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
