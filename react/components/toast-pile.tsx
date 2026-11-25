'use client'
/**
 * Hatke UI · Toast pile
 * Notes tossed onto a pile, each on a lit fuse. Toasts land crooked and bounce, a spark burns
 * along each fuse, and the note flies off when it reaches the end. Hover or focus the pile to
 * fan it out and pause every fuse (WCAG 2.2.1). Drag a note sideways to throw it away.
 *
 *   const { toasts, toast, dismiss } = useToastPile()
 *   toast('Link copied')
 *   <ToastPile toasts={toasts} onDismiss={dismiss} />
 *
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export type Toast = { id: number; text: string; rot: number; dx: number }

export function useToastPile() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const next = useRef(1)
  const toast = useCallback((text: string) => {
    setToasts(t => [...t, { id: next.current++, text, rot: Math.random() * 8 - 4, dx: Math.random() * 16 - 8 }])
  }, [])
  const dismiss = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), [])
  return { toasts, toast, dismiss }
}

type ToastPileProps = { toasts: Toast[]; onDismiss: (id: number) => void; duration?: number; className?: string }

export function ToastPile({ toasts, onDismiss, duration = 5000, className = 'fixed bottom-6 left-1/2 w-[min(320px,calc(100vw-32px))] -translate-x-1/2' }: ToastPileProps) {
  const [leaving, setLeaving] = useState<number[]>([])
  const cards = useRef(new Map<number, HTMLLIElement>())
  const live = toasts.filter(t => !leaving.includes(t.id))

  const fling = useCallback((id: number, dir = 1) => {
    setLeaving(l => (l.includes(id) ? l : [...l, id]))
    const el = cards.current.get(id)
    if (el && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.animate([{ translate: el.style.translate || '0px 0px' }, { translate: `${dir * 420}px -80px` }], { duration: 420, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' })
      el.animate([{ rotate: el.style.rotate || '0deg' }, { rotate: `${dir * 40}deg` }], { duration: 420, fill: 'forwards' })
      setTimeout(() => onDismiss(id), 400)
    } else onDismiss(id)
  }, [onDismiss])

  useEffect(() => { if (live.length > 6) fling(live[0].id, -1) }, [live.length]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setLeaving(l => l.filter(id => toasts.some(t => t.id === id))) }, [toasts])

  return (
    <ol aria-live="polite" aria-label="Notifications" className={`group/pile m-0 list-none p-0 ${className}`}>
      <style href="hk-toast-pile" precedence="hk">{`
        @keyframes hk-pile-drop { from { transform: translate(var(--dx), -160px) rotate(calc(var(--rot) * -4)); opacity: 0 } }
        @keyframes hk-burn { to { transform: scaleX(0) } }
        @keyframes hk-spark { to { left: 0 } }
        @keyframes hk-flicker { 50% { transform: scale(.7) } }
        @media (prefers-reduced-motion: reduce) {
          .hk-toast { animation: none !important; transition: opacity .2s !important }
          .hk-spark { display: none } /* the fuse is a timer, not decoration, so it keeps its full length */
        }
      `}</style>
      {toasts.map(t => {
        const gone = leaving.includes(t.id)
        const i = gone ? 0 : live.length - 1 - live.indexOf(t)
        return (
          <li
            key={t.id}
            ref={el => { if (el) cards.current.set(t.id, el); else cards.current.delete(t.id) }}
            style={{ ['--i' as string]: i, ['--rot' as string]: `${t.rot.toFixed(1)}deg`, ['--dx' as string]: `${t.dx.toFixed(1)}px` }}
            onPointerDown={e => {
              if ((e.target as HTMLElement).closest('button')) return
              const el = e.currentTarget, x0 = e.clientX, y0 = e.clientY
              let lx = x0, lt = performance.now(), v = 0
              el.setPointerCapture(e.pointerId); el.style.transition = 'none'
              const move = (m: PointerEvent) => {
                const now = performance.now(); v = (m.clientX - lx) / Math.max(1, now - lt); lx = m.clientX; lt = now
                el.style.translate = `${m.clientX - x0}px ${(m.clientY - y0) * 0.4}px`; el.style.rotate = `${(m.clientX - x0) * 0.08}deg`
              }
              const up = () => {
                el.removeEventListener('pointermove', move); el.style.transition = ''
                const dx = lx - x0
                if (Math.abs(dx) > 90 || Math.abs(v) > 0.6) fling(t.id, dx > 0 ? 1 : -1)
                else { el.style.translate = ''; el.style.rotate = '' }
              }
              el.addEventListener('pointermove', move)
              el.addEventListener('pointerup', up, { once: true }); el.addEventListener('pointercancel', up, { once: true })
            }}
            className={`hk-toast absolute inset-x-0 bottom-0 flex min-h-[58px] cursor-grab touch-pan-y select-none items-center gap-2.5 rounded-[14px] border border-[var(--hk-line,#d5d9df)] bg-[var(--hk-paper,#fff)] py-1.5 pl-4 pr-1.5 text-sm text-[var(--hk-ink,#121418)] shadow-[0_8px_24px_rgba(15,20,30,.13)] after:absolute after:inset-x-0 after:top-full after:h-2.5 after:content-[''] [transform-origin:50%_100%] [transform:translate(var(--dx),calc(var(--i)*-7px))_rotate(var(--rot))_scale(calc(1-var(--i)*.035))] [transition:transform_.45s_cubic-bezier(.34,1.56,.64,1),opacity_.3s] [animation:hk-pile-drop_.55s_cubic-bezier(.34,1.56,.64,1)] group-hover/pile:[transform:translateY(calc(var(--i)*(-100%-8px)))] group-focus-within/pile:[transform:translateY(calc(var(--i)*(-100%-8px)))] ${gone || i > 3 ? 'pointer-events-none opacity-0' : ''}`}
          >
            <span className="min-w-0 flex-1">{t.text}</span>
            <button type="button" aria-label="Dismiss" onClick={() => fling(t.id)} className="size-11 flex-none cursor-pointer rounded-[10px] border-0 bg-transparent text-xl text-[var(--hk-sub,#5a606c)] hover:bg-[var(--hk-muted,#dde1e7)] hover:text-[var(--hk-ink,#121418)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--hk-accent,#2f54eb)]">×</button>
            <span aria-hidden="true" className="absolute inset-x-4 bottom-1.5 h-0.5">
              <span
                onAnimationEnd={() => fling(t.id)}
                style={{ animationDuration: `${duration}ms` }}
                className="absolute inset-0 origin-left rounded-sm bg-[color-mix(in_srgb,var(--hk-accent,#2f54eb)_50%,transparent)] [animation:hk-burn_5s_linear_forwards] group-hover/pile:[animation-play-state:paused] group-focus-within/pile:[animation-play-state:paused]"
              />
              <span
                style={{ animationDuration: `${duration}ms, 180ms` }}
                className="hk-spark absolute -top-[3px] left-full -ml-1 size-2 rounded-full bg-[var(--hk-accent,#2f54eb)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--hk-accent,#2f54eb)_25%,transparent),0_0_10px_var(--hk-accent,#2f54eb)] [animation:hk-spark_5s_linear_forwards,hk-flicker_.18s_steps(2)_infinite] group-hover/pile:[animation-play-state:paused] group-focus-within/pile:[animation-play-state:paused]"
              />
            </span>
          </li>
        )
      })}
    </ol>
  )
}
