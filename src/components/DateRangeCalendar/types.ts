/** Booking date-range, as Gregorian ISO strings ("YYYY-MM-DD") — `to` is null until a second date is picked. */
export interface DateRange {
  from: string | null
  to: string | null
}

/** Per-day pricing bucket used to color-code a cell. Days with no entry render in the default (neutral) color. */
export type PriceTier = 'cheap' | 'medium' | 'expensive'

export type PricesByDate = Partial<Record<string, PriceTier>>
