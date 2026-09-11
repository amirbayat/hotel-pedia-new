import espinas1 from '../assets/hotels/espinas/1.jpg'
import espinas2 from '../assets/hotels/espinas/2.jpg'
import espinas3 from '../assets/hotels/espinas/3.jpg'
import espinas4 from '../assets/hotels/espinas/4.jpg'
import espinas5 from '../assets/hotels/espinas/5.jpg'
import esteghlal1 from '../assets/hotels/esteghlal/1.jpg'
import esteghlal2 from '../assets/hotels/esteghlal/2.jpg'
import esteghlal3 from '../assets/hotels/esteghlal/3.jpg'
import esteghlal4 from '../assets/hotels/esteghlal/4.jpg'
import esteghlal5 from '../assets/hotels/esteghlal/5.jpg'
import homa1 from '../assets/hotels/homa/1.jpg'
import homa2 from '../assets/hotels/homa/2.jpg'
import homa3 from '../assets/hotels/homa/3.jpg'
import homa4 from '../assets/hotels/homa/4.jpg'
import homa5 from '../assets/hotels/homa/5.jpg'
import laleh1 from '../assets/hotels/laleh/1.jpg'
import laleh2 from '../assets/hotels/laleh/2.jpg'
import laleh3 from '../assets/hotels/laleh/3.jpg'
import laleh4 from '../assets/hotels/laleh/4.jpg'
import laleh5 from '../assets/hotels/laleh/5.jpg'
import olympic1 from '../assets/hotels/olympic/1.jpg'
import olympic2 from '../assets/hotels/olympic/2.jpg'
import olympic3 from '../assets/hotels/olympic/3.jpg'
import olympic4 from '../assets/hotels/olympic/4.jpg'
import olympic5 from '../assets/hotels/olympic/5.jpg'
import { seededRandom } from './mockCityData'

const GALLERIES = {
  espinas: [espinas1, espinas2, espinas3, espinas4, espinas5],
  esteghlal: [esteghlal1, esteghlal2, esteghlal3, esteghlal4, esteghlal5],
  laleh: [laleh1, laleh2, laleh3, laleh4, laleh5],
  homa: [homa1, homa2, homa3, homa4, homa5],
  olympic: [olympic1, olympic2, olympic3, olympic4, olympic5],
} as const

type GalleryKey = keyof typeof GALLERIES

/** Aligns mock templates (palace, parsian, laleh, homa, arm, jahangardi) to Snaptrip galleries. */
const GALLERY_BY_TEMPLATE: GalleryKey[] = ['espinas', 'esteghlal', 'laleh', 'homa', 'olympic', 'olympic']

function galleryKeyForSeed(seed: string): GalleryKey {
  const match = seed.match(/-(\d+)$/)
  if (match) {
    const templateIndex = Number(match[1])
    if (templateIndex >= 0 && templateIndex < GALLERY_BY_TEMPLATE.length) {
      return GALLERY_BY_TEMPLATE[templateIndex]
    }
  }

  const keys = Object.keys(GALLERIES) as GalleryKey[]
  return keys[Math.floor(seededRandom(`${seed}-hotel`) * keys.length)]
}

/** Five Snaptrip photos for the mock hotel identified by `seed`. */
export function mockHotelGallery(seed: string): string[] {
  return [...GALLERIES[galleryKeyForSeed(seed)]]
}

/** Cover photo (first gallery image) for cards and similar-hotel thumbnails. */
export function mockHotelImageUrl(seed: string, variant = 0): string {
  const gallery = mockHotelGallery(seed)
  return gallery[variant % gallery.length]
}
