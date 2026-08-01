import { toPersianDigits } from '../../lib/date/jalali'
import { IconArrowLeft, IconArrowRight } from '../icons'
import styles from './Pagination.module.scss'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

const SIBLING_COUNT = 1

function buildPageList(page: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = []
  const start = Math.max(2, page - SIBLING_COUNT)
  const end = Math.min(totalPages - 1, page + SIBLING_COUNT)

  pages.push(1)
  if (start > 2) pages.push('ellipsis')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < totalPages - 1) pages.push('ellipsis')
  if (totalPages > 1) pages.push(totalPages)

  return pages
}

/** Standard numbered pagination — placed at the bottom of the hotel list (no dedicated Figma frame was available). */
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageList(page, totalPages)

  return (
    <nav className={[styles.pagination, className].filter(Boolean).join(' ')} aria-label="صفحه‌بندی">
      <button
        type="button"
        className={styles.navButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="صفحه قبل"
      >
        <IconArrowRight width={20} height={20} />
      </button>

      {pages.map((entry, index) =>
        entry === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            ...
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            className={[styles.pageButton, entry === page && styles.pageButtonActive].filter(Boolean).join(' ')}
            onClick={() => onPageChange(entry)}
            aria-current={entry === page ? 'page' : undefined}
          >
            {toPersianDigits(entry)}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.navButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="صفحه بعد"
      >
        <IconArrowLeft width={20} height={20} />
      </button>
    </nav>
  )
}
