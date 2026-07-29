import { Header } from '../../components/Header'
import { HomeHeader } from '../../components/HomeHeader'
import { SearchCard } from '../../components/SearchCard'
import { PromoCarousel } from '../../components/PromoCarousel'
import type { PromoSlide } from '../../components/PromoCarousel'
import { PopularCities } from '../../components/PopularCities'
import type { CityCard } from '../../components/PopularCities'
import { HotelListSection } from '../../components/HotelListSection'
import type { HotelListItem } from '../../components/HotelListSection'
import { AdvantageBoxes } from '../../components/AdvantageBoxes'
import type { AdvantageBoxItem } from '../../components/AdvantageBoxes'
import { Faq } from '../../components/Faq'
import type { FaqItem } from '../../components/Faq'
import { Footer } from '../../components/Footer'
import styles from './Home.module.scss'

// Mock data — PromoCarousel and PopularCities are meant to be fed from the API;
// this is just placeholder content until that's wired up.
const promoSlides: PromoSlide[] = [
  { id: 1, title: 'لورم ایپسوم متن ساختگی با تولید سادگی' },
  { id: 2, title: 'لورم ایپسوم متن ساختگی با تولید سادگی' },
  { id: 3, title: 'لورم ایپسوم متن ساختگی با تولید سادگی' },
]

const popularCities: CityCard[] = [
  { id: 'shiraz', name: 'شهر شیراز' },
  { id: 'isfahan', name: 'شهر اصفهان' },
  { id: 'kish', name: 'جزیره کیش', tall: true },
  { id: 'mashhad', name: 'شهر مشهد', tall: true },
  { id: 'tehran', name: 'شهر تهران' },
  { id: 'tabriz', name: 'شهر تبریز' },
]

// Same mock hotel repeated — real data comes from the API later.
const makeHotels = (cityPrefix: string): HotelListItem[] =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `${cityPrefix}-${i}`,
    name: 'هتل اسپیناس پالاس',
    rating: 5,
    badges: ['لوکس', 'بهترین منطقه', 'پیشنهاد ویژه'],
    address: `${cityPrefix}، میدان آزادی`,
    pricePerNight: 5500000,
    originalPricePerNight: i % 2 === 0 ? 7000000 : undefined,
    discountPercent: i % 2 === 0 ? 20 : undefined,
  }))

const tehranHotels = makeHotels('تهران')
const mashhadHotels = makeHotels('مشهد')

const advantages: AdvantageBoxItem[] = [
  {
    id: 1,
    title: 'رزرو آنلاین هتل با بهترین قیمت',
    description:
      'با استفاده از سیستم رزرو آنلاین هتل، می‌توانید تنها با چند کلیک، اقامتگاه مورد نظر خود را انتخاب کنید. این روش باعث صرفه‌جویی در وقت و هزینه شما می‌شود. همچنین امکان مقایسه قیمت‌ها و مشاهده امکانات هتل‌ها به‌راحتی وجود دارد. تجربه سفری آسان و مطمئن را با رزرو اینترنتی هتل تجربه کنید.',
  },
  {
    id: 2,
    title: 'بهترین هتل‌های ایران برای سفرهای خانوادگی',
    description:
      'هتل‌های مناسب خانواده باید امنیت، آرامش و امکانات کافی برای همه اعضای خانواده را داشته باشند. در این دسته، هتل‌هایی معرفی می‌شوند که اتاق‌های خانوادگی، فضای بازی کودکان و خدمات ویژه خانواده‌ها را ارائه می‌دهند. انتخاب این هتل‌ها باعث می‌شود سفری لذت‌بخش و بدون دغدغه داشته باشید. با انتخاب درست، خانواده شما اقامتی به‌یادماندنی خواهد داشت.',
  },
  {
    id: 3,
    title: 'راهنمای انتخاب هتل مناسب برای سفر کاری',
    description:
      'سفرهای کاری نیازمند هتل‌هایی با امکانات خاص هستند که شامل اینترنت پرسرعت، سالن‌های کنفرانس و دسترسی آسان به مراکز تجاری است. انتخاب صحیح هتل می‌تواند بر کیفیت جلسات و بازده کاری شما تاثیر زیادی داشته باشد. ما بهترین هتل‌های مناسب سفرهای کاری را معرفی می‌کنیم. این هتل‌ها ترکیبی از راحتی، امکانات حرفه‌ای و دسترسی عالی هستند.',
  },
  {
    id: 4,
    title: 'مزایای رزرو هتل از طریق سایت ما',
    description:
      'رزرو هتل از سایت ما به شما این امکان را می‌دهد که در کوتاه‌ترین زمان، بهترین گزینه‌ها را مقایسه کنید. شفافیت در قیمت‌گذاری و ارائه تخفیف‌های ویژه از ویژگی‌های اصلی ماست. همچنین پشتیبانی ۲۴ ساعته برای پاسخ به سوالات شما فراهم شده است. با ما، تجربه‌ای سریع، مطمئن و اقتصادی خواهید داشت.',
  },
]

// Transcribed from the PDF export — note the questions are flight-related in
// the source design even though this is a hotel site; kept as-is pending a
// content update. Only item 2's answer was visible (expanded by default in
// the design); the rest are short placeholders until real copy is provided.
const faqItems: FaqItem[] = [
  {
    id: 1,
    question: 'چند روز قبل از پرواز، بلیط هواپیما را بخریم؟',
    answer: 'برای اطمینان از موجودی و قیمت بهتر، خرید بلیط را حداقل چند روز زودتر انجام دهید.',
  },
  {
    id: 2,
    question: 'در هر پرواز، میزان بار مجاز چقدر است؟',
    answer:
      'میزان مجاز بار به کلاس پرواز و کلاس نرخی بلیط بستگی دارد. هنگام خرید آنلاین بلیط هواپیما می‌توانید میزان بار مجاز را در اطلاعات بلیط ببینید. طبیعی است که اگر میزان بارتان بیش از حد مجاز باشد، باید جریمه پرداخت کنید.',
  },
  {
    id: 3,
    question: 'نرخ بلیط هواپیما برای نوزادان و کودکان زیر ۱۲ سال چگونه است؟',
    answer: 'نرخ بلیط نوزادان و کودکان زیر ۱۲ سال معمولاً با تخفیف نسبت به نرخ بزرگسال محاسبه می‌شود.',
  },
  {
    id: 4,
    question: 'رزرو آنلاین بلیط هواپیما هزینه بیشتری از خرید حضوری دارد؟',
    answer: 'خیر، قیمت بلیط آنلاین معمولاً مشابه یا حتی کمتر از خرید حضوری است.',
  },
  {
    id: 5,
    question: 'آیا پس از خرید اینترنتی بلیط هواپیما امکان استرداد آن وجود دارد؟',
    answer: 'بله، استرداد بلیط طبق قوانین استرداد هر ایرلاین و بسته به نوع بلیط امکان‌پذیر است.',
  },
  {
    id: 6,
    question: 'آیا پس از خرید بلیط هواپیما، امکان تغییر نام یا نام خانوادگی وجود دارد؟',
    answer: 'تغییر نام معمولاً امکان‌پذیر است، اما ممکن است مشمول هزینه یا محدودیت‌های ایرلاین باشد.',
  },
  {
    id: 7,
    question: 'هنگامی که از سایت خرید بلیط هواپیما رزرو بلیط را انجام می‌دهیم، امکان انتخاب صندلی مورد نظرمان وجود دارد؟',
    answer: 'بله، در بیشتر پروازها امکان انتخاب صندلی در مرحله رزرو یا پس از آن وجود دارد.',
  },
]

export function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <HomeHeader />
      <SearchCard />

      <div className={styles.content}>
        <PromoCarousel slides={promoSlides} />
        <PopularCities cities={popularCities} />
        <HotelListSection city="تهران" hotels={tehranHotels} />
        <HotelListSection city="مشهد" hotels={mashhadHotels} />
        <AdvantageBoxes items={advantages} />
        <Faq items={faqItems} defaultOpenId={2} />
      </div>

      <Footer />
    </div>
  )
}
