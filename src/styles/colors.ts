// -----------------------------------------------------------------------------
// Design tokens — colors
// Source: Figma "Hotelpedia" file, bound variables read via get_variable_defs
// on the login/register/home screens (2026-07-28). Keep in sync with colors.scss.
// -----------------------------------------------------------------------------

/** Raw color scale, named as in Figma. Prefer `colors` (semantic) in components. */
export const colorScale = {
  // Primary (blue) scale
  primary100: '#0046a0',
  primary200: '#0080ff',
  primary300: '#ff771f', // button hover/focus
  primary400: '#ff8b40', // button pressed
  primary500: '#80bfff',
  primary600: '#99ccff',
  primary700: '#b2d9ff',
  primary800: '#cce6ff',
  primary900: '#e5f2ff', // secondary button hover/focus background

  // Neutral (gray) scale
  neutral200: '#323232',
  neutral400: '#5f5f5f',
  neutral500: '#7d7d7d',
  neutral600: '#9b9b9b',
  neutral700: '#b9b9b9',
  neutral800: '#d7d7d7',
  neutral900: '#f5f5f5',

  // Error (red) scale — only one step seen so far
  error200: '#b40000',

  white: '#ffffff',
  overlayBlack: 'rgba(0, 0, 0, 0.5)', // Figma "W-500"

  // Seen on primary CTA buttons in the design, but not bound to a Figma
  // variable in any of the screens inspected — verify with design before
  // treating this as a stable token.
  ctaOrange: '#ff6400',

  // Calendar day-price tiers (booking date-range picker) — not sourced from a
  // Figma variable, picked to match the "ارزان/میانه/گران قیمت" legend colors
  // seen in the design export. Verify with design before treating as stable.
  priceCheap: '#1a9c5c',
} as const

/** Semantic aliases — use these in components instead of the raw scale. */
export const colors = {
  // Text
  textPrimary: colorScale.neutral200,
  textMuted: colorScale.neutral600,
  textLink: colorScale.primary200,
  textInverse: colorScale.white,

  // Surfaces
  surface: colorScale.white,
  surfaceMuted: colorScale.neutral900,
  overlayScrim: colorScale.overlayBlack,

  // Borders
  borderDefault: colorScale.neutral700,
  borderSubtle: colorScale.neutral800,
  borderHover: colorScale.neutral400,
  borderFocus: colorScale.neutral600,
  borderError: colorScale.error200,

  // Feedback
  textError: colorScale.error200,

  // Brand
  brandPrimary: colorScale.primary200,
  brandPrimaryDark: colorScale.primary100,
  brandCta: colorScale.ctaOrange,

  // Calendar price tiers
  priceTierCheap: colorScale.priceCheap,
  priceTierMedium: colorScale.primary200,
  priceTierExpensive: colorScale.error200,
} as const

export type ColorScaleToken = keyof typeof colorScale
export type ColorToken = keyof typeof colors
