import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Destination } from "../../api/destinations";
import type { HotelSortBy } from "../../api/hotelSearch";
import { useHotelSearch } from "../../hooks/useHotelSearch";
import { toIsoDate, todayIso, toPersianDigits } from "../../lib/date/jalali";
import type { DateRange } from "../../components/DateRangeCalendar";
import { FilterSidebar } from "../../components/FilterSidebar";
import type { HotelListingFilters } from "../../components/FilterSidebar";
import { Footer } from "../../components/Footer";
import { HotelListCard } from "../../components/HotelListCard";
import { ListingSearchHeader } from "../../components/ListingSearchHeader";
import { ListingToolbar } from "../../components/ListingToolbar";
import { Pagination } from "../../components/Pagination";
import type { PassengersValue } from "../../components/PassengersField";
import styles from "./HotelListing.module.scss";

const DEFAULT_CITY = "تهران";

function tomorrowIso(): string {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function parseStars(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map(Number)
    .filter((star) => star >= 1 && star <= 5);
}

/** Hotel listing/search-results page — see docs/hotel-listing-plan.md. */
export function HotelListing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(true);

  const city = searchParams.get("city") ?? DEFAULT_CITY;
  const checkIn = searchParams.get("check_in") ?? todayIso();
  const checkOut = searchParams.get("check_out") ?? tomorrowIso();
  const sortBy =
    (searchParams.get("sort_by") as HotelSortBy | null) ?? "default";
  const page = Number(searchParams.get("page") ?? "1");

  const adults = Number(searchParams.get("adults") ?? "2");
  const rooms = Number(searchParams.get("rooms") ?? "1");
  const childrenAges = (searchParams.get("children") ?? "")
    .split(",")
    .filter(Boolean)
    .map(Number);

  // Kept only in the URL — the hotel-search API doesn't accept any of these yet (docs/hotel-listing-plan.md §3.4).
  const filters: HotelListingFilters = {
    name: searchParams.get("name") ?? "",
    discountedOnly: searchParams.get("discounted") === "1",
    stars: parseStars(searchParams.get("stars")),
    minPrice: searchParams.get("min_price")
      ? Number(searchParams.get("min_price"))
      : null,
    maxPrice: searchParams.get("max_price")
      ? Number(searchParams.get("max_price"))
      : null,
  };
  const hasActiveFilters =
    filters.name !== "" ||
    filters.discountedOnly ||
    filters.stars.length > 0 ||
    filters.minPrice != null ||
    filters.maxPrice != null;

  const { data, isLoading, isFetching, isError, refetch } = useHotelSearch({
    city,
    checkIn,
    checkOut,
    sortBy,
    page,
  });

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next);
  }

  function handleDestinationSelect(destination: Destination) {
    const citySlug =
      destination.type === "city" ? destination.slug : destination.citySlug;
    updateParams({ city: citySlug, page: null });
  }

  function handleDateRangeChange(range: DateRange) {
    if (!range.from || !range.to) return;
    updateParams({ check_in: range.from, check_out: range.to, page: null });
  }

  function handlePassengersChange(value: PassengersValue) {
    updateParams({
      adults: String(value.adults),
      rooms: String(value.rooms),
      children: value.childrenAges.length ? value.childrenAges.join(",") : null,
    });
  }

  function handleFiltersChange(next: HotelListingFilters) {
    updateParams({
      name: next.name || null,
      discounted: next.discountedOnly ? "1" : null,
      stars: next.stars.length ? next.stars.join(",") : null,
      min_price: next.minPrice != null ? String(next.minPrice) : null,
      max_price: next.maxPrice != null ? String(next.maxPrice) : null,
      page: null,
    });
  }

  function handleClearFilters() {
    updateParams({
      name: null,
      discounted: null,
      stars: null,
      min_price: null,
      max_price: null,
      page: null,
    });
  }

  function handleViewHotel(slug: string, hotelId: number) {
    navigate(
      `/hotels/${slug}?${new URLSearchParams({
        check_in: checkIn,
        check_out: checkOut,
        adults: String(adults),
        rooms: String(rooms),
        hotel_id: String(hotelId),
      })}`,
    );
  }

  const nights = daysBetween(checkIn, checkOut);
  const occupancySummary = `${toPersianDigits(adults)} بزرگسال - ${toPersianDigits(rooms)} اتاق`;

  return (
    <div className={styles.page}>
      <ListingSearchHeader
        destinationLabel={city}
        onDestinationSelect={handleDestinationSelect}
        dateRange={{ from: checkIn, to: checkOut }}
        onDateRangeChange={handleDateRangeChange}
        passengers={{ adults, childrenAges, rooms }}
        onPassengersChange={handlePassengersChange}
        onSearch={() => refetch()}
      />
      <ListingToolbar
        resultCount={data?.total ?? 0}
        cityLabel={city}
        sortBy={sortBy}
        onSortChange={(next) => updateParams({ sort_by: next, page: null })}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
      />

      <div className={styles.content}>
        <div className={styles.body}>
          <div className={styles.list}>
            {isLoading ? (
              <p className={styles.stateMessage}>در حال بارگذاری...</p>
            ) : isError ? (
              <div className={styles.stateMessage}>
                <p>مشکلی در دریافت اطلاعات پیش آمد.</p>
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={() => refetch()}
                >
                  تلاش مجدد
                </button>
              </div>
            ) : data && data.hotels.length === 0 ? (
              <p className={styles.stateMessage}>
                هتلی با این مشخصات یافت نشد.
              </p>
            ) : (
              <div
                className={[styles.cards, isFetching && styles.cardsFetching]
                  .filter(Boolean)
                  .join(" ")}
              >
                {data?.hotels.map((hotel) => (
                  <HotelListCard
                    key={hotel.id}
                    imageSrc={hotel.imageUrl}
                    name={hotel.name}
                    stars={hotel.stars}
                    score={hotel.score != null ? hotel.score * 10 : undefined}
                    address={hotel.address}
                    nights={nights}
                    occupancySummary={occupancySummary}
                    isAvailable={hotel.isAvailable}
                    price={hotel.isAvailable ? hotel.minSellPrice : undefined}
                    onReserve={() => handleViewHotel(hotel.slug, hotel.id)}
                    onViewDetails={() => handleViewHotel(hotel.slug, hotel.id)}
                  />
                ))}
              </div>
            )}

            {data && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={(next) => updateParams({ page: String(next) })}
              />
            )}
          </div>

          {filtersOpen && (
            <FilterSidebar
              className={styles.sidebar}
              value={filters}
              onChange={handleFiltersChange}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
