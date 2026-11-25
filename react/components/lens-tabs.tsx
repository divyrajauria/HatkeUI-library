'use client'
/**
 * Hatke UI · Lens tabs
 * A liquid lens slides under the labels. Its front edge leaps and its back edge catches up on
 * a spring, and the letters change colour exactly where the lens passes, even mid-word.
 * Hover a tab and the lens leans toward it. Full tabs pattern: arrow keys, Home and End.
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type Tab = { label: string; content: ReactNode }
type LensTabsProps = { tabs: Tab[]; label: string; defaultIndex?: number; onChange?: (index: number) => void; className?: string }

export function LensTabs({ tabs, label, defaultIndex = 0, onChange, className = '' }: LensTabsProps) {
  const uid = useId()
  const [cur, setCur] = useState(defaultIndex)
  const [dir, setDir] = useState(0)
  const list = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const ghost = useRef<HTMLDivElement>(null)
  const btns = useRef<HTMLButtonElement[]>([])
  const hover = useRef(-1)
  const L = useRef(new Spring(0, 260, 22)).current
  const R = useRef(new Spring(0, 260, 22)).current
  const squeeze = useRef(new Spring(1, 500, 22)).current

  const edges = (i: number) => { const b = btns.current[i]; return b ? [b.offsetLeft - 4, b.offsetLeft - 4 + b.offsetWidth] : [0, 0] }
  function paint() {
    if (!pill.current || !ghost.current) return
    const l = L.x, r = Math.max(R.x, l + 8), W = ghost.current.scrollWidth, s = squeeze.x, inset = ((1 - s) * 20).toFixed(1)
    pill.current.style.transform = `translateX(${(l + 4).toFixed(2)}px) scaleY(${s.toFixed(3)})`
    pill.current.style.width = `${(r - l).toFixed(2)}px`
    ghost.current.style.clipPath = `inset(${inset}px ${(W - r).toFixed(2)}px ${inset}px ${l.toFixed(2)}px round 999px)`
  }
  const kick = useFrameLoop(dt => { const a = L.step(dt), b = R.step(dt), c = squeeze.step(dt); paint(); return a && b && c }, () => { L.snap(); R.snap(); squeeze.snap(); paint() })

  function aim(travel: number) {
    const [l, r] = edges(cur), h = hover.current
    const lean = h >= 0 && h !== cur ? (h > cur ? 1 : -1) : 0
    L.t = l + (lean < 0 ? -10 : lean > 0 ? 4 : 0)
    R.t = r + (lean > 0 ? 10 : lean < 0 ? -4 : 0)
    if (travel) { // the edge you travel toward leaps, the other is dragged along
      const [lead, tail] = travel > 0 ? [R, L] : [L, R]
      lead.k = 520; lead.d = 26; tail.k = 150; tail.d = 16
    } else { L.k = R.k = 300; L.d = R.d = 24 }
    kick()
  }
  useEffect(() => aim(dir), [cur]) // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { // start exactly under the selected tab, and stay there on resize
    const reset = () => { const [l, r] = edges(cur); L.x = L.t = l; R.x = R.t = r; paint() }
    reset(); addEventListener('resize', reset); document.fonts?.ready.then(reset)
    return () => removeEventListener('resize', reset)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function select(i: number, focus = false) {
    if (i === cur) return
    setDir(i > cur ? 1 : -1); setCur(i); onChange?.(i)
    if (focus) btns.current[i]?.focus()
  }

  const tabClass = 'inline-flex min-h-10 flex-none items-center whitespace-nowrap rounded-full px-[15px] font-medium'
  return (
    <div className={`w-[360px] max-w-full ${className}`}>
      <style href="hk-lens-tabs" precedence="hk">{`
        @keyframes hk-lens-in { from { opacity: 0; transform: translateX(var(--dx)) skewX(calc(var(--dx) * -.4deg)) } }
        @media (prefers-reduced-motion: reduce) { .hk-lens-panel { animation: none !important } }
      `}</style>
      <div
        ref={list} role="tablist" aria-label={label}
        onKeyDown={e => {
          const n = tabs.length, k = e.key
          const i = k === 'ArrowRight' ? (cur + 1) % n : k === 'ArrowLeft' ? (cur - 1 + n) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1
          if (i < 0) return
          e.preventDefault(); select(i, true)
        }}
        className="relative flex gap-0.5 overflow-x-auto rounded-full border border-[var(--hk-line,#d5d9df)] bg-[var(--hk-paper,#fff)] p-1 [scrollbar-width:none]"
      >
        <span ref={pill} aria-hidden="true" className="pointer-events-none absolute bottom-1 left-0 top-1 w-2.5 rounded-full bg-[var(--hk-accent,#2f54eb)] will-change-transform" />
        {tabs.map((t, i) => (
          <button
            key={i} ref={el => { if (el) btns.current[i] = el }}
            type="button" role="tab" id={`${uid}-t${i}`} aria-controls={`${uid}-p${i}`} aria-selected={i === cur} tabIndex={i === cur ? 0 : -1}
            onClick={() => select(i)}
            onPointerEnter={e => { if (e.pointerType !== 'touch') { hover.current = i; aim(0) } }}
            onPointerLeave={() => { hover.current = -1; aim(0) }}
            onPointerDown={() => { squeeze.t = 0.86; kick(); addEventListener('pointerup', () => { squeeze.t = 1; kick() }, { once: true }) }}
            className={`${tabClass} relative cursor-pointer border-0 bg-transparent text-[var(--hk-sub,#5a606c)] transition-colors [-webkit-tap-highlight-color:transparent] hover:text-[var(--hk-ink,#121418)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--hk-accent,#2f54eb)]`}
          >{t.label}</button>
        ))}
        {/* the same labels in the accent's text colour, clipped to the lens */}
        <div ref={ghost} aria-hidden="true" className="pointer-events-none absolute inset-1 flex w-max gap-0.5 text-[var(--hk-on-accent,#fff)]">
          {tabs.map((t, i) => <span key={i} className={tabClass}>{t.label}</span>)}
        </div>
      </div>
      {tabs.map((t, i) => (
        <div
          key={i === cur ? `on-${i}` : i} role="tabpanel" id={`${uid}-p${i}`} aria-labelledby={`${uid}-t${i}`} tabIndex={0} hidden={i !== cur}
          style={{ ['--dx' as string]: `${dir * 14}px` }}
          className="hk-lens-panel px-1.5 pt-4 leading-[1.55] [animation:hk-lens-in_.4s_cubic-bezier(.2,.8,.2,1)] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--hk-accent,#2f54eb)]"
        >{t.content}</div>
      ))}
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
