import { useParams, useSearchParams } from 'react-router-dom'
import { useHotelDetail } from '../../hooks/useHotelDetail'
import { formatJalaliDisplay, todayIso, toPersianDigits } from '../../lib/date/jalali'
import { Footer } from '../../components/Footer'
import { HotelAmenities } from '../../components/HotelAmenities'
import { HotelDetailHeader } from '../../components/HotelDetailHeader'
import { HotelFaq } from '../../components/HotelFaq'
import { HotelGallery } from '../../components/HotelGallery'
import { HotelListSection } from '../../components/HotelListSection'
import { HotelRooms } from '../../components/HotelRooms'
import { HotelRules } from '../../components/HotelRules'
import { HotelSummary } from '../../components/HotelSummary'
import { HotelTabs } from '../../components/HotelTabs'
import type { HotelTab } from '../../components/HotelTabs'
import { NearbyPlaces } from '../../components/NearbyPlaces'
import { IconArrowLeft } from '../../components/icons'
import styles from './HotelDetail.module.scss'

const TABS: HotelTab[] = [
  { id: 'intro', label: 'معرفی و امکانات' },
  { id: 'rooms', label: 'اتاق‌ها' },
  { id: 'nearby', label: 'اماکن اطراف هتل' },
  { id: 'rules', label: 'قوانین و مقررات هتل' },
]

function tomorrowIso(): string {
  const now = new Date()
  now.setDate(now.getDate() + 1)
  return now.toISOString().slice(0, 10)
}

/** Hotel-detail page — see docs/hotel-detail-plan.md. */
export function HotelDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()

  const startDate = searchParams.get('check_in') ?? todayIso()
  const endDate = searchParams.get('check_out') ?? tomorrowIso()
  const adults = Number(searchParams.get('adults') ?? '2')
  const rooms = Number(searchParams.get('rooms') ?? '1')

  const { data, isLoading, isError, refetch } = useHotelDetail({ slug, startDate, endDate })

  const occupancySummary = `${toPersianDigits(adults)} بزرگسال - ${toPersianDigits(rooms)} اتاق`
  const dateRangeLabel = `${formatJalaliDisplay(startDate)} - ${formatJalaliDisplay(endDate)}`

  return (
    <div className={styles.page}>
      <HotelDetailHeader />

      <div className={styles.content}>
        {isLoading ? (
          <p className={styles.stateMessage}>در حال بارگذاری...</p>
        ) : isError || !data ? (
          <div className={styles.stateMessage}>
            <p>مشکلی در دریافت اطلاعات هتل پیش آمد.</p>
            <button type="button" className={styles.retryButton} onClick={() => refetch()}>
              تلاش مجدد
            </button>
          </div>
        ) : (
          <>
            <nav className={styles.breadcrumb} aria-label="مسیر صفحه">
              <span>{data.name}</span>
              <IconArrowLeft width={16} height={16} />
              <span>هتل‌های شهر تهران</span>
              <IconArrowLeft width={16} height={16} />
              <span>هتل</span>
            </nav>

            <HotelGallery images={data.images.map((image) => image.path)} hotelName={data.name} />

            <HotelSummary
              name={data.name}
              stars={data.stars}
              score={data.rating.total || undefined}
              reviewCount={data.rating.totalCount || undefined}
              address={data.address}
              lat={data.location.lat}
              lng={data.location.lng}
            />

            <HotelTabs tabs={TABS} />

            <section id="intro" className={styles.section}>
              <HotelAmenities
                hotelName={data.name}
                description={data.description}
                amenities={data.amenities.map((amenity) => amenity.name)}
              />
            </section>

            <section id="rooms" className={styles.section}>
              <HotelRooms
                rooms={data.rooms}
                startDate={startDate}
                endDate={endDate}
                occupancySummary={occupancySummary}
                dateRangeLabel={dateRangeLabel}
                fallbackImageUrl={data.images[0]?.path}
              />
            </section>

            {/*
              ⚠️ Nearby places / similar hotels have no source in the hotel-show API
              response (see docs/hotel-detail-plan.md) — both stay empty until a real
              field/endpoint exists, rather than shipping fabricated place/hotel data.
            */}
            <section id="nearby" className={styles.section}>
              <NearbyPlaces groups={[]} />
            </section>

            <HotelListSection city="تهران" title={`هتل‌های مشابه ${data.name}`} hotels={[]} />

            <section id="rules" className={styles.section}>
              <HotelRules
                checkIn={data.checkIn}
                checkOut={data.checkOut}
                generalRules={data.generalRules}
                cancellationRules={data.cancellationRules}
              />
            </section>

            {/* ⚠️ Placeholder — hotel-show has no FAQ field yet, see docs/hotel-detail-plan.md. */}
            <HotelFaq faqs={[]} />
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
