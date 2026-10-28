import { EventItem } from '@/types';

/**
 * Returns formatted date range for an event.
 * If startDate and endDate differ, displays as a date range (e.g. "2026-10-30 – 2026-11-01").
 * If they are the same or only one is provided, displays the single date.
 */
export function formatEventDateRange(
  event?: Partial<EventItem> | null,
  options?: { pretty?: boolean }
): string {
  if (!event) return '';

  const start = event.startDate || event.start_date || event.date || '';
  const end = event.endDate || event.end_date || start;

  if (!start) return '';
  if (!end || start === end) {
    if (options?.pretty) {
      return formatSingleDatePretty(start);
    }
    return start;
  }

  if (options?.pretty) {
    return formatDateRangePretty(start, end);
  }

  return `${start} – ${end}`;
}

/**
 * Checks whether an event spans across multiple distinct calendar days.
 */
export function isMultiDayEvent(event?: Partial<EventItem> | null): boolean {
  if (!event) return false;
  const start = event.startDate || event.start_date || event.date;
  const end = event.endDate || event.end_date;
  return Boolean(start && end && start !== end);
}

/**
 * Pretty formatting for a single date: "Oct 28, 2026"
 */
export function formatSingleDatePretty(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Pretty formatting for a date range: "Oct 30 – Nov 1, 2026"
 */
export function formatDateRangePretty(startDateStr: string, endDateStr: string): string {
  try {
    const startParts = startDateStr.split('-');
    const endParts = endDateStr.split('-');

    if (startParts.length === 3 && endParts.length === 3) {
      const startYear = parseInt(startParts[0], 10);
      const startMonth = parseInt(startParts[1], 10) - 1;
      const startDay = parseInt(startParts[2], 10);

      const endYear = parseInt(endParts[0], 10);
      const endMonth = parseInt(endParts[1], 10) - 1;
      const endDay = parseInt(endParts[2], 10);

      const d1 = new Date(startYear, startMonth, startDay);
      const d2 = new Date(endYear, endMonth, endDay);

      const m1 = d1.toLocaleDateString('en-US', { month: 'short' });
      const m2 = d2.toLocaleDateString('en-US', { month: 'short' });

      if (startYear === endYear) {
        if (startMonth === endMonth) {
          return `${m1} ${startDay} – ${endDay}, ${startYear}`;
        }
        return `${m1} ${startDay} – ${m2} ${endDay}, ${startYear}`;
      }
      return `${m1} ${startDay}, ${startYear} – ${m2} ${endDay}, ${endYear}`;
    }
    return `${startDateStr} – ${endDateStr}`;
  } catch {
    return `${startDateStr} – ${endDateStr}`;
  }
}
