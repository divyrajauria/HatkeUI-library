import { SpringDrawers } from '../components/spring-drawers'

export const meta = {
  order: 9, name: 'Spring drawers', file: 'spring-drawers.tsx',
  idea: 'Drawers on springs. Each one opens with a little overshoot, so the drawers below bump and settle. With a mouse you can grab a header and pull the drawer open, and it snaps the rest of the way.',
  tryIt: ['click', 'drag a header down', 'open two'],
}

export default function Demo() {
  return (
    <SpringDrawers items={[
      { title: 'Can I change the colours?', content: <><p>Yes. Every component reads a few CSS variables, such as --hk-accent.</p><p>Set them once and every component follows.</p></> },
      { title: 'What happens with reduced motion?', content: <p>Everything still opens, closes and changes. The springs, wobble and bounce are switched off.</p> },
      { title: 'Do I need anything besides React?', content: <p>Tailwind 4 for the classes. Nothing else: no animation library, no package to install.</p> },
    ]} />
  )
}
