import { useState } from 'react'
import { BalloonGroup, BalloonTrigger } from '../components/balloon-tooltip'

export const meta = {
  order: 5, name: 'Balloon tooltip', file: 'balloon-tooltip.tsx',
  idea: 'The tooltip is a balloon on a string. It pops up from the button, bobs gently, swings when it travels to the next button, and leans toward your pointer.',
  tryIt: ['hover slowly', 'sweep across', 'Tab', 'Esc'],
}

const tools = [
  { label: 'Bold', keys: '⌘B', glyph: <b>B</b> },
  { label: 'Italic', keys: '⌘I', glyph: <i>I</i> },
  { label: 'Underline', keys: '⌘U', glyph: <u>U</u> },
  { label: 'Strikethrough', keys: '⇧⌘X', glyph: <s>S</s> },
]

export default function Demo() {
  const [on, setOn] = useState<Record<string, boolean>>({})
  return (
    <div className="mt-16">
      <BalloonGroup label="Formatting">
        {tools.map(t => (
          <BalloonTrigger key={t.label} label={t.label} keys={t.keys} aria-pressed={!!on[t.label]} onClick={() => setOn({ ...on, [t.label]: !on[t.label] })}>{t.glyph}</BalloonTrigger>
        ))}
      </BalloonGroup>
    </div>
  )
}
