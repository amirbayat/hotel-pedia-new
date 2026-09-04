import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { searchHotels } from '../api/hotelSearch'
import type { HotelSearchParams } from '../api/hotelSearch'

type InfiniteHotelSearchParams = Omit<HotelSearchParams, 'page'>

/**
 * Hotel-search list query with infinite scroll — each page appends to the list.
 */
export function useInfiniteHotelSearch(params: InfiniteHotelSearchParams) {
  return useInfiniteQuery({
    queryKey: ['hotel-search', params],
    queryFn: ({ pageParam, signal }) =>
      searchHotels({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
  })
}
