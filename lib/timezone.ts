export const SYDNEY_TZ = 'Australia/Sydney';

/** Returns today's date in Sydney timezone as YYYY-MM-DD */
export function getSydneyDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SYDNEY_TZ });
}

/** Returns the current hour (0–23) in Sydney timezone */
export function getSydneyHour(): number {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: SYDNEY_TZ,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  return parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
}

/** Returns day-of-week index (0=Sun … 6=Sat) for a YYYY-MM-DD date string */
export function getDayOfWeek(dateStr: string): number {
  // Noon UTC is always within the same calendar day everywhere, so UTC day == calendar day
  return new Date(dateStr + 'T12:00:00Z').getUTCDay();
}

/** Format a UTC timestamp string for display in Sydney timezone */
export function formatSydneyDate(utcString: string): string {
  return new Date(utcString).toLocaleDateString('en-AU', {
    timeZone: SYDNEY_TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
