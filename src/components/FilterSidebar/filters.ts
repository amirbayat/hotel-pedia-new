export interface HotelListingFilters {
  name: string
  discountedOnly: boolean
  /** Selected star values, e.g. [4, 5]. */
  stars: number[]
  minPrice: number | null
  maxPrice: number | null
}

export const DEFAULT_PRICE_BOUNDS = { min: 25_000_000, max: 1_500_000_000 }

/** From/to thumbs stay at least this far apart so they cannot stack. */
export const PRICE_SLIDER_GAP = 1_000
export const PRICE_SLIDER_STEP = 1_000

export function sliderPriceBounds(bounds: { min: number; max: number }) {
  if (bounds.max - bounds.min < PRICE_SLIDER_GAP) {
    return { min: bounds.min, max: bounds.min + PRICE_SLIDER_GAP }
  }
  return bounds
}

export function clampPricesWithGap(
  minValue: number,
  maxValue: number,
  bounds: { min: number; max: number },
) {
  const range = sliderPriceBounds(bounds)
  let min = Math.min(Math.max(minValue, range.min), range.max)
  let max = Math.min(Math.max(maxValue, range.min), range.max)

  if (max - min < PRICE_SLIDER_GAP) {
    if (min + PRICE_SLIDER_GAP <= range.max) {
      max = min + PRICE_SLIDER_GAP
    } else {
      max = range.max
      min = range.max - PRICE_SLIDER_GAP
    }
  }

  return { min, max }
}

export function createDefaultFilters(): HotelListingFilters {
  return { name: '', discountedOnly: false, stars: [], minPrice: null, maxPrice: null }
}
