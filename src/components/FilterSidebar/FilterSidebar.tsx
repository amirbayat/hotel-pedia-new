import { useState } from "react";
import type { ReactNode } from "react";
import { Input } from "../Input";
import { Switch } from "../Switch";
import {
  IconArrowDown,
  IconArrowUp,
  IconSearch,
  IconStar,
  IconTick,
} from "../icons";
import { DEFAULT_PRICE_BOUNDS } from "./filters";
import type { HotelListingFilters } from "./filters";
import styles from "./FilterSidebar.module.scss";

export interface FilterSidebarProps {
  value: HotelListingFilters;
  onChange: (value: HotelListingFilters) => void;
  priceBounds?: { min: number; max: number };
  className?: string;
}

const STAR_OPTIONS = [5, 4, 3, 2, 1];

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span className={styles.sectionTitle}>{title}</span>
        {isOpen ? (
          <IconArrowUp width={24} height={24} />
        ) : (
          <IconArrowDown width={24} height={24} />
        )}
      </button>
      {isOpen && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

/**
 * Listing sidebar filters — matches Figma "Frame 87" (node 451:7858).
 *
 * Filters update the page URL; the mock search applies them client-side before pagination.
 * Wire the same fields to the real API when backend support lands (docs/hotel-listing-plan.md §3.4).
 */
export function FilterSidebar({
  value,
  onChange,
  priceBounds = DEFAULT_PRICE_BOUNDS,
  className,
}: FilterSidebarProps) {
  function toggleStar(star: number) {
    const stars = value.stars.includes(star)
      ? value.stars.filter((s) => s !== star)
      : [...value.stars, star];
    onChange({ ...value, stars });
  }

  function handlePriceInput(key: "minPrice" | "maxPrice", raw: string) {
    const parsed =
      raw.trim() === "" ? null : Number(raw.replace(/[^0-9]/g, ""));
    onChange({
      ...value,
      [key]: parsed !== null && Number.isNaN(parsed) ? value[key] : parsed,
    });
  }

  const sliderMin = Math.min(
    Math.max(value.minPrice ?? priceBounds.min, priceBounds.min),
    priceBounds.max,
  );
  const sliderMax = Math.min(
    Math.max(value.maxPrice ?? priceBounds.max, priceBounds.min),
    priceBounds.max,
  );
  const priceSpan = priceBounds.max - priceBounds.min;
  const minPercent = priceSpan === 0 ? 0 : ((sliderMin - priceBounds.min) / priceSpan) * 100;
  const maxPercent = priceSpan === 0 ? 100 : ((sliderMax - priceBounds.min) / priceSpan) * 100;

  return (
    <div className={[styles.sidebar, className].filter(Boolean).join(" ")}>
      <Section title="جستجو نام هتل">
        <Input
          placeholder="نام هتل را جستجو کنید"
          leadingIcon={IconSearch}
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
        />
      </Section>

      <Section title="تخفیف‌دارها">
        <div className={styles.switchRow}>
          <Switch
            checked={value.discountedOnly}
            onChange={(checked) =>
              onChange({ ...value, discountedOnly: checked })
            }
          />
          <span className={styles.switchLabel}>فقط هتل‌های دارای تخفیف</span>
        </div>
      </Section>

      <Section title="ستاره هتل">
        <div className={styles.starList}>
          {STAR_OPTIONS.map((star) => {
            const checked = value.stars.includes(star);
            return (
              <label key={star} className={styles.starRow}>
                <span className={styles.starRowCheckbox}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={checked}
                    onChange={() => toggleStar(star)}
                  />
                  <span
                    className={[
                      styles.checkboxBox,
                      checked && styles.checkboxChecked,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {checked && <IconTick width={16} height={16} />}
                  </span>
                </span>
                <span className={styles.starRowRight}>
                  <span className={styles.starIcons}>
                    {Array.from({ length: star }, (_, i) => (
                      <IconStar
                        key={i}
                        width={16}
                        height={16}
                        className={styles.starFilled}
                      />
                    ))}
                  </span>
                </span>
                <span className={styles.starRowLabel}>{star} ستاره</span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="محدوده قیمت">
        <div className={styles.priceInputs}>
          <div className={styles.priceInputGroup}>
            <span className={styles.priceInputLabel}>از قیمت</span>
            <Input
              inputMode="numeric"
              value={value.minPrice?.toLocaleString("en-US") ?? ""}
              onChange={(event) =>
                handlePriceInput("minPrice", event.target.value)
              }
              placeholder={priceBounds.min.toLocaleString("en-US")}
            />
          </div>
          <div className={styles.priceInputGroup}>
            <span className={styles.priceInputLabel}>تا قیمت</span>
            <Input
              inputMode="numeric"
              value={value.maxPrice?.toLocaleString("en-US") ?? ""}
              onChange={(event) =>
                handlePriceInput("maxPrice", event.target.value)
              }
              placeholder={priceBounds.max.toLocaleString("en-US")}
            />
          </div>
        </div>

        <div className={styles.sliderWrapper}>
          <div className={styles.sliderTrack} />
          <div
            className={styles.sliderRange}
            style={{
              insetInlineStart: `${minPercent}%`,
              insetInlineEnd: `${100 - maxPercent}%`,
            }}
          />
          <input
            type="range"
            className={styles.rangeInput}
            min={priceBounds.min}
            max={priceBounds.max}
            step={10_000}
            value={sliderMin}
            onChange={(event) =>
              onChange({
                ...value,
                minPrice: Math.min(Number(event.target.value), sliderMax),
              })
            }
          />
          <input
            type="range"
            className={styles.rangeInput}
            min={priceBounds.min}
            max={priceBounds.max}
            step={10_000}
            value={sliderMax}
            onChange={(event) =>
              onChange({
                ...value,
                maxPrice: Math.max(Number(event.target.value), sliderMin),
              })
            }
          />
        </div>
        <div className={styles.sliderLegend}>
          <span>از {priceBounds.min.toLocaleString("en-US")}</span>
          <span>تا {priceBounds.max.toLocaleString("en-US")}</span>
        </div>
      </Section>
    </div>
  );
}
