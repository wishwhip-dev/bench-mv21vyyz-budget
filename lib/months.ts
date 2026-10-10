/**
 * Calendar-month arithmetic, counted by local calendar date. Dates are stored as `YYYY-MM-DD`
 * strings and months as `{ year, month }` (month 1–12), so nothing is ever divided by
 * milliseconds — midnight and daylight-saving changes cannot skip or repeat a day.
 */
export type MonthKey = { year: number; month: number };

/** Today in the browser's own calendar, as a `YYYY-MM-DD` string. Only call on the client. */
export function todayKey(): string {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function dateKey(year: number, monthIndex0: number, day: number): string {
  return `${year}-${String(monthIndex0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** The month containing today. Only call on the client. */
export function currentMonthKey(): MonthKey {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** `2026` / `10` → `2026-10`. */
export function monthId({ year, month }: MonthKey): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Negative steps go back. The day-of-month is clamped so 31 March − 1 month is 28/29 February. */
export function shiftMonth({ year, month }: MonthKey, steps: number): MonthKey {
  const zero = year * 12 + (month - 1) + steps;
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 };
}

export function isSameMonth(a: MonthKey, b: MonthKey): boolean {
  return a.year === b.year && a.month === b.month;
}

/** Earlier than, same as, or later than — for enabling and disabling the Next control. */
export function compareMonths(a: MonthKey, b: MonthKey): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

/** `2026` / `10` → `October 2026`. */
export function formatMonth({ year, month }: MonthKey): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

/** `2026-10-14` → `14 Oct`. */
export function formatDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
    new Date(year, month - 1, day),
  );
}

/**
 * The inclusive `YYYY-MM-DD` bounds of a month, for a lexicographic index range. Day `00` and day
 * `32` are never real dates, so the range catches every date in the month and nothing else.
 */
export function monthBounds({ year, month }: MonthKey): [string, string] {
  const id = monthId({ year, month });
  return [`${id}-00`, `${id}-32`];
}
