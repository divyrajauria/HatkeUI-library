# Hatke UI — how this repo is worked on

Hatke UI is Divy Rajauria's micro-interaction component library. Read this before changing anything.

## Name

The library is **Hatke UI**. The CSS prefix is `hk-` (classes `.hk-*`, variables `--hk-*`).
Never use the old working name, Nudge, or its `nd-` prefix.

## Design first, code second

1. Design and decide on the claude.ai artifacts first: the process canvas holds the reasoning,
   the library page shows the components.
2. Only change the repo once a design is decided.
3. Push only when Divy says so.

## Shipping rules

- **One change per pull request.** Never bundle unrelated work. A rename, a new component and a
  docs fix are three pull requests.
- **Never push to `main` directly.** Work on a short, descriptive branch (`add-radio-group`,
  `fix-tooltip-escape`), push it, open a pull request, and let Divy merge it.
- **Clean, explanatory pull requests.** Title in plain words saying what changes. The description
  covers what changed, why, how it was tested, and anything left to review.
- **Clear commits.** Short imperative subject line, then a body that explains why.
- **Commit as Divy only.** Author `Divy Rajauria <rajauriad@gmail.com>`. No Claude
  `Co-Authored-By` trailer and no Claude attribution in commits or pull request descriptions.

## Code

- **React 19 and Tailwind 4 only.** Each component is one `.tsx` file a person can copy and paste.
  Tailwind for layout and colour; keyframes and multi-part transitions go in a small
  `<style href="hk-<name>" precedence="hk">` block in the same file, which React 19 adds to the page once.
- **Copy code is the only way people get a component.** No install command, no npm package.
- No runtime dependencies beyond React. No animation libraries.
- Every component keeps keyboard support, 44px hit targets and a reduced-motion fallback.
- The repo still holds the v0 HTML snippets in `components/*.html` until they are ported to React.
