/**
 * The app's expense queries. Components call these, never Dexie directly — see `docs/storage.md`.
 */
import { database, newId, type Expense } from "@/lib/db";
import { monthBounds, type MonthKey } from "@/lib/months";

const expenses = async () => (await database.ready()).expenses;

/** One calendar month, most recent day first, then newest entry first within a day. */
export async function listExpensesInMonth({ year, month }: MonthKey): Promise<Expense[]> {
  const [lower, upper] = monthBounds({ year, month });
  return (await expenses())
    .where("date")
    .between(lower, upper, true, true)
    .toArray()
    .then((rows) =>
      rows.sort((a, b) => (b.date === a.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date))),
    );
}

/** Add an expense, awaiting the write — a fire-and-forget add is a row that vanishes. */
export async function addExpense(input: {
  amountCents: number;
  category: Expense["category"];
  date: string;
}): Promise<Expense> {
  const expense: Expense = {
    id: newId(),
    amountCents: input.amountCents,
    category: input.category,
    date: input.date,
    createdAt: Date.now(),
  };
  await (await expenses()).add(expense);
  return expense;
}

/** Used by Undo after a delete, which must restore the very row that was removed. */
export async function putExpense(expense: Expense): Promise<void> {
  await (await expenses()).put(expense);
}

export async function deleteExpense(id: string): Promise<void> {
  await (await expenses()).delete(id);
}
