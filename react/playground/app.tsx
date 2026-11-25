import { useState, type ComponentType } from 'react'

/* Every file in demos/ registers itself here, so adding a component never edits this file. */
type Meta = { order: number; name: string; file: string; idea: string; tryIt: string[] }
type DemoModule = { meta: Meta; default: ComponentType }
const demos = Object.values(import.meta.glob<DemoModule>('../demos/*.demo.tsx', { eager: true }))
  .sort((a, b) => a.meta.order - b.meta.order)
const sources = import.meta.glob<string>('../components/*.tsx', { query: '?raw', import: 'default', eager: true })

export function App() {
  return (
    <div className="mx-auto grid max-w-[1120px] gap-11 px-[max(16px,env(safe-area-inset-left))] py-10 pb-20">
      <header className="grid gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[var(--hk-sub)]">Hatke UI · React and Tailwind</span>
        <h1 className="font-display text-[clamp(52px,10vw,120px)] font-bold leading-[.9] tracking-[-.05em]">Hatke UI</h1>
        <p className="max-w-[38ch] text-[clamp(18px,2.2vw,22px)] leading-[1.4]">Everyday controls, each rebuilt around a physical idea. Copy one file, paste it into your project, and it works.</p>
      </header>
      {demos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--hk-line)] p-10 text-center text-[var(--hk-sub)]">No components yet. Each one arrives in its own pull request.</p>
      ) : (
        <main className="grid gap-5 min-[901px]:grid-cols-2">
          {demos.map(({ meta, default: Demo }) => (
            <Card key={meta.file} meta={meta} source={sources[`../components/${meta.file}`] ?? ''}><Demo /></Card>
          ))}
        </main>
      )}
      <p className="border-t border-[var(--hk-line)] pt-5 font-mono text-[11px] tracking-[.06em] text-[var(--hk-sub)]">Hatke UI · React 19 · Tailwind 4</p>
    </div>
  )
}

function Card({ meta, source, children }: { meta: Meta; source: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState('')
  const [open, setOpen] = useState(false)
  const id = meta.file.replace('.tsx', '')
  async function copy() {
    try { await navigator.clipboard.writeText(source); setCopied('Copied') }
    catch { setOpen(true); setCopied('Select the code and copy it') }
    setTimeout(() => setCopied(''), 1800)
  }
  return (
    <article id={id} aria-labelledby={`${id}-h`} className="grid min-w-0 grid-rows-[auto_minmax(280px,auto)_auto] content-start overflow-hidden rounded-[18px] border border-[var(--hk-line)] bg-[var(--hk-paper)]">
      <div className="flex flex-wrap items-baseline gap-3 px-5 pb-3.5 pt-[18px]">
        <span className="font-mono text-xs text-[var(--hk-sub)]">{String(meta.order).padStart(2, '0')}</span>
        <h2 id={`${id}-h`} className="font-display text-[22px] font-bold tracking-[-.03em]">{meta.name}</h2>
        <code className="ml-auto font-mono text-[11px] text-[var(--hk-sub)]">{meta.file}</code>
      </div>
      <div className="relative grid min-w-0 place-items-center overflow-hidden border-y border-[var(--hk-line)] bg-[var(--hk-bg)] bg-[radial-gradient(color-mix(in_srgb,var(--hk-sub)_28%,transparent)_1px,transparent_1.2px)] bg-[length:16px_16px] px-3 py-7 sm:px-5">
        <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)] justify-items-center gap-4">{children}</div>
      </div>
      <div className="grid min-w-0 gap-3 px-5 pb-5 pt-[18px]">
        <p className="text-[15px] leading-[1.6]">{meta.idea}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[.1em] text-[var(--hk-sub)]">Try</span>
          {meta.tryIt.map(t => <span key={t} className="rounded-full border border-[var(--hk-line)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--hk-sub)]">{t}</span>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copy} className="min-h-11 cursor-pointer rounded-full bg-[var(--hk-ink)] px-4 font-medium text-[var(--hk-paper)] transition-transform active:scale-95">{copied || 'Copy code'}</button>
          <button type="button" aria-expanded={open} aria-controls={`${id}-code`} onClick={() => setOpen(!open)} className="min-h-11 cursor-pointer rounded-full border border-[var(--hk-line)] px-4 font-medium transition-transform hover:border-[var(--hk-ink)] active:scale-95">{open ? 'Hide code' : 'View code'}</button>
        </div>
        <pre id={`${id}-code`} hidden={!open} tabIndex={0} className="max-h-[340px] overflow-auto rounded-xl border border-[var(--hk-line)] bg-[var(--hk-bg)] p-4 font-mono text-xs leading-[1.55]">{source}</pre>
      </div>
    </article>
  )
}
