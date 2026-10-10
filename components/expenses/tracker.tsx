"use client";

import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { SpendingChart } from "@/components/expenses/spending-chart";
import { DataCard } from "@/components/expenses/data-card";
import { database, type Expense } from "@/lib/db";
import { listExpensesInMonth } from "@/lib/data/expenses";
import { useStorageStatus, useIsHydrated, useStoredQuery } from "@/lib/storage/react";
import { getCategory } from "@/lib/categories";
import { formatCents } from "@/lib/format";
import {
  compareMonths,
  currentMonthKey,
  formatMonth,
  isSameMonth,
  shiftMonth,
  type MonthKey,
} from "@/lib/months";

/**
 * The whole tracker, one client island on an otherwise server-rendered page. The month being viewed
 * starts at the current month once the browser has hydrated — the server never reads the clock —
 * and every figure below it comes from the same live query, so an add or a delete updates the
 * summary, the chart and the list in the same moment.
 */
export function ExpenseTracker() {
  const hydrated = useIsHydrated();
  const status = useStorageStatus(database);
  const [viewed, setViewed] = useState<MonthKey | null>(null);

  const month = viewed ?? (hydrated ? currentMonthKey() : null);
  const today = hydrated ? currentMonthKey() : null;
  const isLatest = month !== null && today !== null && compareMonths(month, today) >= 0;

  const { data, isLoading } = useStoredQuery(
    database,
    () => (month ? listExpensesInMonth(month) : Promise.resolve([] as Expense[])),
    [month?.year, month?.month],
  );

  const summary = useMemo(() => {
    const rows = data ?? [];
    const totals = new Map<string, number>();
    let totalCents = 0;
    for (const expense of rows) {
      totalCents += expense.amountCents;
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amountCents);
    }
    let top: { label: string; color: string; cents: number } | null = null;
    for (const [id, cents] of totals) {
      if (!top || cents > top.cents) top = { label: getCategory(id).label, color: getCategory(id).color, cents };
    }
    return { totalCents, count: rows.length, top };
  }, [data]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-10">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Monthly spending</h1>
        <p className="text-sm text-muted-foreground">
          What you spend, month by month, kept in this browser.
        </p>
      </header>

      {status === "memory" && (
        <Alert>
          <AlertTitle>This browser will not keep your data</AlertTitle>
          <AlertDescription>
            It refused to store anything, so your expenses last only until this tab closes. Export
            them to a file if you want to keep them.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add an expense</CardTitle>
          <CardDescription>The amount, what it was for, and when.</CardDescription>
        </CardHeader>
        <CardContent>
          {month ? (
            <ExpenseForm viewedMonth={month} />
          ) : (
            <Skeleton className="h-56 w-full" />
          )}
        </CardContent>
      </Card>

      <section aria-label="Month view" className="grid gap-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-w-24"
            disabled={!month}
            onClick={() => setViewed(month ? shiftMonth(month, -1) : null)}
          >
            ← Previous
          </Button>
          <h2 className="text-center text-base font-semibold tabular-nums" aria-live="polite">
            {month ? formatMonth(month) : "…"}
          </h2>
          <Button
            type="button"
            variant="outline"
            className="min-w-24"
            disabled={!month || isLatest}
            onClick={() => setViewed(month ? shiftMonth(month, 1) : null)}
          >
            Next →
          </Button>
        </div>

        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between sm:space-y-0">
            <div className="grid gap-1">
              <CardDescription className="text-sm">Spent this month</CardDescription>
              {isLoading || !month ? (
                <Skeleton className="h-10 w-36" />
              ) : (
                <p className="text-4xl font-semibold tabular-nums tracking-tight">
                  {formatCents(summary.totalCents)}
                </p>
              )}
            </div>
            <div className="flex gap-6">
              <div className="grid gap-1">
                <CardDescription className="text-sm">Expenses</CardDescription>
                {isLoading || !month ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-semibold tabular-nums">{summary.count}</p>
                )}
              </div>
              <div className="grid gap-1">
                <CardDescription className="text-sm">Biggest category</CardDescription>
                {isLoading || !month ? (
                  <Skeleton className="h-8 w-24" />
                ) : summary.top ? (
                  <p className="flex items-center gap-2 text-2xl font-semibold">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: summary.top.color }}
                    />
                    {summary.top.label}
                  </p>
                ) : (
                  <p className="text-2xl font-semibold text-muted-foreground">None yet</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by category</CardTitle>
            <CardDescription>Each category with spending, largest first.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !month ? (
              <Skeleton className="h-[240px] w-full" />
            ) : summary.count === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nothing spent in {formatMonth(month)} yet. Add an expense above and it will show up
                here.
              </p>
            ) : (
              <SpendingChart expenses={data ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses in {month ? formatMonth(month) : "…"}</CardTitle>
            {isLoading || !month ? null : (
              <CardDescription>
                {summary.count} expense{summary.count === 1 ? "" : "s"} ·{" "}
                {formatCents(summary.totalCents)} in total
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isLoading || !month ? (
              <div className="grid gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : summary.count === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No expenses in {formatMonth(month)} — the total is {formatCents(0)} across{" "}
                {0} expense{0 === 1 ? "" : "s"}.
              </p>
            ) : (
              <ExpenseList expenses={data ?? []} />
            )}
          </CardContent>
        </Card>
      </section>

      <DataCard database={database} />
    </main>
  );
}