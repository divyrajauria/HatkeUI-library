import { useRef } from 'react'
import { ToastPile, useToastPile } from '../components/toast-pile'

export const meta = {
  order: 6, name: 'Toast pile', file: 'toast-pile.tsx',
  idea: 'Notes tossed onto a pile, each on a lit fuse. Toasts land crooked and bounce. A spark burns along each fuse, and the note flies off when it reaches the end. Hover or focus to fan the pile out and pause every fuse. Throw a note away.',
  tryIt: ['drop five', 'hover the pile', 'throw one'],
}

const messages = ['Invite sent to sam@studio.co', 'Link copied', 'Changes saved', '3 files uploaded', 'Maya joined the project']

export default function Demo() {
  const { toasts, toast, dismiss } = useToastPile()
  const n = useRef(0)
  return (
    <div className="grid min-h-[300px] w-full justify-items-center self-start">
      <button type="button" onClick={() => toast(messages[n.current++ % messages.length])}
        className="min-h-11 cursor-pointer rounded-full border border-[var(--hk-line)] bg-[var(--hk-paper)] px-[18px] font-medium transition-transform hover:border-[var(--hk-ink)] active:scale-95">Drop a toast</button>
      {toasts.length === 0 && <p className="absolute bottom-11 text-[13px] text-[var(--hk-sub)]">No notifications</p>}
      {/* in an app, leave className off and the pile sits fixed at the bottom of the screen */}
      <ToastPile toasts={toasts} onDismiss={dismiss} className="absolute bottom-[22px] left-1/2 w-[min(320px,calc(100%-32px))] -translate-x-1/2" />
    </div>
  )
}
