import { JellyToggle } from '../components/jelly-toggle'

export const meta = {
  order: 1, name: 'Jelly toggle', file: 'jelly-toggle.tsx',
  idea: 'The knob is jelly on a spring. It squashes when pressed, stretches with its speed, overshoots and wobbles into place. You can grab it and throw it.',
  tryIt: ['tap', 'drag the knob', 'flick it', 'Space'],
}

export default function Demo() {
  return (
    <div className="grid w-[260px] max-w-full gap-4">
      <JellyToggle label="Airplane mode" />
      <JellyToggle label="Wi-Fi" defaultChecked />
    </div>
  )
}
