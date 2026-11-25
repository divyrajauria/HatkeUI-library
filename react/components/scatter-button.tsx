'use client'
/**
 * Hatke UI · Scatter button
 * The words do the waiting. While the action runs, the label breaks into dots that orbit.
 * Success flips it to a done label. A failure brings the letters back scrambled, then they
 * shake into the right order. Pass an async action: resolve means done, reject means failed.
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { useRef, useState } from 'react'

type ScatterButtonProps = {
  label: string
  action: () => Promise<unknown>
  doneLabel?: string
  errorMessage?: string
  className?: string
}
type State = 'idle' | 'loading' | 'done' | 'error'

export function ScatterButton({ label, action, doneLabel = 'Saved', errorMessage = 'Couldn’t save. Try again.', className = '' }: ScatterButtonProps) {
  const [state, setState] = useState<State>('idle')
  const [status, setStatus] = useState('')
  const orbit = useRef<HTMLSpanElement>(null)
  const chars = useRef<HTMLSpanElement[]>([])
  const spin = useRef<Animation | null>(null)
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const homes = () => chars.current.map(c => c.offsetLeft + c.offsetWidth / 2)
  const place = (c: HTMLSpanElement, transform: string, delay: number) => { c.style.transitionDelay = `${delay}ms`; c.style.transform = transform }

  async function run() {
    if (state !== 'idle') return
    setState('loading'); setStatus('')
    if (!calm() && orbit.current) {
      const h = homes(), cx = orbit.current.offsetWidth / 2
      const dots = chars.current.filter(c => c.textContent !== ' ')
      dots.forEach((c, i) => { // gather the letters into a ring
        const a = (i / dots.length) * Math.PI * 2 - Math.PI / 2, idx = chars.current.indexOf(c)
        place(c, `translate(${(cx + Math.cos(a) * 13 - h[idx]).toFixed(1)}px,${(Math.sin(a) * 13).toFixed(1)}px) scale(.34)`, i * 22)
      })
      setTimeout(() => {
        if (orbit.current && !spin.current) spin.current = orbit.current.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 1100, iterations: Infinity })
      }, 520)
    }
    let result: State = 'done'
    try { await action() } catch { result = 'error' }
    finish(result)
  }

  function finish(result: State) {
    if (spin.current && orbit.current) { // ease the ring back upright from wherever it is
      const a = ((Number(spin.current.currentTime) || 0) % 1100) / 1100 * 360
      spin.current.cancel(); spin.current = null
      orbit.current.animate([{ transform: `rotate(${a}deg)` }, { transform: `rotate(${a > 180 ? 360 : 0}deg)` }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' })
    }
    setState(result); setStatus(result === 'done' ? doneLabel : errorMessage)
    if (result === 'done') {
      chars.current.forEach((c, i) => place(c, '', i * 14))
      setTimeout(() => setState('idle'), 1500)
      return
    }
    const h = homes(), order = chars.current.map((_, i) => i).sort(() => Math.random() - 0.5)
    chars.current.forEach((c, i) => place(c, calm() ? '' : `translate(${(h[order[i]] - h[i]).toFixed(1)}px,${i % 2 ? 3 : -3}px)`, i * 14))
    setTimeout(() => {
      chars.current.forEach((c, i) => place(c, '', i * 18))
      if (!calm()) orbit.current?.parentElement?.animate(
        [{ transform: 'none' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(1px)' }, { transform: 'none' }],
        { duration: 440, delay: 120 })
    }, 650)
    setTimeout(() => setState('idle'), 1600)
  }

  return (
    <div className={`grid justify-items-center gap-2.5 ${className}`}>
      <button
        type="button" data-state={state} aria-busy={state === 'loading'} onClick={run}
        className="group relative h-[50px] cursor-pointer rounded-full border-0 bg-[var(--hk-ink,#121418)] px-7 font-semibold text-[var(--hk-paper,#fff)] transition-[background-color,transform] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] [-webkit-tap-highlight-color:transparent] active:scale-95 data-[state=done]:bg-[var(--hk-accent,#2f54eb)] data-[state=done]:text-[var(--hk-on-accent,#fff)] data-[state=error]:bg-[var(--hk-danger,#d92d20)] data-[state=error]:text-[var(--hk-on-accent,#fff)] data-[state=loading]:cursor-default focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--hk-accent,#2f54eb)]"
      >
        <span className="sr-only">{label}</span>
        <span ref={orbit} aria-hidden="true" className="relative inline-flex h-full items-center transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(.34,1.56,.64,1)] group-data-[state=done]:-translate-y-3/5 group-data-[state=done]:[transform:rotateX(80deg)] group-data-[state=done]:opacity-0 motion-reduce:group-data-[state=loading]:opacity-50">
          {label.split('').map((c, i) => (
            <span
              key={i} ref={el => { if (el) chars.current[i] = el }}
              className={`relative inline-block whitespace-pre transition-[transform,color] duration-[550ms] ease-[cubic-bezier(.34,1.56,.64,1)] motion-reduce:transition-none group-data-[state=loading]:text-transparent motion-reduce:group-data-[state=loading]:text-inherit ${c === ' ' ? '' : "after:absolute after:left-1/2 after:top-1/2 after:-m-[6.5px] after:size-[13px] after:rounded-full after:bg-[var(--hk-paper,#fff)] after:opacity-0 after:transition-opacity after:content-[''] group-data-[state=loading]:after:opacity-100 motion-reduce:group-data-[state=loading]:after:opacity-0"}`}
            >{c}</span>
          ))}
        </span>
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(.34,1.56,.64,1)] [transform:translateY(60%)_rotateX(-80deg)] group-data-[state=done]:opacity-100 group-data-[state=done]:[transform:none]">
          <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current stroke-[2.8] [stroke-linecap:round] [stroke-linejoin:round]"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          {doneLabel}
        </span>
      </button>
      <p role="status" className={`min-h-[1.4em] text-sm ${state === 'error' || status === errorMessage ? 'text-[var(--hk-danger,#d92d20)]' : 'text-[var(--hk-sub,#5a606c)]'}`}>{status}</p>
    </div>
  )
}
