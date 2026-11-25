# Hatke UI · React and Tailwind

The real components. Each one is a single `.tsx` file in `components/` that you can copy into
your own project. They need React 19 and Tailwind 4, and nothing else: no animation library and no package.

## Use a component

1. Open the component in `components/` (or click **Copy code** in the playground).
2. Paste it into your project, for example `src/components/jelly-toggle.tsx`.
3. Import it and use it: `<JellyToggle label="Wi-Fi" />`.

Colours come from CSS variables. Each one has a fallback, so a component works with none set.
Set them once to match your brand:

```css
:root {
  --hk-accent: #2f54eb;   /* the one accent */
  --hk-ink: #121418;      /* text and dark fills */
  --hk-paper: #ffffff;    /* surfaces */
  --hk-line: #d5d9df;     /* borders */
  --hk-muted: #dde1e7;    /* tracks and hovers */
  --hk-sub: #5a606c;      /* secondary text */
  --hk-danger: #d92d20;   /* errors */
  --hk-knob: #ffffff;     /* toggle and slider knobs */
  --hk-on-accent: #ffffff;/* text on the accent or danger colour */
}
```

## Rules every component keeps

- **Tap always works.** Drag, fling, hold and pluck are extras on top of a normal tap or keypress.
- **Never wait on the fun.** The state changes the moment you act; motion plays on top and can be interrupted.
- **Calm when asked.** With reduced motion on, everything still works and changes state, with the physics switched off.

## Why some code repeats

Components that use spring physics each carry their own small copy of it (about 25 lines) at the
bottom of the file. That keeps the promise: copy one file and it works.

## Run the playground

```bash
cd react
npm install
npm run dev
```

`npm run build` type-checks everything and builds the playground into `dist/`.
