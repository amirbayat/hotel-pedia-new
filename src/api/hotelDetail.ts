import { isoDateOnly, isStayNightDate, nightsBetween, toIsoDate } from '../lib/date/jalali'
import {
  findMockHotelBySlug,
  mockHotelReviewCount,
  mockHotelScore10,
  seededRandom,
  type MockHotel,
} from './mockCityData'

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

/** Sums a room's nightly rates over [startDate, endDate) — checkout is not a billed night. */
export function getRoomPriceForStay(room: HotelRoom, startDate: string, endDate: string) {
  const start = isoDateOnly(startDate)
  const end = isoDateOnly(endDate)
  const nightCount = nightsBetween(start, end)
  if (nightCount === 0) return null

  const byDate = new Map<string, HotelRoomCalendarDay>()
  for (const day of room.calendar) {
    const date = isoDateOnly(day.date)
    if (isStayNightDate(date, start, end)) byDate.set(date, day)
  }
  if (byDate.size === 0) return null

  const nights = [...byDate.values()]
  const fee = nights.reduce((sum, day) => sum + day.fee, 0)
  const boardPrice = nights.reduce((sum, day) => sum + day.boardPrice, 0)

  // Promotional discount is separate from boardPrice (breakfast markup) — same mock
  // pattern as hotelSearch. Real API can replace this once a discount field exists.
  const hasDiscount = seededRandom(`${room.id}-room-discount`) > 0.5
  const originalPrice = hasDiscount ? Math.round((fee * 1.2) / 10_000) * 10_000 : undefined
  const discountPercent =
    hasDiscount && originalPrice ? Math.round((1 - fee / originalPrice) * 100) : undefined

  return {
    nights: nightCount,
    fee,
    boardPrice,
    originalPrice,
    discountPercent,
  }
}

/** Sums displayed per-night prices over [startDate, endDate) — checkout is excluded. */
export function getStayPriceFromNightlyMap(
  pricesByDate: Record<string, number>,
  startDate: string,
  endDate: string,
) {
  const start = isoDateOnly(startDate)
  const end = isoDateOnly(endDate)
  const nightCount = nightsBetween(start, end)
  if (nightCount === 0) return null

  const nights = Object.entries(pricesByDate).filter(([date]) => isStayNightDate(date, start, end))
  if (nights.length === 0) return null

  return {
    nights: nightCount,
    fee: nights.reduce((sum, [, price]) => sum + price, 0),
  }
}

export interface HotelRating {
  /** 0–10 aggregate guest score (same number the listing card shows). */
  total: number
  totalCount: number
  cleanliness: number
  location: number
  service: number
  staff: number
  valueOfMoney: number
}

export interface HotelDetail {
  /**
   * ⚠️ hotel-show has no `id` field in any sample seen so far (only `slug`) —
   * this is here in case the backend adds one later. Until then, callers that
   * need the numeric hotel id (e.g. the `/hotels/{id}/similar` and
   * `/hotels/{id}/calendars` endpoints) must get it from elsewhere, such as
   * the `hotel_id` query param the listing page now forwards when linking here.
   */
  id?: number
  slug: string
  name: string
  hotelKind: string
  /** Display name / city_slug used in listing URLs (e.g. "تهران"). */
  cityName: string
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

/** Generates ~1 year of nightly rates starting today, so any near-term date range has prices. */
function buildMockCalendar(roomId: number, baseFee: number): HotelRoom['calendar'] {
  const days: HotelRoom['calendar'] = []
  const start = new Date()
  for (let i = 0; i < 365; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const isoDate = toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
    const isWeekend = date.getDay() === 4 || date.getDay() === 5 // پنجشنبه/جمعه
    const variance = 0.85 + seededRandom(`${roomId}-${isoDate}`) * 0.4
    const fee = Math.round(((baseFee * variance * (isWeekend ? 1.25 : 1)) / 10_000)) * 10_000
    days.push({ id: roomId * 1000 + i, date: isoDate, fee, boardPrice: Math.round(fee * 1.15), extraPersonFee: Math.round(fee * 0.3) })
  }
  return days
}

function buildMockRooms(hotel: MockHotel): HotelRoom[] {
  const defs = [
    { roomKind: hotel.roomName, personCount: 2, extraPersonCount: 1, baseFee: hotel.baseFee },
    { roomKind: 'یک تخته برای یک نفر', personCount: 1, extraPersonCount: 0, baseFee: Math.round(hotel.baseFee * 0.65) },
    { roomKind: 'سوئیت خانوادگی برای چهار نفر', personCount: 4, extraPersonCount: 2, baseFee: Math.round(hotel.baseFee * 1.35) },
  ]

  return defs.map((def, index) => {
    const roomId = hotel.id * 10 + index + 1
    return {
      id: roomId,
      roomKind: def.roomKind,
      availableCount: 5,
      personCount: def.personCount,
      extraPersonCount: def.extraPersonCount,
      foodServices: ['صبحانه بوفه'],
      amenities: ['تلویزیون', 'یخچال', 'سرویس بهداشتی فرنگی', 'حوله و دمپایی'],
      calendar: buildMockCalendar(roomId, def.baseFee),
    }
  })
}

function buildMockRating(hotel: MockHotel): HotelRating {
  // Same seed/formula as search mock (`mockHotelScore01` × 10) so card ↔ detail match.
  const total = mockHotelScore10(hotel.slug)
  return {
    total,
    totalCount: mockHotelReviewCount(hotel.slug),
    cleanliness: total,
    location: Math.min(10, Math.round((total + 0.2) * 10) / 10),
    service: Math.max(5, Math.round((total - 0.2) * 10) / 10),
    staff: total,
    valueOfMoney: Math.max(5, Math.round((total - 0.4) * 10) / 10),
  }
}

function buildMockHotel(hotel: MockHotel): HotelDetail {
  const locationSeed = seededRandom(`${hotel.slug}-location`)

  return {
    id: hotel.id,
    slug: hotel.slug,
    name: hotel.name,
    hotelKind: 'هتل',
    cityName: hotel.cityName,
    address: hotel.address,
    location: { lat: 35.7 + locationSeed * 0.2, lng: 51.3 + locationSeed * 0.2 },
    stars: hotel.stars,
    checkIn: '14:00',
    checkOut: '12:00',
    description: `${hotel.name} در ${hotel.cityName} با امکانات رفاهی کامل آماده پذیرایی از مسافران است.`,
    images: Array.from({ length: 6 }, (_, index) => ({
      path: `https://picsum.photos/seed/${hotel.imageSeed}-${index}/1200/800`,
      orderColumn: index,
    })),
    amenities: ['اینترنت بی‌سیم رایگان', 'استخر', 'پارکینگ', 'رستوران', 'باشگاه بدن‌سازی', 'اتاق کنفرانس'].map((name) => ({ name })),
    generalRules: [
      { id: 1, title: 'ورود و خروج', content: 'ساعت ورود از ۱۴:۰۰ و خروج تا ۱۲:۰۰ ظهر است.' },
      { id: 2, title: 'مدارک شناسایی', content: 'همراه داشتن کارت ملی یا شناسنامه برای تمام مسافران الزامی است.' },
    ],
    cancellationRules: [
      { id: 1, title: 'کنسلی رایگان', content: 'تا ۴۸ ساعت قبل از ورود، کنسلی بدون جریمه امکان‌پذیر است.' },
      { id: 2, title: 'کنسلی دیرهنگام', content: 'کنسلی کمتر از ۴۸ ساعت مانده به ورود، مشمول جریمه یک شب اقامت می‌شود.' },
    ],
    rooms: buildMockRooms(hotel),
    rating: buildMockRating(hotel),
  }
}

/**
 * GET /api/v1/hotel-show/{hotel:slug} — see docs/hotel-detail-plan.md.
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — no backend from the hotel-detail stage
 * onward yet. `fetchHotelDetailFromApi` below has the real implementation, kept
 * live (type-checked, unused) so swapping back is a one-line rename.
 */
export async function fetchHotelDetail(params: HotelDetailParams, signal?: AbortSignal): Promise<HotelDetail> {
  void signal
  await new Promise((resolve) => setTimeout(resolve, 300))
  const hotel = findMockHotelBySlug(params.slug)
  if (!hotel) {
    throw new Error(`fetchHotelDetail: unknown hotel slug "${params.slug}"`)
  }
  return buildMockHotel(hotel)
}

/** Real implementation of `fetchHotelDetail`, unused while the hotel-detail flow is mocked. */
export async function fetchHotelDetailFromApi(params: HotelDetailParams, signal?: AbortSignal): Promise<HotelDetail> {
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
    id: data.id,
    slug: data.slug,
    name: data.name,
    hotelKind: data.hotel_kind,
    cityName: data.city_name ?? data.city_slug ?? data.city ?? 'تهران',
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
