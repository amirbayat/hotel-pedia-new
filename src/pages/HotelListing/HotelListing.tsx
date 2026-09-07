import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Destination } from "../../api/destinations";
import type { HotelSortBy } from "../../api/hotelSearch";
import { useInfiniteHotelSearch } from "../../hooks/useHotelSearch";
import { toPersianDigits } from "../../lib/date/jalali";
import type { DateRange } from "../../components/DateRangeCalendar";
import { FilterSidebar } from "../../components/FilterSidebar";
import type { HotelListingFilters } from "../../components/FilterSidebar";
import { DEFAULT_PRICE_BOUNDS } from "../../components/FilterSidebar/filters";
import { Footer } from "../../components/Footer";
import { HotelListCard } from "../../components/HotelListCard";
import { ListingSearchHeader } from "../../components/ListingSearchHeader";
import { ListingToolbar } from "../../components/ListingToolbar";
import type { PassengersValue } from "../../components/PassengersField";
import styles from "./HotelListing.module.scss";

const DEFAULT_CITY = "تهران";

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
  const checkIn = searchParams.get("check_in");
  const checkOut = searchParams.get("check_out");
  const sortBy =
    (searchParams.get("sort_by") as HotelSortBy | null) ?? "default";

  const adults = Number(searchParams.get("adults") ?? "2");
  const rooms = Number(searchParams.get("rooms") ?? "1");
  const childrenAges = (searchParams.get("children") ?? "")
    .split(",")
    .filter(Boolean)
    .map(Number);

  // Sidebar filters are stored in the URL and applied client-side in the mock search.
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

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteHotelSearch({
    city,
    checkIn: checkIn ?? undefined,
    checkOut: checkOut ?? undefined,
    sortBy,
    name: filters.name || undefined,
    discountedOnly: filters.discountedOnly || undefined,
    stars: filters.stars.length ? filters.stars : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  const hotels = data?.pages.flatMap((page) => page.hotels) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const priceBoundsRef = useRef(DEFAULT_PRICE_BOUNDS);
  const apiPriceBounds = data?.pages[0]?.priceBounds;
  if (apiPriceBounds && apiPriceBounds.max > 0) {
    priceBoundsRef.current = apiPriceBounds;
  }
  const priceBounds = priceBoundsRef.current;
  const isRefreshing = isFetching && !isFetchingNextPage && !isLoading;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, hotels.length]);
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
    updateParams({ city: citySlug });
  }

  function handleDateRangeChange(range: DateRange) {
    if (!range.from || !range.to) return;
    updateParams({ check_in: range.from, check_out: range.to });
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
    });
  }

  function handleClearFilters() {
    updateParams({
      name: null,
      discounted: null,
      stars: null,
      min_price: null,
      max_price: null,
    });
  }

  function handleViewHotel(slug: string, hotelId: number) {
    const params = new URLSearchParams({
      adults: String(adults),
      rooms: String(rooms),
      hotel_id: String(hotelId),
    });
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (childrenAges.length) params.set("children", childrenAges.join(","));
    navigate(`/hotels/${slug}?${params}`);
  }

  function handleSearch(values: {
    city: string;
    dateRange: DateRange;
  }) {
    const nextCity = values.city;
    const nextCheckIn = values.dateRange.from;
    const nextCheckOut = values.dateRange.to;
    if (!nextCheckIn || !nextCheckOut) return;

    const unchanged =
      nextCity === city &&
      nextCheckIn === checkIn &&
      nextCheckOut === checkOut;

    if (unchanged) {
      void refetch();
      return;
    }

    updateParams({
      city: nextCity,
      check_in: nextCheckIn,
      check_out: nextCheckOut,
    });
  }

  const nights = checkIn && checkOut ? daysBetween(checkIn, checkOut) : undefined;
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
        onSearch={handleSearch}
      />
      <div className={styles.listAnchor}>
        <ListingToolbar
          resultCount={total}
          cityLabel={city}
          sortBy={sortBy}
          onSortChange={(next) => updateParams({ sort_by: next })}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((open) => !open)}
        />
      </div>

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
            ) : hotels.length === 0 ? (
              <p className={styles.stateMessage}>
                هتلی با این مشخصات یافت نشد.
              </p>
            ) : (
              <div
                className={[styles.cards, isRefreshing && styles.cardsFetching]
                  .filter(Boolean)
                  .join(" ")}
              >
                {hotels.map((hotel) => (
                  <HotelListCard
                    key={hotel.id}
                    imageSrc={hotel.imageUrl}
                    name={hotel.name}
                    stars={hotel.stars}
                    score={
                      hotel.score != null
                        ? Math.round(hotel.score * 100) / 10
                        : undefined
                    }
                    tags={hotel.tags}
                    address={hotel.address}
                    nights={nights}
                    occupancySummary={occupancySummary}
                    isAvailable={hotel.isAvailable}
                    price={hotel.isAvailable ? hotel.minSellPrice : undefined}
                    originalPrice={hotel.originalPrice}
                    discountPercent={hotel.discountPercent}
                    onReserve={() => handleViewHotel(hotel.slug, hotel.id)}
                    onViewDetails={() => handleViewHotel(hotel.slug, hotel.id)}
                  />
                ))}

                <div ref={loadMoreRef} className={styles.loadMoreSentinel} aria-hidden />

                {isFetchingNextPage && (
                  <p className={styles.loadingMore}>در حال بارگذاری...</p>
                )}
              </div>
            )}
          </div>

          {filtersOpen && (
            <FilterSidebar
              className={styles.sidebar}
              value={filters}
              onChange={handleFiltersChange}
              priceBounds={priceBounds}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
