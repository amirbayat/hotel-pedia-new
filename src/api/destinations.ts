import { MOCK_CITIES, MOCK_HOTELS, hotelsForCity } from './mockCityData'

const PANEL_BASE_URL = 'https://panel.hotelpedia.ir'
const AUTOCOMPLETE_URL = `${PANEL_BASE_URL}/api/v1/hotel-search/autocomplete`

export interface CityDestination {
  type: 'city'
  id: string | number
  label: string
  slug: string
  province: string
  hotelsCount: number
}

export interface HotelDestination {
  type: 'hotel'
  id: string | number
  label: string
  slug: string
  cityName: string
  citySlug: string
}

export type Destination = CityDestination | HotelDestination

const DEFAULT_FOCUS_CITY_SUGGESTIONS: Array<{ name: string; province: string }> = [
  { name: 'مشهد', province: 'استان خراسان رضوی' },
  { name: 'تهران', province: 'استان تهران' },
  { name: 'اصفهان', province: 'استان اصفهان' },
  { name: 'کاشان', province: 'استان اصفهان' },
  { name: 'کیش', province: 'استان هرمزگان' },
  { name: 'قشم', province: 'استان هرمزگان' },
  { name: 'تبریز', province: 'استان آذربایجان شرقی' },
]

/** Popular cities shown when the destination field is focused with no query yet. */
export function getDefaultDestinationSuggestions(): CityDestination[] {
  return DEFAULT_FOCUS_CITY_SUGGESTIONS.map((city) => ({
    type: 'city',
    id: city.name,
    label: city.name,
    slug: city.name,
    province: city.province,
    hotelsCount: hotelsForCity(city.name).length,
  }))
}

/**
 * Searches both cities and hotels by name — feeds the "مقصد یا هتل" field's suggestions dropdown.
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — see `searchDestinationsFromApi` for
 * the real implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function searchDestinations(query: string, signal?: AbortSignal): Promise<Destination[]> {
  void signal
  await new Promise((resolve) => setTimeout(resolve, 150))

  const term = query.trim()
  if (!term) return []

  const cityMatches: CityDestination[] = MOCK_CITIES.filter((city) => city.name.includes(term)).map((city) => ({
    type: 'city',
    id: city.name,
    label: city.name,
    slug: city.name,
    province: city.province,
    hotelsCount: hotelsForCity(city.name).length,
  }))

  const hotelMatches: HotelDestination[] = MOCK_HOTELS.filter((hotel) => hotel.name.includes(term))
    .slice(0, 5)
    .map((hotel) => ({
      type: 'hotel',
      id: hotel.id,
      label: hotel.name,
      slug: hotel.slug,
      cityName: hotel.cityName,
      citySlug: hotel.cityName,
    }))

  return [...cityMatches, ...hotelMatches]
}

/** Real implementation of `searchDestinations`, unused while destination search is mocked. */
export async function searchDestinationsFromApi(query: string, signal?: AbortSignal): Promise<Destination[]> {
  const url = `${AUTOCOMPLETE_URL}?keyword=${encodeURIComponent(query)}`
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal })

  if (!response.ok) {
    throw new Error(`searchDestinations failed with status ${response.status}`)
  }

  const body = await response.json()

  return (body.data as any[]).map((item) =>
    item.type === 'hotel'
      ? { type: 'hotel', id: item.id, label: item.label, slug: item.slug, cityName: item.city_name, citySlug: item.city_slug }
      : {
          type: 'city',
          id: item.id,
          label: item.label,
          slug: item.slug,
          province: item.province,
          hotelsCount: item.hotels_count,
        },
  )
}
