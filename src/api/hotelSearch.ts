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

/**
 * GET /api/v1/hotel-search
 *
 * Note: the API has no parameters yet for hotel name, star rating, price range,
 * or "discounted only" — the FilterSidebar keeps those in the URL for now
 * without sending them here. See docs/hotel-listing-plan.md §3.4.
 */
export async function searchHotels(params: HotelSearchParams, signal?: AbortSignal): Promise<HotelSearchResult> {
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
