import cityIsfahan from '../assets/cities/isfahan.jpg'
import cityKish from '../assets/cities/kish.jpg'
import cityMashhad from '../assets/cities/mashhad.jpg'
import cityShiraz from '../assets/cities/shiraz.jpg'
import cityTabriz from '../assets/cities/tabriz.jpg'
import cityTehran from '../assets/cities/tehran.jpg'
import promoEspinas from '../assets/promo/espinas.jpg'
import promoKish from '../assets/promo/kish.jpg'
import promoMashhad from '../assets/promo/mashhad.jpg'

/** Snapptrip top-city photos used by the homepage popular-cities grid. */
export const MOCK_CITY_IMAGES: Record<string, string> = {
  تهران: cityTehran,
  مشهد: cityMashhad,
  شیراز: cityShiraz,
  اصفهان: cityIsfahan,
  کیش: cityKish,
  تبریز: cityTabriz,
}

/** Snapptrip homepage banners used by the promo carousel. */
export const MOCK_PROMO_IMAGES = {
  espinas: promoEspinas,
  mashhad: promoMashhad,
  kish: promoKish,
}
