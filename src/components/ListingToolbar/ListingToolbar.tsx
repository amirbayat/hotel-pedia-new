import type { HotelSortBy } from "../../api/hotelSearch";
import { toPersianDigits } from "../../lib/date/jalali";
import { IconClose } from "../icons";
import styles from "./ListingToolbar.module.scss";

interface SortPill {
  value: HotelSortBy;
  label: string;
}

const SORT_PILLS: SortPill[] = [
  { value: "highest_rating", label: "پرستاره ترین" },
  { value: "highest_price", label: "گرانترین" },
  { value: "lowest_price", label: "ارزان‌ترین" },
  { value: "default", label: "پیشنهادی" },
];

export interface ListingToolbarProps {
  resultCount: number;
  cityLabel: string;
  sortBy: HotelSortBy;
  onSortChange: (sort: HotelSortBy) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}

/** Result count + sort pills + clear/toggle filters — matches Figma "Frame 67" (node 286:2591). */
export function ListingToolbar({
  resultCount,
  cityLabel,
  sortBy,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  filtersOpen,
  onToggleFilters,
}: ListingToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.inner}>
        <span className={styles.resultCount} dir="rtl">
          {`${toPersianDigits(resultCount)} هتل و اقامتگاه در `}
          <bdi>{cityLabel}</bdi>
        </span>
        <div className={styles.sortGroup}>
          <div className={styles.pills}>
            {SORT_PILLS.map((pill) => (
              <button
                key={pill.value}
                type="button"
                className={[
                  styles.pill,
                  pill.value === sortBy && styles.pillActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onSortChange(pill.value)}
                aria-pressed={pill.value === sortBy}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className={styles.sortLabel}>
            <span>:مرتب‌سازی</span>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button
            type="button"
            className={styles.clearButton}
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
          >
            <span>حذف فیلتر</span>
            <IconClose width={24} height={24} aria-hidden />
          </button>

          <button
            type="button"
            className={styles.filtersToggle}
            onClick={onToggleFilters}
            aria-pressed={filtersOpen}
          >
            <span>فیلترها</span>
          </button>
        </div>
      </div>
    </div>
  );
}
