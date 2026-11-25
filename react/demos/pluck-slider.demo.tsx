import { PluckSlider } from '../components/pluck-slider'

export const meta = {
  order: 7, name: 'Pluck slider', file: 'pluck-slider.tsx',
  idea: 'The track is a guitar string. Drag the thumb and the string bends under it. Pull up or down while you drag, let go, and it twangs and settles. The number shakes with it.',
  tryIt: ['drag', 'drag and pull down', 'let go', '← →'],
}

export default function Demo() {
  return <PluckSlider label="Volume" defaultValue={40} />
}
