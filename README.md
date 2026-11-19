# Nudge

Everyday UI components with one considered idea about motion each.
Copy one, paste it into your page, and it works: HTML, CSS and a few lines of plain JavaScript, no dependencies.

> Nudge is a working name. v0, ten components.

## The ten

| Component | The idea |
| --- | --- |
| Toggle | The knob stretches on press and leaves the colour behind it as it travels. |
| Checkbox | The box squeezes on press, then the check is drawn in like a pen stroke. |
| Button | Folds into a circle while it works, opens back up with a check or a shake. |
| Tabs | Inchworm underline: the leading edge leaves first, the trailing edge follows. |
| Tooltip | One tooltip that travels between buttons once it has appeared. |
| Toast stack | A deck that fans out on hover, with timers you can see and pause. |
| Slider | The value bubble leans back against the drag and settles when you stop. |
| Text field | Refuses a character it can't take, with a small dampened shake. |
| Accordion | Opens on a grid track, then its lines arrive top to bottom. |
| Stepper | Odometer: only the changed digits roll, and the number bumps at the limit. |

## Motion rules every component follows

1. React on press, resolve on release.
2. Motion carries direction.
3. State first, animation second. Nothing waits on an animation; everything can be interrupted.
4. A refusal is a shake, not a dialog.
5. One check mark, drawn the same way everywhere.
6. Two curves (`cubic-bezier(.2,.8,.2,1)` for travel, `cubic-bezier(.34,1.56,.64,1)` for settling), three speeds (120 / 200 / 320ms).
   With reduced motion on, the state still changes and the travel, overshoot and shake are switched off.

## Theming

Every component reads these variables, with fallbacks, so it works with none of them set:

```css
:root {
  --nd-accent: #2f54eb;  /* the one accent */
  --nd-ink: #121418;     /* text, dark fills */
  --nd-paper: #ffffff;   /* surfaces */
  --nd-line: #c9ced6;    /* borders */
  --nd-muted: #dde1e7;   /* tracks, hovers */
  --nd-sub: #5a606c;     /* secondary text */
  --nd-danger: #d92d20;  /* errors */
  --nd-on-accent: #fff;  /* icons on accent and danger */
}
```

## How this repo works

```
components/<name>.html   one self-contained snippet per component: the single source
components/index.json    names, ideas and specs shown on the library page
site/template.html       the library page around them
build.js                 builds dist/ from the two above
dist/index.html          the library page, a full document for any static host
dist/artifact.html       the same page, published as the live claude.ai link
```

Edit a snippet in `components/`, then run:

```bash
node build.js
```

The page runs each snippet exactly as written, and **Copy code** copies the file byte for byte, so the page and the code can't drift apart.
