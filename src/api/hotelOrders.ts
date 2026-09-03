const PANEL_BASE_URL = 'https://panel.hotelpedia.ir'

export type BankGateway = 'zarinpal' | 'behpardakht'

export interface OrderPassenger {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

export interface OrderReservedBy {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
}

export interface OrderRoomPassengers {
  roomId: number
  roomCount: number
  passengers?: OrderPassenger[]
}

function toApiPassenger(passenger: OrderPassenger) {
  return {
    first_name: passenger.firstName,
    last_name: passenger.lastName,
    email: passenger.email,
    phone: passenger.phone,
  }
}

function toApiRoomPassengers(rooms: OrderRoomPassengers[]) {
  return rooms.map((room) => ({
    room_id: room.roomId,
    room_count: room.roomCount,
    passengers: room.passengers?.map(toApiPassenger),
  }))
}

function toApiReservedBy(reservedBy: OrderReservedBy) {
  return {
    first_name: reservedBy.firstName,
    last_name: reservedBy.lastName,
    phone: reservedBy.phone,
    email: reservedBy.email,
  }
}

async function postOrderRequest(path: string, body: unknown, signal?: AbortSignal) {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/${path}`, {
    method: 'POST',
    // Both order endpoints require auth — the session cookie set on
    // panel.hotelpedia.ir by the OTP-login flow (see src/api/auth.ts) is what
    // needs to ride along; `credentials: 'include'` is what makes the browser
    // attach it to this cross-origin request. Unverified against a real
    // logged-in session — see docs/hotel-booking-plan.md §8.3.
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message ?? `Request to ${path} failed with status ${response.status}`)
  }
  return data
}

export interface InitHotelOrderParams {
  isWalletActive?: boolean
  bankGateway?: BankGateway
  startDate: string
  endDate: string
  reservedBy?: OrderReservedBy
  roomPassengers: OrderRoomPassengers[]
}

/**
 * POST /api/v1/hotel-orders — creates a draft order, called right when "رزرو اتاق" is clicked.
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — no auth/backend available yet. See
 * `initHotelOrderFromApi` for the real implementation, kept live (type-checked,
 * unused) to swap back in later.
 */
export async function initHotelOrder(params: InitHotelOrderParams, signal?: AbortSignal): Promise<{ orderId: number }> {
  void params
  void signal
  await new Promise((resolve) => setTimeout(resolve, 200))
  return { orderId: Math.floor(100_000_000 + Math.random() * 900_000_000) }
}

/** Real implementation of `initHotelOrder`, unused while the hotel-orders flow is mocked. */
export async function initHotelOrderFromApi(params: InitHotelOrderParams, signal?: AbortSignal): Promise<{ orderId: number }> {
  const data = await postOrderRequest(
    'hotel-orders',
    {
      is_wallet_active: params.isWalletActive,
      bank_gateway: params.bankGateway,
      start_date: params.startDate,
      end_date: params.endDate,
      reserved_by: params.reservedBy ? toApiReservedBy(params.reservedBy) : undefined,
      room_passengers: toApiRoomPassengers(params.roomPassengers),
    },
    signal,
  )
  return { orderId: data.data.order_id }
}

export interface PayHotelOrderParams {
  orderId: number
  isWalletActive?: boolean
  bankGateway?: BankGateway
  startDate: string
  endDate: string
  /** first_name/last_name/phone are required by the API; email stays optional. */
  reservedBy: Required<Pick<OrderReservedBy, 'firstName' | 'lastName' | 'phone'>> & Pick<OrderReservedBy, 'email'>
  roomPassengers: OrderRoomPassengers[]
  /**
   * Only used by the mocked `payHotelOrder` to build the internal mock-gateway
   * URL (docs/hotel-mock-flow-plan.md) — the real API has no use for these,
   * since it computes the amount itself and doesn't redirect within our SPA.
   */
  slug: string
  amountDue: number
}

export interface PayHotelOrderResult {
  orderId: number
  /** URL of the bank gateway's payment page. */
  payAction: string
  /** HTTP method to use when submitting the redirect form (usually "post"). */
  method: string
  /** Hidden form fields to submit alongside the redirect (e.g. `refId`). */
  inputs: Record<string, string>
}

/**
 * POST /api/v1/hotel-orders/pay — finalizes the order and returns a bank-redirect form spec.
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — there's no real bank to redirect to
 * yet, so this points at our own `/payment/gateway` sandbox page instead. See
 * `payHotelOrderFromApi` for the real implementation, kept live (type-checked,
 * unused) to swap back in later.
 */
export async function payHotelOrder(params: PayHotelOrderParams, signal?: AbortSignal): Promise<PayHotelOrderResult> {
  void signal
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    orderId: params.orderId,
    payAction: '/payment/gateway',
    method: 'get',
    inputs: {
      order_id: String(params.orderId),
      amount: String(params.amountDue),
      return_url: `/hotels/${params.slug}/book/result`,
    },
  }
}

/** Real implementation of `payHotelOrder`, unused while the hotel-orders flow is mocked. */
export async function payHotelOrderFromApi(params: PayHotelOrderParams, signal?: AbortSignal): Promise<PayHotelOrderResult> {
  const data = await postOrderRequest(
    'hotel-orders/pay',
    {
      order_id: params.orderId,
      is_wallet_active: params.isWalletActive,
      bank_gateway: params.bankGateway,
      start_date: params.startDate,
      end_date: params.endDate,
      reserved_by: toApiReservedBy(params.reservedBy),
      room_passengers: toApiRoomPassengers(params.roomPassengers),
    },
    signal,
  )

  return {
    orderId: data.data.order_id,
    payAction: data.data.pay_action,
    method: data.data.method,
    inputs: data.data.inputs ?? {},
  }
}

/**
 * Auto-submits a hidden form to the bank gateway — same technique as
 * `submitPanelLoginForm` in src/api/auth.ts, but navigates the whole page
 * (not a hidden iframe) since this is meant to leave the site.
 */
export function redirectToPaymentGateway(result: PayHotelOrderResult) {
  const form = document.createElement('form')
  form.method = result.method || 'post'
  form.action = result.payAction

  for (const [key, value] of Object.entries(result.inputs)) {
    const field = document.createElement('input')
    field.type = 'hidden'
    field.name = key
    field.value = value
    form.appendChild(field)
  }

  document.body.appendChild(form)
  form.submit()
}
