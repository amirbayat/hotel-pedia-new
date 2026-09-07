import { MOCK_CITIES, hotelsForCity, seededRandom } from './mockCityData'

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

const MOCK_HOME_FAQS: HomeFaq[] = [
  {
    id: 1,
    question: 'چطور می‌توانم هتل مورد نظرم را رزرو کنم؟',
    answer: 'کافی است مقصد و تاریخ اقامت را وارد کنید و از بین هتل‌های نمایش داده‌شده، هتل و اتاق دلخواه‌تان را انتخاب و رزرو را نهایی کنید.',
  },
  {
    id: 2,
    question: 'آیا امکان کنسل کردن رزرو وجود دارد؟',
    answer: 'بله، بسته به قوانین کنسلی هر هتل که پیش از پرداخت نمایش داده می‌شود، امکان کنسلی رایگان یا با جریمه وجود دارد.',
  },
  {
    id: 3,
    question: 'قیمت‌های نمایش داده‌شده شامل صبحانه است؟',
    answer: 'قیمت پایه شامل اتاق است؛ در صورت داشتن سرویس صبحانه، قیمت به‌همراه صبحانه هم به‌صورت جداگانه نمایش داده می‌شود.',
  },
  {
    id: 4,
    question: 'برای رزرو نیاز به ثبت‌نام دارم؟',
    answer: 'برای مشاهده هتل‌ها نیازی به ثبت‌نام نیست، اما برای نهایی‌کردن رزرو باید با شماره موبایل خود وارد شوید.',
  },
]

const MOCK_HOME_SEO_TEXTS: HomeSeoText[] = [
  {
    id: 1,
    title: 'رزرو آنلاین هتل با بهترین قیمت',
    description: 'با مقایسه قیمت و امکانات هتل‌های سراسر کشور، اقامتگاه مناسب سفر خود را در چند دقیقه رزرو کنید.',
  },
  {
    id: 2,
    title: 'بهترین هتل‌های ایران برای سفرهای خانوادگی',
    description: 'هتل‌هایی با اتاق‌های خانوادگی و امکانات رفاهی مناسب کودکان، برای اقامتی آسوده در کنار خانواده.',
  },
  {
    id: 3,
    title: 'راهنمای انتخاب هتل مناسب برای سفر کاری',
    description: 'دسترسی به مراکز تجاری، اینترنت پرسرعت و سالن کنفرانس؛ فیلترهایی که سفر کاری شما را ساده‌تر می‌کنند.',
  },
]

/**
 * GET /api/v1/home — popular cities, FAQ accordion items, and SEO copy for the advantage boxes.
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — see `fetchHomeFromApi` for the real
 * implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function fetchHome(signal?: AbortSignal): Promise<HomeData> {
  void signal
  await new Promise((resolve) => setTimeout(resolve, 200))

  return {
    popularCities: MOCK_CITIES.map((city, index) => ({
      name: city.name,
      province: city.province,
      imageSrc: `https://picsum.photos/seed/hotelpedia-city-${index}/600/800`,
    })),
    faqs: MOCK_HOME_FAQS,
    seoTexts: MOCK_HOME_SEO_TEXTS,
  }
}

/** Real implementation of `fetchHome`, unused while the home page is mocked. */
export async function fetchHomeFromApi(signal?: AbortSignal): Promise<HomeData> {
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

// Mix of city listing + hotel detail links so carousel clicks exercise both routes.
const MOCK_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/seed/hotelpedia-promo-0/1200/400',
    link: `/hotels?city=${encodeURIComponent(MOCK_CITIES[0].name)}`,
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/seed/hotelpedia-promo-1/1200/400',
    link: `/hotels/${hotelsForCity(MOCK_CITIES[0].name)[0].slug}`,
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/seed/hotelpedia-promo-2/1200/400',
    link: `/hotels?city=${encodeURIComponent(MOCK_CITIES[1].name)}`,
  },
  {
    id: 4,
    imageUrl: 'https://picsum.photos/seed/hotelpedia-promo-3/1200/400',
    link: `/hotels/${hotelsForCity(MOCK_CITIES[1].name)[0].slug}`,
  },
]

/**
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — see `fetchCarouselFromApi` for the
 * real implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function fetchCarousel(signal?: AbortSignal): Promise<CarouselSlide[]> {
  void signal
  await new Promise((resolve) => setTimeout(resolve, 200))
  return MOCK_CAROUSEL_SLIDES
}

/** Real implementation of `fetchCarousel`, unused while the home page is mocked. */
export async function fetchCarouselFromApi(signal?: AbortSignal): Promise<CarouselSlide[]> {
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

/**
 * GET /api/v1/home/cities/hotels
 *
 * ⚠️ Mocked (docs/hotel-mock-flow-plan.md) — see `fetchCitiesHotelsFromApi` for
 * the real implementation, kept live (type-checked, unused) to swap back in later.
 */
export async function fetchCitiesHotels(signal?: AbortSignal): Promise<CityHotels[]> {
  void signal
  await new Promise((resolve) => setTimeout(resolve, 200))

  return MOCK_CITIES.map((city, cityIndex) => ({
    id: cityIndex + 1,
    city: city.name,
    hotels: hotelsForCity(city.name).map((hotel) => {
      const variance = 0.9 + seededRandom(`${hotel.slug}-home-price`) * 0.3
      const price = Math.round((hotel.baseFee * variance) / 10_000) * 10_000
      const hasDiscount = seededRandom(`${hotel.slug}-home-discount`) > 0.5
      const discountPrice = hasDiscount ? Math.round((price * 1.2) / 10_000) * 10_000 : price

      return {
        id: hotel.id,
        name: hotel.name,
        imageUrl: `https://picsum.photos/seed/${hotel.imageSeed}/600/400`,
        stars: hotel.stars,
        tags: hotel.tags,
        address: hotel.address,
        price,
        discountPrice,
        detailsUrl: `/hotels/${hotel.slug}`,
      }
    }),
  }))
}

/** Real implementation of `fetchCitiesHotels`, unused while the home page is mocked. */
export async function fetchCitiesHotelsFromApi(signal?: AbortSignal): Promise<CityHotels[]> {
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
