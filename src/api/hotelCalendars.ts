import { toIsoDate } from '../lib/date/jalali'

const PANEL_BASE_URL = 'https://panel.hotelpedia.ir'

export interface HotelCalendarDay {
  id: number
  hotelId: number
  roomId: number
  /** Gregorian ISO date ("YYYY-MM-DD"). */
  date: string
  remainedCount: number
  lockedCount: number
  buyPrice: number
  sellPrice: number
  boardPrice: number
  fee: number
}

export interface HotelCalendarsParams {
  hotelId: number
  /** Gregorian ISO date ("YYYY-MM-DD"). */
  startDate: string
  /** Gregorian ISO date ("YYYY-MM-DD"). */
  endDate: string
  /** When set, prices come back with the wallet's discount applied. */
  walletId?: number
}

/** Deterministic pseudo-random in [0, 1) — same (seed) always yields the same value, unlike Math.random(). */
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return (hash >>> 0) / 0xffffffff
}

/** Mirrors `buildMockRooms` in hotelDetail.ts: room ids are `hotelId * 10 + 1..3`. */
const MOCK_ROOM_DEFS = [
  { offset: 1, baseFee: 3_200_000 },
  { offset: 2, baseFee: 2_100_000 },
  { offset: 3, baseFee: 5_400_000 },
]

function buildMockCalendarDays(params: HotelCalendarsParams): HotelCalendarDay[] {
  const days: HotelCalendarDay[] = []
  const [sy, sm, sd] = params.startDate.split('-').map(Number)
  const [ey, em, ed] = params.endDate.split('-').map(Number)
  const end = new Date(ey, em - 1, ed)

  for (const def of MOCK_ROOM_DEFS) {
    const roomId = params.hotelId * 10 + def.offset
    const cursor = new Date(sy, sm - 1, sd)
    let dayIndex = 0
    while (cursor <= end) {
      const isoDate = toIsoDate(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate())
      const isWeekend = cursor.getDay() === 4 || cursor.getDay() === 5 // پنجشنبه/جمعه
      const variance = 0.85 + seededRandom(`${roomId}-${isoDate}`) * 0.4
      const fee = Math.round(((def.baseFee * variance * (isWeekend ? 1.25 : 1)) / 10_000)) * 10_000
      const remainedCount = seededRandom(`${roomId}-remain-${isoDate}`) > 0.15 ? Math.ceil(seededRandom(`${roomId}-count-${isoDate}`) * 5) : 0

      days.push({
        id: roomId * 10_000 + dayIndex,
        hotelId: params.hotelId,
        roomId,
        date: isoDate,
        remainedCount,
        lockedCount: 0,
        buyPrice: Math.round(fee * 0.8),
        sellPrice: fee,
        boardPrice: Math.round(fee * 1.15),
        fee,
      })

      cursor.setDate(cursor.getDate() + 1)
      dayIndex++
    }
  }

  return days
}

/**
 * GET /api/v1/hotels/{hotel_id}/calendars — per-day rates for every room of the
 * hotel across the requested range; filter the result by `roomId` for a single
 * room's calendar.
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — see `fetchHotelCalendarsFromApi` for
 * the real implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function fetchHotelCalendars(params: HotelCalendarsParams, signal?: AbortSignal): Promise<HotelCalendarDay[]> {
  void signal
  await new Promise((resolve) => setTimeout(resolve, 200))
  return buildMockCalendarDays(params)
}

/** Real implementation of `fetchHotelCalendars`, unused while the hotel-detail flow is mocked. */
export async function fetchHotelCalendarsFromApi(
  params: HotelCalendarsParams,
  signal?: AbortSignal,
): Promise<HotelCalendarDay[]> {
  const query = new URLSearchParams({ start_date: params.startDate, end_date: params.endDate })
  if (params.walletId) query.set('wallet_id', String(params.walletId))

  const response = await fetch(`${PANEL_BASE_URL}/api/v1/hotels/${params.hotelId}/calendars?${query}`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`fetchHotelCalendars failed with status ${response.status}`)
  }

  const body = (await response.json()) as any[]

  return body.map((day) => ({
    id: day.id,
    hotelId: day.hotel_id,
    roomId: day.room_id,
    date: day.date,
    remainedCount: day.remained_count,
    lockedCount: day.locked_count,
    buyPrice: day.buy_price,
    sellPrice: day.sell_price,
    boardPrice: day.board_price,
    fee: day.fee,
  }))
}
