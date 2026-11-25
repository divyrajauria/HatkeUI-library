'use client'
/**
 * Hatke UI · Balloon tooltip
 * The tooltip is a balloon on a string. It pops up from the button, bobs gently, swings as it
 * travels to the next button in the group, and leans toward the pointer.
 * Wrap buttons in <BalloonGroup> and use <BalloonTrigger> for each one. The first tooltip waits
 * 450ms; after that it travels with no wait. Escape closes it, and it can be hovered (WCAG 1.4.13).
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { createContext, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Api = { show: (el: HTMLElement, label: string, keys?: string, now?: boolean) => void; hide: () => void }
const BalloonContext = createContext<Api | null>(null)

export function BalloonGroup({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  const group = useRef<HTMLDivElement>(null)
  const balloon = useRef<HTMLDivElement>(null)
  const [text, setText] = useState({ label: '', keys: '' })
  const X = useRef(new Spring(0, 120, 11)).current
  const S = useRef(new Spring(0, 320, 14)).current
  const lean = useRef(new Spring(0, 60, 8)).current
  const st = useRef({ visible: false, warm: false, target: null as HTMLElement | null, showT: 0, hideT: 0, coolT: 0, born: performance.now() }).current

  function paint() {
    if (!balloon.current) return
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    const swing = clamp(-X.v * 0.032, -20, 20), bob = calm ? 0 : Math.sin((performance.now() - st.born) / 420) * 1.6
    const b = balloon.current.style
    b.left = `${X.x.toFixed(2)}px`
    b.opacity = clamp(S.x * 1.6, 0, 1).toFixed(3)
    b.transform = `translateX(-50%) translateY(${bob.toFixed(2)}px) rotate(${(swing + lean.x).toFixed(2)}deg) scale(${Math.max(0, S.x).toFixed(3)})`
  }
  // keeps running while visible, so the balloon bobs
  const kick = useFrameLoop(dt => { const a = X.step(dt), b = S.step(dt), c = lean.step(dt); paint(); return a && b && c && !st.visible }, () => { X.snap(); S.snap(); lean.snap(); paint() })
  const centre = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2

  const api = useRef<Api>({
    show(el, label, keys = '', now = false) {
      clearTimeout(st.hideT); clearTimeout(st.coolT); clearTimeout(st.showT)
      const point = () => { st.target = el; setText({ label, keys }); X.t = centre(el) }
      if (st.warm && st.visible) { point(); kick(); return }
      st.showT = window.setTimeout(() => {
        point(); if (!st.visible) X.x = X.t
        X.v = 0; st.visible = st.warm = true; S.t = 1; S.v = 4; kick()
      }, now || st.warm ? 0 : 450)
    },
    hide() {
      clearTimeout(st.showT)
      st.hideT = window.setTimeout(() => {
        st.visible = false; S.t = 0; kick()
        st.coolT = window.setTimeout(() => { st.warm = false }, 600)
      }, 180)
    },
  }).current

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || (!st.visible && !st.showT)) return
      clearTimeout(st.showT); st.showT = 0; st.visible = st.warm = false; S.t = 0; kick()
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(st.showT); clearTimeout(st.hideT); clearTimeout(st.coolT) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BalloonContext.Provider value={api}>
      <div
        ref={group} role="group" aria-label={label}
        onPointerMove={e => {
          if (!st.target || matchMedia('(prefers-reduced-motion: reduce)').matches || !group.current) return
          const r = group.current.getBoundingClientRect()
          lean.t = clamp((e.clientX - r.left - centre(st.target)) * 0.35, -12, 12); kick()
        }}
        onPointerLeave={() => { lean.t = 0; kick() }}
        className={`relative inline-flex gap-1 rounded-[14px] border border-[var(--hk-line,#d5d9df)] bg-[var(--hk-paper,#fff)] p-1 ${className}`}
      >
        {children}
        <div ref={balloon} aria-hidden="true" onPointerEnter={() => clearTimeout(st.hideT)} onPointerLeave={api.hide}
          className="pointer-events-none absolute bottom-full left-0 flex origin-bottom flex-col items-center opacity-0 will-change-transform">
          <div className="pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-xl bg-[var(--hk-ink,#121418)] px-3 py-[7px] text-[13px] leading-[1.3] text-[var(--hk-paper,#fff)]">
            <span>{text.label}</span>{text.keys && <kbd className="font-[inherit] text-xs opacity-60">{text.keys}</kbd>}
          </div>
          <div className="h-3.5 w-[1.5px] bg-[var(--hk-ink,#121418)] opacity-50" />
        </div>
      </div>
    </BalloonContext.Provider>
  )
}

type TriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & { label: string; keys?: string }

/** A button that shows the group's balloon. `label` is its accessible name; `keys` is shown beside it. */
export function BalloonTrigger({ label, keys, className = '', onPointerEnter, onPointerLeave, onFocus, onBlur, ...button }: TriggerProps) {
  const api = useContext(BalloonContext)
  return (
    <button
      type="button" aria-label={label} {...button}
      onPointerEnter={e => { onPointerEnter?.(e); if (e.pointerType !== 'touch') api?.show(e.currentTarget, label, keys) }}
      onPointerLeave={e => { onPointerLeave?.(e); api?.hide() }}
      onFocus={e => { onFocus?.(e); if (e.currentTarget.matches(':focus-visible')) api?.show(e.currentTarget, label, keys, true) }}
      onBlur={e => { onBlur?.(e); api?.hide() }}
      className={`size-11 cursor-pointer rounded-[10px] border-0 bg-transparent text-base transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:bg-[var(--hk-muted,#dde1e7)] active:scale-[.88] active:duration-[120ms] aria-pressed:bg-[var(--hk-muted,#dde1e7)] aria-pressed:text-[var(--hk-accent,#2f54eb)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hk-accent,#2f54eb)] ${className}`}
    />
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
