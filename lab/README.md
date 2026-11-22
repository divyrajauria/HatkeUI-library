# Hatke UI lab

The lab is where each component's motion is designed and agreed before it is built for real.
Every page here is a playable prototype in plain HTML, CSS and JavaScript.
The finished library will be React and Tailwind; these pages are what those versions copy.

Open `index.html` in a browser to see the list, or open any component page on its own.

## What's here

| File | What it is |
| --- | --- |
| `lab.css` | Shared colours, type and card styles, in light and dark |
| `spring.js` | The shared physics: a damped spring and a frame loop |
| `<component>.html` | One playable component per page |
| `index.html` | The front page, linking all ten |

## Rules every component keeps

- **Tap always works.** Drag, fling, hold and pluck are extras on top of a normal tap or keypress.
- **Never wait on the fun.** The state changes the moment you act; motion plays on top and can be interrupted.
- **Calm when asked.** With reduced motion on, everything still works and changes state, with the physics switched off.
