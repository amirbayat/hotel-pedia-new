import { useQuery } from '@tanstack/react-query'
import { fetchHotelCalendars } from '../api/hotelCalendars'
import type { HotelCalendarsParams } from '../api/hotelCalendars'

export function useHotelCalendars(params: HotelCalendarsParams | undefined) {
  return useQuery({
    queryKey: ['hotel-calendars', params],
    queryFn: ({ signal }) => fetchHotelCalendars(params as HotelCalendarsParams, signal),
    enabled: Boolean(params),
  })
}
