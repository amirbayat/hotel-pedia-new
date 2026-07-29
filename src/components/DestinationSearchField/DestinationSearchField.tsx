import { useEffect, useRef, useState } from 'react'
import { searchDestinations, type Destination } from '../../api/destinations'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { Input } from '../Input'
import { IconArrowLeft, IconPin, IconSearch } from '../icons'
import styles from './DestinationSearchField.module.scss'

export interface DestinationSearchFieldProps {
  className?: string
  onSelect?: (destination: Destination) => void
}

/** "مقصد یا هتل" field — debounced destination search with a suggestions dropdown. */
export function DestinationSearchField({ className, onSelect }: DestinationSearchFieldProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Destination[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebouncedValue(query.trim(), 350)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      setIsOpen(false)
      return
    }

    const controller = new AbortController()
    setIsLoading(true)

    searchDestinations(debouncedQuery, controller.signal)
      .then((destinations) => {
        setResults(destinations)
        setIsOpen(true)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setResults([])
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [debouncedQuery])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handleSelect(destination: Destination) {
    setQuery(destination.name)
    setIsOpen(false)
    onSelect?.(destination)
  }

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')} ref={wrapperRef}>
      <Input
        label="مقصد یا هتل"
        placeholder="مقصد یا هتل مورد نظر را وارد کنید"
        hint={isLoading ? 'در حال جستجو...' : undefined}
        leadingIcon={IconSearch}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        autoComplete="off"
      />

      {isOpen && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((destination) => (
            <li key={destination.id}>
              <button type="button" className={styles.item} onClick={() => handleSelect(destination)}>
                <IconArrowLeft className={styles.chevron} width={20} height={20} aria-hidden />
                <span className={styles.itemText}>
                  <span className={styles.itemName}>{destination.name}</span>
                  <span className={styles.itemCountry}>{destination.country}</span>
                </span>
                <IconPin className={styles.pin} width={20} height={20} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
