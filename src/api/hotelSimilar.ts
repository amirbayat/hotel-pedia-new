const PANEL_BASE_URL = 'https://panel.hotelpedia.ir'

export interface SimilarHotel {
  id: number
  name: string
  slug: string
  stars: number
  address: string
  citySlug: string
  image: string
}

const MOCK_SIMILAR_HOTELS: Omit<SimilarHotel, 'id'>[] = [
  { name: 'هتل پارسیان استقلال', slug: 'parsian-esteghlal', stars: 5, address: 'تهران، ولنجک', citySlug: 'tehran', image: 'https://picsum.photos/seed/hotelpedia-similar-1/600/400' },
  { name: 'هتل اسپیناس تهران', slug: 'espinas-tehran', stars: 5, address: 'تهران، سعادت‌آباد', citySlug: 'tehran', image: 'https://picsum.photos/seed/hotelpedia-similar-2/600/400' },
  { name: 'هتل لاله', slug: 'laleh', stars: 4, address: 'تهران، خیابان کارگر', citySlug: 'tehran', image: 'https://picsum.photos/seed/hotelpedia-similar-3/600/400' },
  { name: 'هتل هما', slug: 'homa', stars: 4, address: 'تهران، میدان ونک', citySlug: 'tehran', image: 'https://picsum.photos/seed/hotelpedia-similar-4/600/400' },
]

/**
 * GET /api/v1/hotels/{hotel_id}/similar
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — see `fetchSimilarHotelsFromApi` for
 * the real implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function fetchSimilarHotels(hotelId: number, signal?: AbortSignal): Promise<SimilarHotel[]> {
  void hotelId
  void signal
  await new Promise((resolve) => setTimeout(resolve, 200))
  return MOCK_SIMILAR_HOTELS.map((hotel, index) => ({ id: index + 1, ...hotel }))
}

/** Real implementation of `fetchSimilarHotels`, unused while the hotel-detail flow is mocked. */
export async function fetchSimilarHotelsFromApi(hotelId: number, signal?: AbortSignal): Promise<SimilarHotel[]> {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/hotels/${hotelId}/similar`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`fetchSimilarHotels failed with status ${response.status}`)
  }

  const body = await response.json()

  return (body.data.hotels as any[]).map((hotel) => ({
    id: hotel.id,
    name: hotel.name,
    slug: hotel.slug,
    stars: hotel.stars,
    address: hotel.address,
    citySlug: hotel.city_slug,
    image: hotel.image,
  }))
}
