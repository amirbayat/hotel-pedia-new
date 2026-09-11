import { useQuery } from '@tanstack/react-query'
import { fetchHotelDetail } from '../api/hotelDetail'
import type { HotelDetail, HotelDetailParams } from '../api/hotelDetail'

export function useHotelDetail(params: HotelDetailParams) {
  return useQuery({
    queryKey: ['hotel-detail', params],
    queryFn: ({ signal }) => fetchHotelDetail(params, signal),
    enabled: Boolean(params.slug),
    placeholderData: (previousData, previousQuery) => {
      const previousParams = previousQuery?.queryKey[1] as HotelDetailParams | undefined
      if (previousParams?.slug === params.slug) return previousData as HotelDetail | undefined
      return undefined
    },
  })
}
