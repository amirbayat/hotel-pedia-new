import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getRoomPriceForStay } from '../../api/hotelDetail'
import { useHotelDetail } from '../../hooks/useHotelDetail'
import { useInitHotelOrder } from '../../hooks/useHotelOrder'
import { useSimilarHotels } from '../../hooks/useSimilarHotels'
import { Footer } from '../../components/Footer'
import type { DateRange } from '../../components/DateRangeCalendar'
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
import type { PassengersValue } from '../../components/PassengersField'
import { RoomDetailsModal } from '../../components/RoomDetailsModal'
import { IconArrowLeft } from '../../components/icons'
import type { BookingLocationState } from '../Booking/bookingTypes'
import { resolveStayDates, withDefaultStayParams } from '../../lib/stayParams'
import styles from './HotelDetail.module.scss'

const TABS: HotelTab[] = [
  { id: 'intro', label: 'معرفی و امکانات' },
  { id: 'rooms', label: 'اتاق‌ها' },
  { id: 'similar', label: 'هتل‌های مشابه' },
  { id: 'rules', label: 'قوانین و مقررات هتل' },
]

/** Listing URL for a city, keeping the current stay/occupancy query when present. */
function cityListingHref(cityName: string, searchParams: URLSearchParams) {
  const params = new URLSearchParams()
  params.set('city', cityName)
  for (const key of ['check_in', 'check_out', 'adults', 'rooms', 'children'] as const) {
    const value = searchParams.get(key)
    if (value) params.set(key, value)
  }
  return withDefaultStayParams(`/hotels?${params}`)
}

/** Hotel-detail page — see docs/hotel-detail-plan.md. */
export function HotelDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { hash } = location
  const [searchParams, setSearchParams] = useSearchParams()
  const hashId = hash.replace(/^#/, '')

  const { from: startDate, to: endDate } = resolveStayDates(
    searchParams.get('check_in'),
    searchParams.get('check_out'),
  )
  const adults = Number(searchParams.get('adults') ?? '2')
  const rooms = Number(searchParams.get('rooms') ?? '1')

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next)
  }

  useEffect(() => {
    if (searchParams.get('check_in') && searchParams.get('check_out')) return
    const next = new URLSearchParams(searchParams)
    next.set('check_in', startDate)
    next.set('check_out', endDate)
    navigate(
      { pathname: location.pathname, search: `?${next.toString()}`, hash: location.hash },
      { replace: true },
    )
  }, [searchParams, startDate, endDate, navigate, location.pathname, location.hash])

  // "جستجوی مجدد" search bar keeps its own draft state (like SearchCard) rather
  // than writing straight to the URL on every click — a date range needs two
  // clicks to complete (from, then to), and a controlled `value` that's
  // reset to the URL's already-committed range after every keystroke would
  // never let a second click land as anything but a new `from`.
  const [draftRange, setDraftRange] = useState<DateRange>({ from: startDate, to: endDate })
  const [draftPassengers, setDraftPassengers] = useState<PassengersValue>({ adults, childrenAges: [], rooms })

  function handleSearchAgain() {
    const patch: Record<string, string | null> = {
      adults: String(draftPassengers.adults),
      rooms: String(draftPassengers.rooms),
    }
    if (draftRange.from && draftRange.to) {
      patch.check_in = draftRange.from
      patch.check_out = draftRange.to
    }
    updateParams(patch)
  }

  const { data, isLoading, isError, refetch } = useHotelDetail({ slug, startDate, endDate })

  useEffect(() => {
    if (isLoading || !data || !hashId) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hashId)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [data, hashId, isLoading])

  // hotel-show has no numeric hotel id (see HotelDetail type) — the listing
  // page forwards its own `hotel.id` as a `hotel_id` query param when linking
  // here, which is what the /hotels/{id}/similar and /hotels/{id}/calendars
  // endpoints need. Falls back to `data.id` in case the backend adds one later.
  const hotelIdParam = searchParams.get('hotel_id')
  const hotelId = data?.id ?? (hotelIdParam ? Number(hotelIdParam) : undefined)

  const { data: similarHotels } = useSimilarHotels(hotelId)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [reserveError, setReserveError] = useState('')

  const selectedRoom = data?.rooms.find((room) => room.id === selectedRoomId) ?? null

  const initOrder = useInitHotelOrder()

  // Fires when "رزرو اتاق" is clicked (room card or the details modal) — creates
  // a draft order (see docs/hotel-booking-plan.md §8.1) and only then moves on
  // to the passenger-details page, carrying the order id forward.
  async function handleReserve(roomId: number, roomCount: number) {
    if (!data) return
    if (!startDate || !endDate) {
      setReserveError('تاریخ ورود و خروج را انتخاب کنید.')
      return
    }
    const room = data.rooms.find((candidate) => candidate.id === roomId)
    if (!room) return

    const stayPrice = getRoomPriceForStay(room, startDate, endDate)
    if (!stayPrice) {
      setReserveError('قیمت برای این تاریخ در دسترس نیست.')
      return
    }

    setReserveError('')
    try {
      const { orderId } = await initOrder.mutateAsync({
        startDate,
        endDate,
        roomPassengers: [{ roomId: room.id, roomCount }],
      })

      const state: BookingLocationState = {
        hotel: { slug: data.slug, name: data.name, stars: data.stars, imageUrl: data.images[0]?.path },
        room: {
          roomId: room.id,
          roomKind: room.roomKind,
          roomCount,
          nights: stayPrice.nights,
          feePerRoom: stayPrice.fee,
          boardPricePerRoom: stayPrice.boardPrice,
        },
        startDate,
        endDate,
        orderId,
      }
      navigate(`/hotels/${slug}/book/passengers`, { state })
    } catch (err) {
      setReserveError(err instanceof Error ? err.message : 'ثبت رزرو با خطا مواجه شد.')
    }
  }

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
              <span className={styles.breadcrumbCurrent} aria-current="page">
                {data.name}
              </span>
              <IconArrowLeft width={16} height={16} aria-hidden />
              <Link
                to={cityListingHref(data.cityName, searchParams)}
                className={styles.breadcrumbLink}
              >
                {`هتل‌های شهر ${data.cityName}`}
              </Link>
              <IconArrowLeft width={16} height={16} aria-hidden />
              <Link to="/" className={styles.breadcrumbLink}>
                هتل
              </Link>
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

            <HotelTabs tabs={TABS} initialActiveId={hashId} />

            <section id="intro" className={styles.section}>
              <HotelAmenities
                hotelName={data.name}
                description={data.description}
                amenities={data.amenities.map((amenity) => amenity.name)}
              />
            </section>

            <section id="rooms" className={styles.section}>
              {reserveError && <p className={styles.reserveError}>{reserveError}</p>}
              <HotelRooms
                rooms={data.rooms}
                startDate={startDate}
                endDate={endDate}
                dateRange={draftRange}
                onDateRangeChange={setDraftRange}
                passengers={draftPassengers}
                onPassengersChange={setDraftPassengers}
                fallbackImageUrl={data.images[0]?.path}
                onSearchAgain={handleSearchAgain}
                onViewDetails={setSelectedRoomId}
                onReserve={handleReserve}
              />
            </section>

            {/*
              ⚠️ Nearby places has no source in the hotel-show API response
              (see docs/hotel-detail-plan.md) — stays empty until a real field
              exists, rather than shipping fabricated place data.
            */}
            <section id="nearby" className={styles.section}>
              <NearbyPlaces groups={[]} />
            </section>

            <HotelListSection
              id="similar"
              city={data.cityName}
              title={`هتل‌های مشابه ${data.name}`}
              hotels={(similarHotels ?? []).map((hotel) => ({
                id: hotel.id,
                name: hotel.name,
                imageSrc: hotel.image,
                rating: hotel.stars,
                address: hotel.address,
                href: withDefaultStayParams(
                  `/hotels/${hotel.slug}?check_in=${startDate}&check_out=${endDate}`,
                ),
              }))}
            />

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

            <RoomDetailsModal
              open={selectedRoomId !== null}
              onClose={() => setSelectedRoomId(null)}
              hotelId={hotelId}
              room={selectedRoom}
              galleryImages={data.images.map((image) => image.path)}
              startDate={startDate}
              endDate={endDate}
              cancellationRules={data.cancellationRules}
              onBook={handleReserve}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
