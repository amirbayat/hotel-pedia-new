import type { IconComponent } from '../components/icons/types'
import {
  IconAcUnit,
  IconAir,
  IconAndroidWifi3Bar,
  IconAtm,
  IconBeerMeal,
  IconChair,
  IconElevator,
  IconEncrypted,
  IconFitnessCenter,
  IconForkSpoon,
  IconHotel,
  IconKitchen,
  IconLocalCafe,
  IconLocalLaundryService,
  IconLocalParking,
  IconLocalTaxi,
  IconMosque,
  IconPeople,
  IconPool,
  IconShower,
  IconToiletIranian,
  IconToiletWestern,
  IconTvGen,
} from '../components/icons'

/**
 * Amenity names come from the hotel-show API as free text (see docs/hotel-detail-plan.md),
 * not a fixed enum, so this is a best-effort keyword match rather than an exact lookup.
 * Longer/more specific phrases are listed before shorter ones that could also match
 * (e.g. "کافی نت" before "کافی شاپ" — both contain "کافی").
 */
const AMENITY_ICON_RULES: Array<{ keywords: string[]; icon: IconComponent }> = [
  { keywords: ['اینترنت در قسمت پذیرش', 'اینترنت در لابی', 'وایفای', 'بی‌سیم', 'بی سیم', 'اینترنت'], icon: IconAndroidWifi3Bar },
  { keywords: ['پارکینگ'], icon: IconLocalParking },
  { keywords: ['آسانسور', 'اسانسور'], icon: IconElevator },
  { keywords: ['استخر', 'سونا', 'جکوزی'], icon: IconPool },
  { keywords: ['کافی نت', 'کافی‌نت'], icon: IconLocalCafe },
  { keywords: ['کافی شاپ', 'کافی‌شاپ'], icon: IconBeerMeal },
  { keywords: ['صبحانه'], icon: IconLocalCafe },
  { keywords: ['نماز'], icon: IconMosque },
  { keywords: ['لابی'], icon: IconHotel },
  { keywords: ['بدنسازی', 'بدن‌سازی', 'باشگاه', 'ورزشی'], icon: IconFitnessCenter },
  { keywords: ['کنفرانس', 'سالن'], icon: IconPeople },
  { keywords: ['رستوران'], icon: IconForkSpoon },
  { keywords: ['خودپرداز', 'عابر بانک'], icon: IconAtm },
  { keywords: ['خشکشویی', 'لاندری'], icon: IconLocalLaundryService },
  { keywords: ['تاکسی'], icon: IconLocalTaxi },
  { keywords: ['مبلمان'], icon: IconChair },
  { keywords: ['سرویس بهداشتی ایرانی', 'توالت ایرانی'], icon: IconToiletIranian },
  { keywords: ['سرویس بهداشتی فرنگی', 'توالت فرنگی'], icon: IconToiletWestern },
  { keywords: ['حوله', 'دمپایی'], icon: IconShower },
  { keywords: ['حمام'], icon: IconShower },
  { keywords: ['سشوار'], icon: IconAir },
  { keywords: ['تلویزیون'], icon: IconTvGen },
  { keywords: ['گاو صندوق', 'صندوق امانات'], icon: IconEncrypted },
  { keywords: ['یخچال', 'مینی‌بار', 'مینی بار'], icon: IconKitchen },
  { keywords: ['تهویه'], icon: IconAcUnit },
]

/** Best-effort icon for a free-text amenity name; falls back to a generic hotel glyph. */
export function getAmenityIcon(name: string): IconComponent {
  const rule = AMENITY_ICON_RULES.find(({ keywords }) => keywords.some((keyword) => name.includes(keyword)))
  return rule?.icon ?? IconHotel
}
