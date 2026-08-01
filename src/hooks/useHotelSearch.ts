import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchHotels } from '../api/hotelSearch'
import type { HotelSearchParams } from '../api/hotelSearch'

/**
 * Hotel-search list query. `placeholderData: keepPreviousData` keeps the
 * previous page's hotels on screen (instead of flashing empty) while a new
 * page/sort request is in flight — pair with `isFetching` for a loading overlay.
 */
export function useHotelSearch(params: HotelSearchParams) {
  return useQuery({
    queryKey: ['hotel-search', params],
    queryFn: ({ signal }) => searchHotels(params, signal),
    placeholderData: keepPreviousData,
  })
}
