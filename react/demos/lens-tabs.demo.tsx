import { LensTabs } from '../components/lens-tabs'

export const meta = {
  order: 4, name: 'Lens tabs', file: 'lens-tabs.tsx',
  idea: 'A liquid lens slides under the words. Its front edge leaps and its back edge catches up on a spring. Letters change colour exactly where the lens passes, even halfway through a word. Hover a tab and the lens leans toward it.',
  tryIt: ['hover', 'jump far', '← →'],
}

export default function Demo() {
  return (
    <LensTabs label="Inbox" tabs={[
      { label: 'All', content: 'Twelve conversations, three unread.' },
      { label: 'Mentions', content: 'Maya mentioned you in Checkout review.' },
      { label: 'Drafts', content: 'Two drafts, last edited yesterday.' },
      { label: 'Sent', content: 'Nothing sent this week.' },
    ]} />
  )
}
