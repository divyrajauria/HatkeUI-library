import { SquishStepper } from '../components/squish-stepper'

export const meta = {
  order: 10, name: 'Squish stepper', file: 'squish-stepper.tsx',
  idea: 'The buttons push the number. Each press squeezes the number from that side, and the digits roll. Hold a button and it speeds up until the digits blur. At the limit the number squashes flat against the wall.',
  tryIt: ['tap', 'hold +', 'hit 20'],
}

export default function Demo() {
  return <SquishStepper label="Guests" min={1} max={20} defaultValue={4} decreaseLabel="Remove a guest" increaseLabel="Add a guest" />
}
