/**
 * Shared mock city/hotel dataset for the home, destination-search, and
 * hotel-search endpoints (docs/hotel-mock-flow-plan.md) — one source so a
 * city/hotel picked in one mocked endpoint (e.g. the autocomplete field)
 * matches what another mocked endpoint (e.g. hotel-search) returns for it.
 */

export interface MockCity {
  name: string
  province: string
}

export const MOCK_CITIES: MockCity[] = [
  { name: 'تهران', province: 'استان تهران' },
  { name: 'مشهد', province: 'استان خراسان رضوی' },
  { name: 'شیراز', province: 'استان فارس' },
  { name: 'اصفهان', province: 'استان اصفهان' },
  { name: 'کیش', province: 'استان هرمزگان' },
  { name: 'تبریز', province: 'استان آذربایجان شرقی' },
]

export interface MockHotel {
  id: number
  name: string
  slug: string
  cityName: string
  stars: number
  address: string
  imageSeed: string
  roomName: string
  /** Room-only nightly base price — callers add their own variance/board markup on top. */
  baseFee: number
  tags: string[]
  isPinned: boolean
}

const HOTEL_TEMPLATES = [
  { suffixFa: 'پالاس', suffixSlug: 'palace', stars: 5, baseFee: 5_200_000, roomName: 'دو تخته دلوکس', tags: ['لوکس', 'بهترین منطقه', 'پیشنهاد ویژه'] },
  { suffixFa: 'پارسیان', suffixSlug: 'parsian', stars: 5, baseFee: 4_600_000, roomName: 'دو تخته سوپریور', tags: ['لوکس', 'استخر و سونا'] },
  { suffixFa: 'لاله', suffixSlug: 'laleh', stars: 4, baseFee: 3_100_000, roomName: 'دو تخته استاندارد', tags: ['صبحانه رایگان'] },
  { suffixFa: 'هما', suffixSlug: 'homa', stars: 4, baseFee: 2_800_000, roomName: 'دو تخته استاندارد', tags: ['پارکینگ رایگان'] },
  { suffixFa: 'ارم', suffixSlug: 'arm', stars: 3, baseFee: 1_700_000, roomName: 'یک تخته اقتصادی', tags: ['قیمت مناسب'] },
  { suffixFa: 'جهانگردی', suffixSlug: 'jahangardi', stars: 3, baseFee: 1_450_000, roomName: 'یک تخته اقتصادی', tags: [] as string[] },
] as const

const CITY_SLUGS: Record<string, string> = {
  تهران: 'tehran',
  مشهد: 'mashhad',
  شیراز: 'shiraz',
  اصفهان: 'isfahan',
  کیش: 'kish',
  تبریز: 'tabriz',
}

function buildCityHotels(city: MockCity, cityIndex: number): MockHotel[] {
  const citySlug = CITY_SLUGS[city.name] ?? `city-${cityIndex}`

  return HOTEL_TEMPLATES.map((template, templateIndex) => ({
    id: cityIndex * 100 + templateIndex + 1,
    name: `هتل ${template.suffixFa} ${city.name}`,
    slug: `${template.suffixSlug}-${citySlug}`,
    cityName: city.name,
    stars: template.stars,
    address: `${city.name}، خیابان ${templateIndex % 2 === 0 ? 'ولیعصر' : 'آزادی'}، پلاک ${(templateIndex + 1) * 12}`,
    imageSeed: `hotelpedia-${citySlug}-${templateIndex}`,
    roomName: template.roomName,
    baseFee: template.baseFee,
    tags: [...template.tags],
    isPinned: templateIndex === 0,
  }))
}

export const MOCK_HOTELS: MockHotel[] = MOCK_CITIES.flatMap(buildCityHotels)

export function hotelsForCity(cityName: string): MockHotel[] {
  return MOCK_HOTELS.filter((hotel) => hotel.cityName === cityName)
}

/** Deterministic pseudo-random in [0, 1) — same (seed) always yields the same value, unlike Math.random(). */
export function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return (hash >>> 0) / 0xffffffff
}
