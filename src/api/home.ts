const PANEL_BASE_URL = 'https://panel.hotelpedia.ir'

export interface PopularCity {
  name: string
  province: string
  imageSrc: string
}

export interface HomeFaq {
  id: number
  question: string
  answer: string
}

export interface HomeSeoText {
  id: number
  title: string
  description: string
}

export interface HomeData {
  popularCities: PopularCity[]
  faqs: HomeFaq[]
  seoTexts: HomeSeoText[]
}

/** GET /api/v1/home — popular cities, FAQ accordion items, and SEO copy for the advantage boxes. */
export async function fetchHome(signal?: AbortSignal): Promise<HomeData> {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/home`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`fetchHome failed with status ${response.status}`)
  }

  const body = await response.json()

  return {
    popularCities: (body.data.popular_cities as any[]).map((item) => ({
      name: item.city.name,
      province: item.city.province,
      imageSrc: item.image.path,
    })),
    faqs: (body.data.faqs as any[]).map((item, index) => ({
      id: item.order_column ?? index + 1,
      question: item.title,
      answer: item.content,
    })),
    seoTexts: (body.data.seo_texts as any[]).map((item, index) => ({
      id: index + 1,
      title: item.title,
      description: item.content,
    })),
  }
}

export interface CarouselSlide {
  id: number
  imageUrl: string
  link: string
}

export async function fetchCarousel(signal?: AbortSignal): Promise<CarouselSlide[]> {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/home/carousel`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`fetchCarousel failed with status ${response.status}`)
  }

  const body = await response.json()

  return body.data.carousel as CarouselSlide[]
}

export interface CityHotel {
  id: number
  name: string
  imageUrl: string
  stars: number
  tags: string[]
  address: string
  price: number
  discountPrice: number
  detailsUrl: string
}

export interface CityHotels {
  id: number
  city: string
  hotels: CityHotel[]
}

export async function fetchCitiesHotels(signal?: AbortSignal): Promise<CityHotels[]> {
  const response = await fetch(`${PANEL_BASE_URL}/api/v1/home/cities/hotels`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`fetchCitiesHotels failed with status ${response.status}`)
  }

  const body = await response.json()

  return body.data.cities as CityHotels[]
}
