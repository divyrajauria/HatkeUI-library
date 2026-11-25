import { StampCheckbox } from '../components/stamp-checkbox'

export const meta = {
  order: 2, name: 'Rubber-stamp checkbox', file: 'stamp-checkbox.tsx',
  idea: 'Every check is stamped by hand. The box sinks while you press, the check slams in at a new angle each time, ink spatters and the label cheers. Uncheck it and the check falls off.',
  tryIt: ['press and hold', 'release', 'uncheck'],
}

export default function Demo() {
  return (
    <fieldset className="m-0 grid min-w-[220px] border-0 p-0">
      <legend className="mb-1.5 p-0 text-[13px] text-[var(--hk-sub)]">Packing list</legend>
      <StampCheckbox label="Passport" />
      <StampCheckbox label="Phone charger" />
      <StampCheckbox label="Sunscreen" />
    </fieldset>
  )
}
