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

/** Searches both cities and hotels by name — feeds the "مقصد یا هتل" field's suggestions dropdown. */
export async function searchDestinations(query: string, signal?: AbortSignal): Promise<Destination[]> {
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
