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
  /** Client-side filters — applied in the mock; wire to API params when backend supports them. */
  name?: string
  discountedOnly?: boolean
  stars?: number[]
  minPrice?: number | null
  maxPrice?: number | null
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
  /** Promotional discount — original struck-through price before the sale. */
  originalPrice?: number
  /** e.g. 17 for a "٪۱۷" badge. Present only when the hotel has a promotional discount. */
  discountPercent?: number
  hasDiscount: boolean
  /** 0-1 aggregate rating. Absent for unavailable hotels. The API doesn't expose a review count or text label (e.g. "عالی") yet. */
  score?: number
}

export interface HotelSearchResult {
  hotels: HotelSearchItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  /** Min/max sell price among available hotels matching non-price filters. */
  priceBounds: { min: number; max: number }
}

const MOCK_PAGE_SIZE = 4

function buildMockHotelItem(hotel: MockHotel, checkIn: string): HotelSearchItem {
  const variance = 0.9 + seededRandom(`${hotel.slug}-search-${checkIn}`) * 0.35
  const roomFee = Math.round((hotel.baseFee * variance) / 10_000) * 10_000
  const roomBoardPrice = Math.round((roomFee * 1.15) / 10_000) * 10_000
  const isAvailable = seededRandom(`${hotel.slug}-avail-${checkIn}`) > 0.08
  const hasDiscount = isAvailable && seededRandom(`${hotel.slug}-home-discount`) > 0.5
  const originalPrice = hasDiscount ? Math.round((roomFee * 1.2) / 10_000) * 10_000 : undefined
  const discountPercent =
    hasDiscount && originalPrice ? Math.round((1 - roomFee / originalPrice) * 100) : undefined

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
    originalPrice,
    discountPercent,
    hasDiscount,
    score: isAvailable ? Math.round((0.6 + seededRandom(`${hotel.slug}-score`) * 0.38) * 100) / 100 : undefined,
  }
}

const MOCK_SORTERS: Record<HotelSortBy, (a: HotelSearchItem, b: HotelSearchItem) => number> = {
  default: (a, b) => Number(b.isPinned) - Number(a.isPinned),
  lowest_price: (a, b) => a.minSellPrice - b.minSellPrice,
  highest_price: (a, b) => b.minSellPrice - a.minSellPrice,
  highest_rating: (a, b) => b.stars - a.stars || (b.score ?? 0) - (a.score ?? 0),
  highest_discount: (a, b) => {
    const discountAmount = (hotel: HotelSearchItem) =>
      hotel.hasDiscount && hotel.originalPrice ? hotel.originalPrice - hotel.minSellPrice : 0
    return discountAmount(b) - discountAmount(a)
  },
}

function applySearchFilters(
  hotels: HotelSearchItem[],
  params: HotelSearchParams,
  options?: { skipPrice?: boolean },
): HotelSearchItem[] {
  let result = hotels

  const name = params.name?.trim()
  if (name) {
    result = result.filter((hotel) => hotel.name.includes(name))
  }

  if (params.discountedOnly) {
    result = result.filter((hotel) => hotel.hasDiscount)
  }

  if (params.stars?.length) {
    result = result.filter((hotel) => params.stars!.includes(hotel.stars))
  }

  if (!options?.skipPrice) {
    if (params.minPrice != null) {
      result = result.filter((hotel) => hotel.minSellPrice >= params.minPrice!)
    }

    if (params.maxPrice != null) {
      result = result.filter((hotel) => hotel.minSellPrice <= params.maxPrice!)
    }
  }

  return result
}

function computePriceBounds(hotels: HotelSearchItem[]): { min: number; max: number } {
  const prices = hotels.filter((hotel) => hotel.isAvailable).map((hotel) => hotel.minSellPrice)
  if (prices.length === 0) {
    return { min: 0, max: 0 }
  }

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return { min, max: max === min ? min + 10_000 : max }
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

  const baseHotels = hotelsForCity(params.city).map((hotel) => buildMockHotelItem(hotel, params.checkIn))
  const filteredWithoutPrice = applySearchFilters(baseHotels, params, { skipPrice: true })
  const priceBounds = computePriceBounds(filteredWithoutPrice)
  const allHotels = applySearchFilters(filteredWithoutPrice, params).sort(
    MOCK_SORTERS[params.sortBy] ?? MOCK_SORTERS.default,
  )

  const page = params.page && params.page > 0 ? params.page : 1
  const start = (page - 1) * MOCK_PAGE_SIZE
  const hotels = allHotels.slice(start, start + MOCK_PAGE_SIZE)

  return {
    hotels,
    total: allHotels.length,
    page,
    pageSize: MOCK_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(allHotels.length / MOCK_PAGE_SIZE)),
    priceBounds,
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

  const hotels = (data.hotels as any[]).map((hotel) => ({
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
      hasDiscount: false,
      score: hotel.score,
    }))

  return {
    hotels,
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
    priceBounds: computePriceBounds(hotels),
  }
}
