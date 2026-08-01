export interface HotelListingFilters {
  name: string
  discountedOnly: boolean
  /** Selected star values, e.g. [4, 5]. */
  stars: number[]
  minPrice: number | null
  maxPrice: number | null
}

export const DEFAULT_PRICE_BOUNDS = { min: 25_000_000, max: 1_500_000_000 }

export function createDefaultFilters(): HotelListingFilters {
  return { name: '', discountedOnly: false, stars: [], minPrice: null, maxPrice: null }
}
