import { useQuery } from '@tanstack/react-query'
import { fetchSimilarHotels } from '../api/hotelSimilar'

export function useSimilarHotels(hotelId: number | undefined) {
  return useQuery({
    queryKey: ['hotel-similar', hotelId],
    queryFn: ({ signal }) => fetchSimilarHotels(hotelId as number, signal),
    enabled: Boolean(hotelId),
  })
}
