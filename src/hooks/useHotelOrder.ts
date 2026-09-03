import { useMutation } from '@tanstack/react-query'
import { initHotelOrder, payHotelOrder } from '../api/hotelOrders'

export function useInitHotelOrder() {
  return useMutation({ mutationFn: (params: Parameters<typeof initHotelOrder>[0]) => initHotelOrder(params) })
}

export function usePayHotelOrder() {
  return useMutation({ mutationFn: (params: Parameters<typeof payHotelOrder>[0]) => payHotelOrder(params) })
}
