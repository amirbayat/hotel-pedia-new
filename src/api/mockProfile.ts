export type Gender = 'male' | 'female'

export interface ProfileAccount {
  email: string
  phone: string
  phoneVerified: boolean
  firstName: string
  lastName: string
  nationalId: string
  gender: Gender
  cardNumber: string
  accountNumber: string
  sheba: string
}

export type ReservationStatus = 'awaitingPayment' | 'paid' | 'expired' | 'refunded'

export interface Reservation {
  id: string
  orderNumber: string
  hotelName: string
  /** Gregorian ISO date, displayed as Jalali. */
  checkIn: string
  roomCount: number
  status: ReservationStatus
}

export type TransactionType = 'deposit' | 'withdraw'

export interface WalletTransaction {
  id: string
  /** Gregorian ISO date. */
  date: string
  time: string
  type: TransactionType
  amount: number
  description: string
}

export const GENDER_LABEL: Record<Gender, string> = {
  male: 'مرد',
  female: 'زن',
}

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  awaitingPayment: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  expired: 'منقضی شده',
  refunded: 'استرداد شده',
}

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  deposit: 'واریز',
  withdraw: 'برداشت',
}

/** 1405/04/10 — the date printed on every mock reservation and transaction. */
const MOCK_DAY = '2026-07-01'

export const MOCK_PROFILE: ProfileAccount = {
  email: 'nimarashtian@gmail.com',
  phone: '09122116415',
  phoneVerified: true,
  firstName: 'نیما',
  lastName: 'رشتیان',
  nationalId: '0077634222',
  gender: 'male',
  cardNumber: '6219861043218765',
  accountNumber: '87655443323146',
  sheba: '746538502634528',
}

const RESERVATION_STATUSES: ReservationStatus[] = [
  'awaitingPayment',
  'paid',
  'paid',
  'paid',
  'expired',
  'expired',
  'refunded',
  'refunded',
  'expired',
  'expired',
]

export const MOCK_RESERVATIONS: Reservation[] = RESERVATION_STATUSES.map((status, index) => ({
  id: `reservation-${index + 1}`,
  orderNumber: 'ASDRTGFY765',
  hotelName: 'هتل اسپیناس پالاس',
  checkIn: MOCK_DAY,
  roomCount: 2,
  status,
}))

export const MOCK_WALLET_BALANCE = 91_000_000

export const MOCK_TRANSACTIONS: WalletTransaction[] = Array.from({ length: 9 }, (_, index) => ({
  id: `txn-${index + 1}`,
  date: MOCK_DAY,
  time: '24:04:21',
  type: 'deposit' as const,
  amount: 1_000_000,
  description: 'اصلاح مانده حساب',
}))

export function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1  ').trim()
}

export function digitsOnly(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, '')
  return maxLength ? digits.slice(0, maxLength) : digits
}
