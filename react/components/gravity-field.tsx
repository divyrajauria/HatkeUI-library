'use client'
/**
 * Hatke UI · Gravity field
 * Letters have weight. Each character drops into the field and lands with a bounce; delete one
 * and it falls out of the bottom; a character the field can't take bounces off and flies away.
 * The real input handles typing, the caret and screen readers; a copy of the letters drawn on top
 * does the animating. Keep maxLength short enough that the text never scrolls (see the note below).
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { useId, useRef, useState, type InputHTMLAttributes } from 'react'

type GravityFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type'> & {
  label: string
  /** One character class: which characters are allowed, e.g. "[A-Za-z0-9.]" */
  allow?: string
  hint?: string
  error?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export function GravityField({ label, allow = '.', hint = '', error = 'That character isn’t allowed.', defaultValue = '', maxLength = 18, onValueChange, className = '', ...input }: GravityFieldProps) {
  const id = useId()
  const [count, setCount] = useState(defaultValue.length)
  const [bad, setBad] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const mirror = useRef<HTMLSpanElement>(null)
  const prev = useRef(defaultValue)
  const badTimer = useRef(0)
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const ok = new RegExp(`^${allow}*$`)

  // Note: the drawn letters line up with the real text while it fits in the field.
  // If the text grew long enough to scroll, they would drift, so keep maxLength modest.
  const xOf = (i: number) => {
    const m = mirror.current!, s = m.children[i] as HTMLElement | undefined
    return s ? m.offsetLeft + s.offsetLeft : m.offsetLeft + m.offsetWidth
  }
  function ghost(ch: string, x: number, frames: Keyframe[], duration: number, color?: string) {
    if (calm() || !box.current || !mirror.current) return
    const g = document.createElement('span')
    g.textContent = ch
    g.style.cssText = `position:absolute;left:${x}px;top:${mirror.current.offsetTop}px;font-size:16px;line-height:24px;white-space:pre;pointer-events:none;${color ? `color:${color}` : ''}`
    box.current.appendChild(g)
    g.animate(frames, { duration, easing: 'cubic-bezier(.4,0,.9,.5)', fill: 'forwards' }).onfinish = () => g.remove()
  }
  function draw(text: string, from: number, n: number) {
    const m = mirror.current; if (!m) return
    m.textContent = ''
    text.split('').forEach((c, i) => {
      const s = document.createElement('span'); s.textContent = c; s.style.display = 'inline-block'; m.appendChild(s)
      if (i >= from && i < from + n && !calm()) s.animate([
        { transform: `translateY(-18px) rotate(${Math.random() * 30 - 15}deg) scale(1.3)`, opacity: 0 },
        { transform: 'translateY(2px) scale(.92,1.08)', opacity: 1, offset: 0.6 },
        { transform: 'none', opacity: 1 },
      ], { duration: 380, delay: (i - from) * 30, easing: 'cubic-bezier(.3,.8,.4,1.2)', fill: 'backwards' })
    })
  }

  return (
    <div className={`w-[300px] max-w-full ${className}`}>
      <div ref={box} className="relative">
        <input
          {...input} id={id} type="text" placeholder=" " maxLength={maxLength} defaultValue={defaultValue} aria-describedby={`${id}-msg`}
          ref={el => { if (el && mirror.current && !mirror.current.textContent && el.value) draw(el.value, 0, 0) }}
          onChange={e => {
            const el = e.target, before = prev.current, next = el.value
            let a = 0, b = 0
            while (a < before.length && a < next.length && before[a] === next[a]) a++
            while (b < before.length - a && b < next.length - a && before[before.length - 1 - b] === next[next.length - 1 - b]) b++
            const removed = before.slice(a, before.length - b), added = next.slice(a, next.length - b)
            if (!ok.test(next)) { // refuse it: the bad character bounces off and flies away
              const caret = (el.selectionStart ?? next.length) - added.length
              el.value = before; el.setSelectionRange(caret, caret)
              const x = xOf(a)
              added.replace(new RegExp(allow, 'g'), '').split('').slice(0, 3).forEach((c, i) => ghost(c, x + i * 6, [
                { transform: 'translateY(-16px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: 0.3 },
                { transform: `translate(${40 + i * 12}px,-46px) rotate(220deg)`, opacity: 0 },
              ], 620, 'var(--hk-danger,#d92d20)'))
              setBad(true)
              if (!calm()) box.current?.animate([{ transform: 'none' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 380 })
              clearTimeout(badTimer.current); badTimer.current = window.setTimeout(() => setBad(false), 2200)
              return
            }
            removed.split('').forEach((c, i) => { // deleted letters fall out of the bottom
              const dir = Math.random() < 0.5 ? -1 : 1
              ghost(c, xOf(a + i), [
                { transform: 'none', opacity: 1 }, { transform: `translate(${dir * 6}px,-6px) rotate(${dir * 10}deg)`, opacity: 1, offset: 0.2 },
                { transform: `translate(${dir * 14}px,42px) rotate(${dir * 80}deg)`, opacity: 0 },
              ], 520 + i * 40)
            })
            prev.current = next; draw(next, a, added.length); setCount(next.length); onValueChange?.(next)
          }}
          className={`peer block h-[58px] w-full rounded-xl border-[1.5px] bg-[var(--hk-paper,#fff)] px-3.5 pb-1.5 pt-[22px] text-base leading-6 tracking-[.01em] text-transparent caret-[var(--hk-ink,#121418)] outline-0 transition-[border-color,box-shadow] selection:bg-[color-mix(in_srgb,var(--hk-accent,#2f54eb)_30%,transparent)] ${bad
            ? 'border-[var(--hk-danger,#d92d20)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--hk-danger,#d92d20)_18%,transparent)]'
            : 'border-[var(--hk-line,#c9ced6)] focus:border-[var(--hk-accent,#2f54eb)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--hk-accent,#2f54eb)_20%,transparent)]'}`}
        />
        <span ref={mirror} aria-hidden="true" className="pointer-events-none absolute left-[15.5px] top-[23.5px] whitespace-pre text-base leading-6 tracking-[.01em] text-[var(--hk-ink,#121418)]" />
        <label htmlFor={id} className={`pointer-events-none absolute left-[15.5px] top-[18px] origin-top-left text-base leading-5 transition-[transform,color] duration-[250ms] ease-[cubic-bezier(.34,1.56,.64,1)] peer-focus:-translate-y-[11px] peer-focus:scale-[.74] peer-[:not(:placeholder-shown)]:-translate-y-[11px] peer-[:not(:placeholder-shown)]:scale-[.74] ${bad ? 'text-[var(--hk-danger,#d92d20)]' : 'text-[var(--hk-sub,#5a606c)] peer-focus:text-[var(--hk-accent,#2f54eb)]'}`}>{label}</label>
      </div>
      <div className="mt-1.5 flex justify-between gap-3 text-[13px] text-[var(--hk-sub,#5a606c)]">
        <span id={`${id}-msg`} aria-live="polite" className={bad ? 'text-[var(--hk-danger,#d92d20)]' : ''}>{bad ? error : hint}</span>
        <span aria-hidden="true" className="tabular-nums">{count}/{maxLength}</span>
      </div>
    </div>
  )
}
