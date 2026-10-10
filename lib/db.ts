/**
 * This application's database.
 *
 * The reusable half of the setup is in `lib/storage/` and is not edited. This file is the half
 * that describes the product: which tables exist, what is indexed, and what a first visit starts
 * with.
 *
 * Amounts are stored as whole pence so `12.50` survives summing exactly; `date` is a `YYYY-MM-DD`
 * string and is indexed, because every screen reads one calendar month of it.
 */
import { defineDatabase } from "@/lib/storage/database";
import { isCategoryId, type CategoryId } from "@/lib/categories";

export type Expense = {
  id: string;
  /** Whole pence. Never a float. */
  amountCents: number;
  category: CategoryId;
  /** `YYYY-MM-DD`, in the visitor's own calendar. Indexed: the app reads one month at a time. */
  date: string;
  /** Epoch millis, for stable ordering of same-day entries. */
  createdAt: number;
};

/** Ids are generated here so the data layer never depends on an auto-increment round trip. */
export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function withinMonthsAgo(monthsBack: number, day: number, category: string, pounds: number): Expense {
  const now = new Date();
  const anchor = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  return {
    id: `sample-${monthsBack}-${day}-${category}`,
    amountCents: Math.round(pounds * 100),
    category: isCategoryId(category) ? category : "other",
    date: `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`,
    createdAt: anchor.getTime() + day * 86_400_000,
  };
}

/** What a first visit opens to. An app that opens empty looks broken. */
const SAMPLE_EXPENSES: Expense[] = [
  withinMonthsAgo(0, 1, "food", 38.6),
  withinMonthsAgo(0, 3, "transport", 7.8),
  withinMonthsAgo(0, 4, "home", 62.0),
  withinMonthsAgo(0, 6, "fun", 24.5),
  withinMonthsAgo(0, 8, "food", 13.25),
  withinMonthsAgo(1, 12, "home", 45.99),
  withinMonthsAgo(1, 19, "food", 21.4),
  withinMonthsAgo(1, 25, "other", 9.99),
];

export const database = defineDatabase<{ expenses: Expense }>({
  // Part of the origin's storage identity. Renaming it does not migrate anything — it points the
  // application at a different, empty database and abandons the old one in place. That is exactly
  // what you want on a first build, and never what you want afterwards.
  name: "monthly-spending",
  versions: [
    // Only the primary key and the properties queried on. `category` and `amountCents` are stored
    // but never filtered or sorted by, so indexing them would cost writes and buy nothing.
    { version: 1, stores: { expenses: "id, date" } },
  ],
  // Written once, inside `ready()`, in one transaction with its own marker. Do not hand-roll this:
  // no `meta` table, no flag, no promise to dedupe a double mount — see `docs/storage.md`.
  seed: {
    tables: ["expenses"],
    run: async (db) => { await db.expenses.bulkAdd(SAMPLE_EXPENSES); },
  },
});
