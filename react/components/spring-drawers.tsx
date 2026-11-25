'use client'
/**
 * Hatke UI · Spring drawers
 * An accordion on springs. Each drawer opens with a little overshoot, so the drawers below bump
 * and settle. With a mouse or pen you can grab a header and pull the drawer open; it snaps the
 * rest of the way. On touch screens a tap opens it, so it never fights page scrolling.
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

type Item = { title: string; content: ReactNode; defaultOpen?: boolean }

export function SpringDrawers({ items, className = '' }: { items: Item[]; className?: string }) {
  return (
    <div className={`w-[380px] max-w-full border-t border-[var(--hk-line,#d5d9df)] ${className}`}>
      {items.map((item, i) => <Drawer key={i} {...item} />)}
    </div>
  )
}

function Drawer({ title, content, defaultOpen = false }: Item) {
  const id = useId()
  const [open, setOpen] = useState(defaultOpen)
  const panel = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const icon = useRef<HTMLSpanElement>(null)
  const H = useRef(new Spring(0, 240, 17)).current
  const drag = useRef<{ y: number; base: number; moved: boolean; ly: number; lt: number; v: number } | null>(null)
  const isOpen = useRef(open)
  isOpen.current = open
  const full = () => inner.current?.offsetHeight ?? 0

  function paint() {
    if (!panel.current || !inner.current || !icon.current) return
    const h = Math.max(0, H.x), p = Math.max(0, Math.min(1.15, h / Math.max(1, full())))
    panel.current.style.height = `${h.toFixed(1)}px`
    panel.current.style.visibility = h < 0.5 && !isOpen.current && !drag.current ? 'hidden' : 'visible'
    icon.current.style.transform = `rotate(${(p * 135).toFixed(1)}deg)`
    inner.current.style.transform = `translateY(${((1 - Math.min(p, 1)) * -10).toFixed(1)}px)`
  }
  const kick = useFrameLoop(dt => { const done = H.step(dt); paint(); return done && !drag.current }, () => { H.snap(); paint() })

  useEffect(() => { H.t = open ? full() : 0; kick() }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) { H.x = H.t = full() } paint() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function set(next: boolean, velocity = 0) {
    isOpen.current = next; if (velocity) H.v = velocity
    H.t = next ? full() : 0; setOpen(next); kick()
  }
  const soft = () => { H.k = 240; H.d = 17 }

  return (
    <div className="border-b border-[var(--hk-line,#d5d9df)]">
      <h3 className="m-0 text-[length:inherit] font-[inherit]">
        <button
          type="button" id={`${id}-b`} aria-expanded={open} aria-controls={`${id}-p`}
          onPointerDown={e => {
            if (e.pointerType === 'touch') return
            H.k = 1600; H.d = 80 // stiff while held, so the drawer follows the hand
            drag.current = { y: e.clientY, base: H.x, moved: false, ly: e.clientY, lt: performance.now(), v: 0 }
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={e => {
            const d = drag.current; if (!d) return
            const dy = e.clientY - d.y
            if (Math.abs(dy) > 5) d.moved = true
            if (!d.moved) return
            const now = performance.now(); d.v = (e.clientY - d.ly) / Math.max(1, now - d.lt) * 1000; d.ly = e.clientY; d.lt = now
            const F = full(); let t = d.base + dy
            if (t > F) t = F + (t - F) * 0.25 // resist past fully open
            H.t = Math.max(0, t); kick()
          }}
          onPointerUp={() => {
            const d = drag.current; if (!d) return
            drag.current = null; soft()
            if (!d.moved) set(!isOpen.current)
            else set(H.x + d.v * 0.15 > full() * 0.4, d.v)
          }}
          onPointerCancel={() => { drag.current = null; soft(); set(isOpen.current) }}
          onClick={e => { if (e.detail === 0 || (e.nativeEvent as PointerEvent).pointerType === 'touch') set(!isOpen.current) }}
          className="flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-0.5 text-left font-semibold [-webkit-tap-highlight-color:transparent] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hk-accent,#2f54eb)]"
        >
          {title}
          <span ref={icon} aria-hidden="true" className="relative size-4 flex-none before:absolute before:left-0 before:top-[7px] before:h-0.5 before:w-4 before:rounded-sm before:bg-current before:content-[''] after:absolute after:left-0 after:top-[7px] after:h-0.5 after:w-4 after:rotate-90 after:rounded-sm after:bg-current after:content-['']" />
        </button>
      </h3>
      <div ref={panel} id={`${id}-p`} role="region" aria-labelledby={`${id}-b`} className="h-0 overflow-hidden">
        <div ref={inner} className="pb-4 text-[var(--hk-sub,#5a606c)] [&>*+*]:mt-2">{content}</div>
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
