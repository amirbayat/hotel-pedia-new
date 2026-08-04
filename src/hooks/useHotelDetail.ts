import { useQuery } from '@tanstack/react-query'
import { fetchHotelDetail } from '../api/hotelDetail'
import type { HotelDetailParams } from '../api/hotelDetail'

export function useHotelDetail(params: HotelDetailParams) {
  return useQuery({
    queryKey: ['hotel-detail', params],
    queryFn: ({ signal }) => fetchHotelDetail(params, signal),
    enabled: Boolean(params.slug),
  })
}
