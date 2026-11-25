import { GravityField } from '../components/gravity-field'

export const meta = {
  order: 8, name: 'Gravity field', file: 'gravity-field.tsx',
  idea: 'Letters have weight. Each character drops into the field and lands with a bounce. Delete one and it falls out of the bottom. A character the field can’t take bounces off and flies away.',
  tryIt: ['type', 'backspace', 'type a !', 'paste'],
}

export default function Demo() {
  return <GravityField label="Username" allow="[A-Za-z0-9.]" hint="Letters, numbers and dots." error="Only letters, numbers and dots." autoComplete="off" spellCheck={false} />
}
