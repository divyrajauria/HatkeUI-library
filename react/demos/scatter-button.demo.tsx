import { useState } from 'react'
import { ScatterButton } from '../components/scatter-button'

export const meta = {
  order: 3, name: 'Scatter button', file: 'scatter-button.tsx',
  idea: 'The words do the waiting. While it saves, the label breaks into dots that orbit. Success flips it to “Saved”. A failure brings the letters back scrambled, then they shake into the right order.',
  tryIt: ['click', 'fail it', 'Enter'],
}

export default function Demo() {
  const [fail, setFail] = useState(false)
  const save = () => new Promise((resolve, reject) => setTimeout(fail ? reject : resolve, 1500)) // stands in for a real request
  return (
    <div className="grid justify-items-center gap-2">
      <ScatterButton label="Save changes" action={save} />
      <label className="flex min-h-8 cursor-pointer items-center gap-2 text-[13px] text-[var(--hk-sub)]">
        <input type="checkbox" checked={fail} onChange={e => setFail(e.target.checked)} className="size-4 accent-[var(--hk-accent)]" /> Make the next save fail
      </label>
    </div>
  )
}
