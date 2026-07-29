export interface Destination {
  id: string | number
  name: string
  country: string
}

// TODO: replace with the real endpoint once it's provided.
const SEARCH_DESTINATIONS_URL = '/api/destinations/search'

export async function searchDestinations(query: string, signal?: AbortSignal): Promise<Destination[]> {
  const url = `${SEARCH_DESTINATIONS_URL}?q=${encodeURIComponent(query)}`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`searchDestinations failed with status ${response.status}`)
  }

  return response.json()
}
