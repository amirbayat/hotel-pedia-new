const PANEL_BASE_URL = 'https://panel.hotelpedia.ir'

export interface HotelImage {
  path: string
  orderColumn: number
}

export interface HotelAmenity {
  name: string
}

/**
 * ⚠️ Shape guessed from the same {order_column, title, content} convention used by
 * home.ts's faqs/seoTexts — the hotel-show sample response always returns an empty
 * array here, so this hasn't been confirmed against a real payload. Verify before relying on it.
 */
export interface HotelRule {
  id: number
  title: string
  content: string
}

export interface HotelRoomCalendarDay {
  id: number
  /** Gregorian ISO date ("YYYY-MM-DD"). */
  date: string
  /** Price including board (e.g. breakfast) for this night. */
  boardPrice: number
  /** Room-only price for this night. */
  fee: number
  extraPersonFee: number
}

/**
 * Confirmed against a live hotel-show response (docs/hotel-detail-plan.md) — there's no
 * `name`/image/refund-policy field per room, only `room_kind`, capacity, and a
 * near-year-long `room_calendars` array of nightly rates. Use `getRoomPriceForStay`
 * to total the nights for the current search's date range.
 *
 * ⚠️ `foodServices`/`amenities` inner item shape is unconfirmed — every sample seen
 * so far returns them as empty arrays.
 */
export interface HotelRoom {
  id: number
  roomKind: string
  /** Available room count for this room kind. */
  availableCount: number
  personCount: number
  extraPersonCount: number
  foodServices: string[]
  amenities: string[]
  calendar: HotelRoomCalendarDay[]
}

/** Sums a room's nightly rates over [startDate, endDate) — null if the calendar has no matching nights. */
export function getRoomPriceForStay(room: HotelRoom, startDate: string, endDate: string) {
  const nights = room.calendar.filter((day) => day.date >= startDate && day.date < endDate)
  if (nights.length === 0) return null

  return {
    nights: nights.length,
    fee: nights.reduce((sum, day) => sum + day.fee, 0),
    boardPrice: nights.reduce((sum, day) => sum + day.boardPrice, 0),
  }
}

export interface HotelRating {
  total: number
  totalCount: number
  cleanliness: number
  location: number
  service: number
  staff: number
  valueOfMoney: number
}

export interface HotelDetail {
  slug: string
  name: string
  hotelKind: string
  address: string
  location: { lat: number; lng: number }
  stars: number
  checkIn: string
  checkOut: string
  description: string
  images: HotelImage[]
  amenities: HotelAmenity[]
  generalRules: HotelRule[]
  cancellationRules: HotelRule[]
  rooms: HotelRoom[]
  rating: HotelRating
}

export interface HotelDetailParams {
  slug: string
  /** Gregorian ISO date ("YYYY-MM-DD"). Optional — the API param is nullable. */
  startDate?: string
  /** Gregorian ISO date ("YYYY-MM-DD"). Optional — the API param is nullable. */
  endDate?: string
}

/** GET /api/v1/hotel-show/{hotel:slug} — see docs/hotel-detail-plan.md. */
export async function fetchHotelDetail(params: HotelDetailParams, signal?: AbortSignal): Promise<HotelDetail> {
  const query = new URLSearchParams()
  if (params.startDate) query.set('start_date', params.startDate)
  if (params.endDate) query.set('end_date', params.endDate)
  const queryString = query.toString()

  const response = await fetch(
    `${PANEL_BASE_URL}/api/v1/hotel-show/${encodeURIComponent(params.slug)}${queryString ? `?${queryString}` : ''}`,
    { headers: { Accept: 'application/json' }, signal },
  )

  if (!response.ok) {
    throw new Error(`fetchHotelDetail failed with status ${response.status}`)
  }

  const body = await response.json()
  const data = body.data

  return {
    slug: data.slug,
    name: data.name,
    hotelKind: data.hotel_kind,
    address: data.address,
    location: { lat: Number(data.location.lat), lng: Number(data.location.lng) },
    stars: data.stars,
    checkIn: data.check_in,
    checkOut: data.check_out,
    description: data.description,
    images: (data.images as any[]).map((image) => ({
      path: image.path,
      orderColumn: image.order_column,
    })),
    amenities: (data.amenities as any[]).map((amenity) => ({ name: amenity.name })),
    generalRules: (data.general_rules as any[]).map((rule, index) => ({
      id: rule.order_column ?? index + 1,
      title: rule.title,
      content: rule.content,
    })),
    cancellationRules: (data.cancellation_rules as any[]).map((rule, index) => ({
      id: rule.order_column ?? index + 1,
      title: rule.title,
      content: rule.content,
    })),
    rooms: (data.rooms as any[]).map((room) => ({
      id: room.id,
      roomKind: room.room_kind,
      availableCount: room.count,
      personCount: room.person_count,
      extraPersonCount: room.extra_person_count,
      foodServices: (room.food_services as any[]).map((item) => item.name),
      amenities: (room.amenities as any[]).map((item) => item.name),
      calendar: (room.room_calendars as any[]).map((day) => ({
        id: day.id,
        date: day.pick_date,
        boardPrice: day.board_price,
        fee: day.fee,
        extraPersonFee: day.extra_person_fee,
      })),
    })),
    rating: {
      total: data.rating.total,
      totalCount: data.rating.total_count,
      cleanliness: data.rating.cleanliness,
      location: data.rating.location,
      service: data.rating.service,
      staff: data.rating.staff,
      valueOfMoney: data.rating.value_of_money,
    },
  }
}
