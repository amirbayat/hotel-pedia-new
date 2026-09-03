import type { PricesByDate } from '../components/DateRangeCalendar'

/**
 * Buckets a set of per-date prices into cheap/medium/expensive terciles (by
 * distinct price value, not by day count) for `DateRangeCalendar`'s legend.
 * No API in this app returns a pre-computed tier, so every caller needs this.
 */
export function computePriceTiers(pricesByDateValue: Record<string, number>): PricesByDate {
  const entries = Object.entries(pricesByDateValue)
  if (entries.length === 0) return {}

  const distinctPrices = [...new Set(entries.map(([, price]) => price))].sort((a, b) => a - b)

  if (distinctPrices.length === 1) {
    return Object.fromEntries(entries.map(([date]) => [date, 'medium' as const]))
  }

  const lowBound = distinctPrices[Math.floor((distinctPrices.length - 1) / 3)]
  const highBound = distinctPrices[Math.floor((2 * (distinctPrices.length - 1)) / 3)]

  const result: PricesByDate = {}
  for (const [date, price] of entries) {
    result[date] = price <= lowBound ? 'cheap' : price >= highBound ? 'expensive' : 'medium'
  }
  return result
}
