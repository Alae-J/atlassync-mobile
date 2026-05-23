/**
 * Receipt-screen date formatting. Receipts are about "when did this trip
 * happen and how long did it take?", so the format is friendly-day + clock
 * + duration rather than ISO.
 */

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatTripRange(startIso: string, endIso: string | null): string {
  const start = new Date(startIso);
  const datePart = `${DAY_SHORT[start.getDay()]} ${start.getDate()} ${MONTH_SHORT[start.getMonth()]}`;
  const startClock = clock(start);
  if (!endIso) return `${datePart} · ${startClock}`;
  const end = new Date(endIso);
  const endClock = clock(end);
  const duration = formatDuration(end.getTime() - start.getTime());
  return `${datePart} · ${startClock} → ${endClock} · ${duration}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

function clock(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${meridiem}`;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}
