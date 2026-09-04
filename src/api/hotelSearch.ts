import { hotelsForCity, seededRandom } from './mockCityData'
import type { MockHotel } from './mockCityData'

const PANEL_BASE_URL = 'https://panel.hotelpedia.ir'

export type HotelSortBy = 'default' | 'lowest_price' | 'highest_price' | 'highest_rating' | 'highest_discount'

export interface HotelSearchParams {
  /** city_slug, e.g. "تهران". */
  city: string
  /** Gregorian ISO date ("YYYY-MM-DD"). */
  checkIn: string
  /** Gregorian ISO date ("YYYY-MM-DD"). */
  checkOut: string
  sortBy: HotelSortBy
  page?: number
}

export interface HotelSearchItem {
  id: number
  name: string
  slug: string
  stars: number
  address: string
  citySlug: string
  /** Room-only price. */
  roomFee: number
  /** Price including board (e.g. breakfast) — not a "was" price, so don't render it struck-through as a discount. */
  roomBoardPrice: number
  roomName: string
  imageUrl: string
  isAvailable: boolean
  isPinned: boolean
  minSellPrice: number
  /** 0-1 aggregate rating. Absent for unavailable hotels. The API doesn't expose a review count or text label (e.g. "عالی") yet. */
  score?: number
}

export interface HotelSearchResult {
  hotels: HotelSearchItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const MOCK_PAGE_SIZE = 4

function buildMockHotelItem(hotel: MockHotel, checkIn: string): HotelSearchItem {
  const variance = 0.9 + seededRandom(`${hotel.slug}-search-${checkIn}`) * 0.35
  const roomFee = Math.round((hotel.baseFee * variance) / 10_000) * 10_000
  const roomBoardPrice = Math.round((roomFee * 1.15) / 10_000) * 10_000
  const isAvailable = seededRandom(`${hotel.slug}-avail-${checkIn}`) > 0.08

  return {
    id: hotel.id,
    name: hotel.name,
    slug: hotel.slug,
    stars: hotel.stars,
    address: hotel.address,
    citySlug: hotel.cityName,
    roomFee,
    roomBoardPrice,
    roomName: hotel.roomName,
    imageUrl: `https://picsum.photos/seed/${hotel.imageSeed}/600/400`,
    isAvailable,
    isPinned: hotel.isPinned,
    minSellPrice: roomFee,
    score: isAvailable ? Math.round((0.6 + seededRandom(`${hotel.slug}-score`) * 0.38) * 100) / 100 : undefined,
  }
}

const MOCK_SORTERS: Record<HotelSortBy, (a: HotelSearchItem, b: HotelSearchItem) => number> = {
  default: (a, b) => Number(b.isPinned) - Number(a.isPinned),
  lowest_price: (a, b) => a.minSellPrice - b.minSellPrice,
  highest_price: (a, b) => b.minSellPrice - a.minSellPrice,
  highest_rating: (a, b) => b.stars - a.stars || (b.score ?? 0) - (a.score ?? 0),
  highest_discount: (a, b) => b.roomBoardPrice - b.roomFee - (a.roomBoardPrice - a.roomFee),
}

/**
 * GET /api/v1/hotel-search
 *
 * Note: the API has no parameters yet for hotel name, star rating, price range,
 * or "discounted only" — the FilterSidebar keeps those in the URL for now
 * without sending them here. See docs/hotel-listing-plan.md §3.4.
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — see `searchHotelsFromApi` for the
 * real implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function searchHotels(params: HotelSearchParams, signal?: AbortSignal): Promise<HotelSearchResult> {
  void signal
  await new Promise((resolve) => setTimeout(resolve, 250))

  const allHotels = hotelsForCity(params.city)
    .map((hotel) => buildMockHotelItem(hotel, params.checkIn))
    .sort(MOCK_SORTERS[params.sortBy] ?? MOCK_SORTERS.default)

  const page = params.page && params.page > 0 ? params.page : 1
  const start = (page - 1) * MOCK_PAGE_SIZE
  const hotels = allHotels.slice(start, start + MOCK_PAGE_SIZE)

  return {
    hotels,
    total: allHotels.length,
    page,
    pageSize: MOCK_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(allHotels.length / MOCK_PAGE_SIZE)),
  }
}

/** Real implementation of `searchHotels`, unused while the hotel-listing page is mocked. */
export async function searchHotelsFromApi(params: HotelSearchParams, signal?: AbortSignal): Promise<HotelSearchResult> {
  const query = new URLSearchParams({
    city: params.city,
    check_in: params.checkIn,
    check_out: params.checkOut,
    sort_by: params.sortBy,
  })
  if (params.page) query.set('page', String(params.page))

  const response = await fetch(`${PANEL_BASE_URL}/api/v1/hotel-search?${query}`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`searchHotels failed with status ${response.status}`)
  }

  const body = await response.json()
  const data = body.data

  return {
    hotels: (data.hotels as any[]).map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      slug: hotel.slug,
      stars: hotel.stars,
      address: hotel.address,
      citySlug: hotel.city_slug,
      roomFee: hotel.room_fee,
      roomBoardPrice: hotel.room_board_price,
      roomName: hotel.room_name,
      imageUrl: hotel.image,
      isAvailable: hotel.is_available,
      isPinned: hotel.is_pinned,
      minSellPrice: hotel.min_sell_price,
      score: hotel.score,
    })),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
  }
}
