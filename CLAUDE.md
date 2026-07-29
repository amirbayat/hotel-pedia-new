# Hotelpedia

React + TypeScript + Vite project for Hotelpedia. This file documents project-specific
conventions — read it before touching icons, colors, or the design-token pipeline.

## Stack

- Vite 8 + React 19 + TypeScript
- Package manager: yarn (`yarn.lock` is the source of truth — don't commit `package-lock.json`)
- Linting: oxlint (`npm run lint`)

## Fonts

Site font is **Yekan Bakh (FaNum)**, loaded locally from
`src/assets/font/YekanBakh - FaNum/with-weight/` via `@font-face` rules in
`src/styles/fonts.scss` (imported once in `main.tsx`). Use the `with-weight`
subfolder specifically — its file names already encode the correct numeric
`font-weight` for each cut (200 Thin ... 900 ExtraBlack), matching what's set
in component CSS, so you don't need a separate weight-mapping table. The
plain-named files in the parent folder are duplicates of the same weights —
prefer `with-weight` as the source of truth.

`font-family: 'Yekan Bakh'` is set globally on `:root` in `index.css`, so any
component that doesn't set its own `font-family` inherits it automatically.

## Icons

All icons come from the Figma "Hotelpedia" file (`Single color icon 24px` frame,
node-id 151-68) and are wired up as React components via `vite-plugin-svgr`.

### Usage

```tsx
import { IconSearch, IconWallet } from './components/icons'

<IconSearch />                              // 24×24, color: currentColor (inherits text color)
<IconSearch color="#2563eb" />              // recolor
<IconWallet width={32} height={32} />       // resize (overrides the 24px default)
<IconWallet className="text-blue-600" />    // color via Tailwind/CSS too, since fill=currentColor
```

Every icon is a plain SVG component — it accepts all standard `<svg>` props
(`width`, `height`, `color`, `className`, `style`, `onClick`, ...).

- **Default size is 24×24** (Figma's icon grid). Pass `width`/`height` explicitly to override.
- **Color follows `currentColor`**: every icon's fill was normalized to `currentColor`, so it
  inherits the CSS `color` of its context, or you can set it directly via the `color` prop
  (SVG's `color` presentation attribute) or a `style`/`className` that sets `color`.

### Adding new icons

1. In Figma, select the icon(s) you need under `Single color icon 24px` and export as SVG.
2. Drop the files into `src/assets/hotel-pedia-icons/` (any filename works, including Figma's
   `Choice icon=Name.svg` export naming — the script strips that prefix automatically).
3. Run:

   ```
   npm run icons
   ```

   This cleans each SVG with SVGO, forces `fill`/`stroke` to `currentColor`, writes the result
   to `src/assets/icons/`, and regenerates `src/components/icons/index.ts` (the barrel file —
   **do not edit it by hand**, it's overwritten every run).
4. Import the new `IconXxx` from `./components/icons` as usual.

### How it works (for reference)

- `scripts/process-icons.mjs` — the cleanup/codegen pipeline described above.
- `vite.config.ts` — configures `vite-plugin-svgr` so `import x from './y.svg?react'`
  yields a React component.
- Source SVGs keep their Figma-native `width="24" height="24"`; `vite-plugin-svgr`'s
  `expandProps: 'end'` spreads consumer props after that, so passing `width`/`height`
  overrides the 24px default instead of conflicting with it.

## Colors (design tokens)

Colors were pulled from Figma's bound variables (via the Figma MCP `get_variable_defs`
tool, checked across the login, register, and home screens on 2026-07-28) — not eyeballed
from screenshots. They live in two parallel files that must be kept in sync:

- `src/styles/colors.scss` — SCSS variables (`$color-*`)
- `src/styles/colors.ts` — TS constants (`colorScale`, `colors`)

Each file exposes two layers:

- **Raw scale** (`$color-primary-200` / `colorScale.primary200`) — named exactly as in Figma
  (`P-100`...`P-800`, `N-200`...`N-900`).
- **Semantic aliases** (`$color-text-primary` / `colors.textPrimary`) — meaning-based names
  for what the token is used for (text, surface, border, brand). **Prefer semantic names in
  component code** — reach for the raw scale only when a semantic name doesn't fit yet.

```scss
// SCSS
@use '../styles/colors' as *;
.card {
  background: $color-surface;
  color: $color-text-primary;
  border: 1px solid $color-border-default;
}
```

```tsx
// TS/TSX
import { colors } from '../styles/colors'

<div style={{ background: colors.surface, color: colors.textPrimary }} />
```

One color, `colors.brandCta` / `$color-brand-cta` (`#ff6400`), was seen applied directly on
primary CTA buttons in Figma but isn't bound to an actual Figma variable in any inspected
screen — treat it as provisional and confirm with design before relying on it long-term.

If more colors show up as you implement new screens, re-run `get_variable_defs` on that
Figma node and add the new tokens to **both** files, keeping the raw/semantic split above.

Requires the `sass` dev dependency (already in `package.json` — run `yarn install` to pick it up).

## Base components

Base UI components live under `src/components/<Name>/`, each with its own `<Name>.tsx` +
`<Name>.module.scss` (CSS Modules) + an `index.ts` barrel. They style themselves from
`src/styles/colors.scss` — don't hardcode hex values in a component.

- **`Button`** (`src/components/Button`) — matches Figma "Buttons Assets" (node 148:1005).
  `variant="primary" | "secondary"`, optional `icon` (an `IconXxx` from `./components/icons`),
  and an icon-only mode that kicks in automatically when no `children` (label) is passed.
  Hover/focus/active are real CSS states; `disabled` is a normal prop.

  ```tsx
  <Button icon={IconSearch}>جستجو</Button>
  <Button variant="secondary">لغو</Button>
  <Button icon={IconSearch} aria-label="جستجو" /> {/* icon-only */}
  ```

- **`Input`** (`src/components/Input`) — matches Figma "Text field" (nodes 151:831 / 151:906).
  `label`, `hint`, `leadingIcon`, `trailingIcon` (+ `onTrailingIconClick` to make it clickable,
  e.g. a clear button), and an `error` prop that switches the field to its error state and
  replaces `hint` with the error message. Hover/focus are CSS states; everything else is a prop.

- **`OtpInput`** (`src/components/OtpInput`) — matches Figma "Password segment field"
  (node 151:831, states at 151:937). `length` (default 6), controlled `value`/`onChange`,
  auto-advances to the next box on input, steps back on backspace, and splits a pasted code
  across boxes. Same `label`/`hint`/`error`/`disabled` props as `Input`.

All three are rendered with a few variants each in `App.tsx` (`ComponentsPlayground`) — check
there for live examples before wiring up a new screen.
