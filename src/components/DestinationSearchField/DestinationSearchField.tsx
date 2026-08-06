import { useEffect, useRef, useState } from "react";
import { searchDestinations, type Destination } from "../../api/destinations";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { Input } from "../Input";
import { IconArrowLeft, IconHotel, IconLocation } from "../icons";
import styles from "./DestinationSearchField.module.scss";

export interface DestinationSearchFieldProps {
  className?: string;
  /** Puts the leading icon on the right and the trailing icon on the left, for RTL fields. */
  reverseIcons?: boolean;
  /** Pre-fills the field, e.g. with the currently selected city when the field mounts already scoped to one. */
  defaultValue?: string;
  /** Hides the "مقصد یا هتل" title above the field, for compact/header contexts. Defaults to true. */
  showLabel?: boolean;
  onSelect?: (destination: Destination) => void;
}

/** "مقصد یا هتل" field — debounced destination search with a suggestions dropdown. */
export function DestinationSearchField({
  className,
  reverseIcons,
  defaultValue = "",
  showLabel = true,
  onSelect,
}: DestinationSearchFieldProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<Destination[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasUserEdited) return;

    if (!debouncedQuery) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setIsOpen(true);

    searchDestinations(debouncedQuery, controller.signal)
      .then((destinations) => {
        setResults(destinations);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setResults([]);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [debouncedQuery, hasUserEdited]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleSelect(destination: Destination) {
    setQuery(destination.label);
    setIsOpen(false);
    setHasUserEdited(false);
    onSelect?.(destination);
  }

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      ref={wrapperRef}
    >
      <Input
        label={showLabel ? "مقصد یا هتل" : undefined}
        placeholder="مقصد یا هتل مورد نظر را وارد کنید"
        // leadingIcon={IconLocation}
        trailingIcon={IconLocation}
        reverseIcons={reverseIcons}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setHasUserEdited(true);
        }}
        autoComplete="off"
        className={styles.input}
      />

      {isOpen && (isLoading || results.length > 0) && (
        <ul className={styles.dropdown}>
          {isLoading && <li className={styles.loading}>در حال جستجو...</li>}

          {results.map((destination) => (
            <li key={destination.id}>
              <button
                type="button"
                className={styles.item}
                onClick={() => handleSelect(destination)}
              >
                <IconArrowLeft
                  className={styles.chevron}
                  width={20}
                  height={20}
                  aria-hidden
                />
                <span className={styles.itemText}>
                  <span className={styles.itemName}>{destination.label}</span>
                  <span className={styles.itemSubtitle}>
                    {destination.type === "hotel"
                      ? destination.cityName
                      : destination.province}
                  </span>
                </span>
                {destination.type === "hotel" ? (
                  <IconHotel
                    className={styles.typeIcon}
                    width={20}
                    height={20}
                    aria-hidden
                  />
                ) : (
                  <IconLocation
                    className={styles.typeIcon}
                    width={20}
                    height={20}
                    aria-hidden
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
