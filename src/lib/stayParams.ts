import { addDaysIso, todayIso } from './date/jalali'

/** Default stay is 1 night: check-in today, check-out tomorrow. */
export function resolveStayDates(
  checkIn?: string | null,
  checkOut?: string | null,
): { from: string; to: string } {
  const from = checkIn || todayIso()
  const to = checkOut || addDaysIso(from, 1)
  return { from, to }
}

/** Appends today/tomorrow stay dates to in-app hotel URLs when they are missing. */
export function withDefaultStayParams(href: string): string {
  const { from, to } = resolveStayDates()

  try {
    const isRelative = href.startsWith('/')
    const url = isRelative ? new URL(href, 'https://hotelpedia.local') : new URL(href)
    if (!url.pathname.startsWith('/hotels')) return href
    if (!url.searchParams.get('check_in')) url.searchParams.set('check_in', from)
    if (!url.searchParams.get('check_out')) url.searchParams.set('check_out', to)
    return isRelative ? `${url.pathname}${url.search}${url.hash}` : url.toString()
  } catch {
    return href
  }
}
