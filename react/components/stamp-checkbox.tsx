'use client'
/**
 * Hatke UI · Rubber-stamp checkbox
 * Every check is stamped by hand: the box sinks while pressed, the check slams in at a
 * slightly different angle each time, ink spatters and the label does a little cheer.
 * Uncheck it and the check falls off. A real checkbox underneath, so forms and screen readers work.
 * React 19 + Tailwind 4. Colours come from --hk-* variables, each with a fallback.
 */
import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from 'react'

type StampCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  onCheckedChange?: (checked: boolean) => void
}

const CHECK = 'M4.5 12.5l5 5L19.5 6.5'

export function StampCheckbox({ label, onCheckedChange, onChange, className = '', ...input }: StampCheckboxProps) {
  const box = useRef<HTMLSpanElement>(null)
  const mark = useRef<SVGSVGElement>(null)
  const fx = useRef<HTMLSpanElement>(null) // ink and falling checks go here, outside React's children
  const letters = useRef<HTMLSpanElement>(null)
  const [angle, setAngle] = useState(0)

  function handle(e: ChangeEvent<HTMLInputElement>) {
    onChange?.(e); onCheckedChange?.(e.target.checked)
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (e.target.checked) {
      const r = Math.random() * 18 - 9
      setAngle(r)
      if (calm) return
      mark.current?.animate([
        { transform: `scale(2.1) rotate(${r * 3}deg)`, opacity: 0 },
        { transform: `scale(.86) rotate(${r}deg)`, opacity: 1, offset: 0.5 },
        { transform: `scale(1) rotate(${r}deg)`, opacity: 1 },
      ], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' })
      box.current?.animate([{ transform: 'scale(1)' }, { transform: 'scale(.9)', offset: 0.45 }, { transform: 'scale(1)' }], { duration: 320 })
      for (let i = 0; i < 8; i++) spatter()
      letters.current?.querySelectorAll('span').forEach((c, i) => c.animate(
        [{ transform: 'none' }, { transform: `translateY(-6px) rotate(${i % 2 ? 6 : -6}deg)` }, { transform: 'none' }],
        { duration: 360, delay: 120 + i * 24, easing: 'cubic-bezier(.3,.7,.4,1.4)' }))
    } else if (!calm) fallOff()
  }

  function spatter() {
    const dot = document.createElement('span')
    dot.style.cssText = 'position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px;border-radius:50%;background:var(--hk-accent,#2f54eb)'
    fx.current?.appendChild(dot)
    const a = Math.random() * Math.PI * 2, dist = 16 + Math.random() * 14, size = 0.5 + Math.random() * 0.9
    dot.animate([
      { transform: `translate(0,0) scale(${size})`, opacity: 0.9 },
      { transform: `translate(${Math.cos(a) * dist}px,${Math.sin(a) * dist}px) scale(${size * 0.4})`, opacity: 0 },
    ], { duration: 420 + Math.random() * 200, delay: 110, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'both' }).onfinish = () => dot.remove()
  }

  function fallOff() {
    if (!mark.current || !fx.current) return
    const ghost = mark.current.cloneNode(true) as SVGSVGElement
    ghost.style.opacity = '1'
    fx.current.appendChild(ghost)
    const dir = Math.random() < 0.5 ? -1 : 1
    ghost.animate([
      { transform: `translate(0,0) rotate(${angle}deg)`, opacity: 1 },
      { transform: `translate(${dir * 10}px,-8px) rotate(${angle + dir * 20}deg)`, opacity: 1, offset: 0.25 },
      { transform: `translate(${dir * 22}px,46px) rotate(${angle + dir * 110}deg)`, opacity: 0 },
    ], { duration: 560, easing: 'cubic-bezier(.4,0,.9,.5)' }).onfinish = () => ghost.remove()
  }

  return (
    <label className={`group relative flex min-h-[46px] cursor-pointer select-none items-center gap-3.5 [-webkit-tap-highlight-color:transparent] ${className}`}>
      <input {...input} type="checkbox" onChange={handle} className="peer absolute m-0 size-px opacity-0" />
      <span ref={box} className="relative grid size-[26px] flex-none place-items-center rounded-lg border-[1.5px] border-[var(--hk-line,#c9ced6)] bg-[var(--hk-paper,#fff)] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-active:scale-[.78] group-active:shadow-[inset_0_0_0_4px_color-mix(in_srgb,var(--hk-accent,#2f54eb)_25%,transparent)] group-active:duration-[120ms] peer-checked:border-[var(--hk-accent,#2f54eb)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-[var(--hk-accent,#2f54eb)] [&_svg]:absolute [&_svg]:size-[22px] [&_svg]:fill-none [&_svg]:stroke-[var(--hk-accent,#2f54eb)] [&_svg]:stroke-3 [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]">
        <svg ref={mark} viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${angle}deg)` }} className="opacity-0 group-has-checked:opacity-100"><path d={CHECK} /></svg>
        <span ref={fx} aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center" />
      </span>
      <span className="group-has-checked:text-[var(--hk-sub,#5a606c)]">
        <span className="sr-only">{label}</span>
        <span ref={letters} aria-hidden="true">{label.split('').map((c, i) => <span key={i} className="inline-block whitespace-pre">{c}</span>)}</span>
      </span>
    </label>
  )
}
