import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Destination } from "../../api/destinations";
import { formatJalaliDayMonthRange } from "../../lib/date/jalali";
import { useAuth } from "../../context/authContextValue";
import { AccountMenu } from "../AccountMenu";
import { AuthModal } from "../AuthModal";
import { Button } from "../Button";
import { DateRangeCalendar } from "../DateRangeCalendar";
import type { DateRange } from "../DateRangeCalendar";
import { DestinationSearchField } from "../DestinationSearchField";
import { Input } from "../Input";
import { PassengersField } from "../PassengersField";
import type { PassengersValue } from "../PassengersField";
import {
  IconArrowDown,
  IconDate,
  IconLogin,
  IconSearch,
} from "../icons";
import logo from "../../assets/logo.svg";
import styles from "./ListingSearchHeader.module.scss";

function buildDateError(range: DateRange): string {
  const errors: string[] = [];
  if (!range.from) errors.push("تاریخ ورود را وارد کنید.");
  if (!range.to) errors.push("تاریخ خروج را وارد کنید.");
  return errors.join(" ");
}

export interface ListingSearchValues {
  city: string;
  dateRange: DateRange;
}

export interface ListingSearchHeaderProps {
  destinationLabel: string;
  onDestinationSelect: (destination: Destination) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  passengers: PassengersValue;
  onPassengersChange: (value: PassengersValue) => void;
  onSearch: (values: ListingSearchValues) => void;
}

/**
 * Compact sticky search bar for the listing page — a condensed, title-less
 * version of `SearchCard`'s destination/date/passenger fields, centered in
 * the header regardless of what's in the logo/account group. See
 * docs/hotel-listing-plan.md §3.1.
 */
export function ListingSearchHeader({
  destinationLabel,
  onDestinationSelect,
  dateRange,
  onDateRangeChange,
  passengers,
  onPassengersChange,
  onSearch,
}: ListingSearchHeaderProps) {
  const { user, logout } = useAuth();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [destination, setDestination] = useState(destinationLabel);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [destinationError, setDestinationError] = useState("");
  const [dateError, setDateError] = useState("");
  const dateFieldRef = useRef<HTMLDivElement>(null);
  // Keep a local draft so the first click of a new range (`to: null`) is not
  // discarded — the parent only writes a complete range to the URL, and a
  // controlled value that snaps back to that committed range after every click
  // would treat the second click as a new `from` forever.
  const [draftRange, setDraftRange] = useState<DateRange>(dateRange);

  useEffect(() => {
    setDraftRange(dateRange);
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    setDestination(destinationLabel);
    setSelectedDestination(null);
  }, [destinationLabel]);

  function handleDestinationSelect(selected: Destination) {
    setSelectedDestination(selected);
    setDestinationError("");
    onDestinationSelect(selected);
  }

  function handleRangeChange(next: DateRange) {
    setDraftRange(next);
    if (dateError) setDateError(buildDateError(next));
    if (next.from && next.to) onDateRangeChange(next);
  }

  function closeCalendar() {
    setIsCalendarOpen(false);
    setDraftRange((current) =>
      current.from && current.to ? current : dateRange,
    );
  }

  function handleSearch() {
    const nextDestinationError = !destination.trim()
      ? "مقصد را وارد کنید."
      : "";
    const nextDateError = buildDateError(draftRange);

    setDestinationError(nextDestinationError);
    setDateError(nextDateError);

    if (nextDestinationError || nextDateError) return;
    if (!draftRange.from || !draftRange.to) return;

    const city =
      selectedDestination?.type === "city"
        ? selectedDestination.slug
        : destination.trim();

    onSearch({ city, dateRange: { from: draftRange.from, to: draftRange.to } });
  }

  useEffect(() => {
    if (!isCalendarOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        dateFieldRef.current &&
        !dateFieldRef.current.contains(event.target as Node)
      ) {
        closeCalendar();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCalendarOpen, dateRange.from, dateRange.to]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          {user ? (
            <AccountMenu user={user} onLogout={logout} />
          ) : (
            <Button
              variant="secondary"
              icon={IconLogin}
              onClick={() => setAuthOpen(true)}
            >
              ورود - ثبت نام
            </Button>
          )}
        </div>

        <div className={styles.fields}>
          <Button
            variant="primary"
            icon={IconSearch}
            onClick={handleSearch}
            aria-label="جستجو"
          />

          <PassengersField
            className={styles.field}
            value={passengers}
            onChange={onPassengersChange}
            showLabel={false}
          />

          <div
            className={[
              styles.dateField,
              dateError && styles.dateFieldWithError,
            ]
              .filter(Boolean)
              .join(" ")}
            ref={dateFieldRef}
            onClick={() => setIsCalendarOpen(true)}
          >
            <Input
              name="stay-date-range"
              autoComplete="off"
              placeholder="بازه زمان ورود و خروج را وارد کنید"
              leadingIcon={IconDate}
              trailingIcon={IconArrowDown}
              reverseIcons
              value={formatJalaliDayMonthRange(draftRange)}
              error={dateError || undefined}
              dir="rtl"
              onFocus={() => setIsCalendarOpen(true)}
              readOnly
            />

            {isCalendarOpen && (
              <DateRangeCalendar
                className={styles.calendarPopover}
                value={draftRange}
                onChange={handleRangeChange}
                onConfirm={closeCalendar}
              />
            )}
          </div>

          <DestinationSearchField
            className={styles.field}
            reverseIcons
            value={destination}
            onChange={(value) => {
              setDestination(value);
              setSelectedDestination(null);
              if (value.trim()) setDestinationError("");
            }}
            error={destinationError || undefined}
            showLabel={false}
            citiesOnly
            onSelect={handleDestinationSelect}
          />
        </div>

        <div className={styles.right}>
          <Link to="/" aria-label="هتل‌پدیا">
            <img src={logo} alt="هتل‌پدیا" className={styles.logo} />
          </Link>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
