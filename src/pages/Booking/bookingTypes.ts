/**
 * Shared shape passed via `navigate(path, { state })` between the three
 * booking-flow pages (BookingPassengers → BookingConfirmPay → BookingResult).
 * Scoped to a single room *kind* + count — there's no multi-room-type "cart"
 * anywhere in the current UI (see docs/hotel-booking-plan.md §8).
 */

export interface BookingPassenger {
  firstName: string
  lastName: string
  phone: string
}

export interface BookingReservedBy {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface BookingRoomInfo {
  roomId: number
  roomKind: string
  roomCount: number
  nights: number
  /** Room-only total for the whole stay, per room. */
  feePerRoom: number
  /** With-board total for the whole stay, per room (equals feePerRoom when there's no board). */
  boardPricePerRoom: number
}

export interface BookingHotelInfo {
  slug: string
  name: string
  stars: number
  imageUrl?: string
}

export interface BookingLocationState {
  hotel: BookingHotelInfo
  room: BookingRoomInfo
  startDate: string
  endDate: string
  orderId: number
  reservedBy?: BookingReservedBy
  passengers?: BookingPassenger[]
}
