import { useEffect, useRef, useState } from "react";
import type { Destination } from "../../api/destinations";
import { formatJalaliDisplay } from "../../lib/date/jalali";
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
  IconCallCenter,
  IconDate,
  IconLogin,
  IconSearch,
} from "../icons";
import logo from "../../assets/logo.svg";
import styles from "./ListingSearchHeader.module.scss";

function formatRangeLabel(range: DateRange): string {
  if (!range.from) return "";
  if (!range.to) return formatJalaliDisplay(range.from);
  return `${formatJalaliDisplay(range.to)} - ${formatJalaliDisplay(range.from)}`;
}

export interface ListingSearchHeaderProps {
  destinationLabel: string;
  onDestinationSelect: (destination: Destination) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  passengers: PassengersValue;
  onPassengersChange: (value: PassengersValue) => void;
  onSearch: () => void;
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
  const dateFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCalendarOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        dateFieldRef.current &&
        !dateFieldRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCalendarOpen]);

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
          <Button
            variant="secondary"
            icon={IconCallCenter}
            aria-label="پشتیبانی"
          />
        </div>

        <div className={styles.fields}>
          <Button
            variant="primary"
            icon={IconSearch}
            onClick={onSearch}
            aria-label="جستجو"
          />

          <PassengersField
            className={styles.field}
            value={passengers}
            onChange={onPassengersChange}
            showLabel={false}
          />

          <div
            className={styles.dateField}
            ref={dateFieldRef}
            onClick={() => setIsCalendarOpen(true)}
          >
            <Input
              placeholder="بازه زمان ورود و خروج را وارد کنید"
              leadingIcon={IconDate}
              trailingIcon={IconArrowDown}
              reverseIcons
              value={formatRangeLabel(dateRange)}
              onFocus={() => setIsCalendarOpen(true)}
              readOnly
            />

            {isCalendarOpen && (
              <DateRangeCalendar
                className={styles.calendarPopover}
                value={dateRange}
                onChange={onDateRangeChange}
              />
            )}
          </div>

          <DestinationSearchField
            className={styles.field}
            reverseIcons
            defaultValue={destinationLabel}
            showLabel={false}
            onSelect={onDestinationSelect}
          />
        </div>

        <div className={styles.right}>
          <img src={logo} alt="هتل‌پدیا" className={styles.logo} />
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
