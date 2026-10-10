"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteExpense, putExpense } from "@/lib/data/expenses";
import type { Expense } from "@/lib/db";
import { getCategory } from "@/lib/categories";
import { formatCents } from "@/lib/format";
import { formatDay } from "@/lib/months";

/**
 * Every expense of the month being viewed, most recent first. Deleting removes the row at once —
 * the total, the count and the chart above read the same live query — and the toast offers Undo,
 * which puts the exact row that was removed back.
 */
export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const onDelete = async (expense: Expense) => {
    try {
      await deleteExpense(expense.id);
      toast.success(`Deleted ${formatCents(expense.amountCents)} for ${getCategory(expense.category).label}.`, {
        action: {
          label: "Undo",
          onClick: () => {
            void putExpense(expense).catch((error: unknown) => {
              toast.error(`Could not restore it: ${error instanceof Error ? error.message : "unknown error"}`);
            });
          },
        },
      });
    } catch (error) {
      toast.error(`Could not delete it: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  };

  return (
    <ul className="grid gap-1" aria-label="Expenses this month">
      {expenses.map((expense) => {
        const category = getCategory(expense.category);
        return (
          <li
            key={expense.id}
            className="flex items-center gap-3 rounded-md px-2 py-2 sm:px-3 hover:bg-muted/60"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="w-14 shrink-0 text-sm text-muted-foreground tabular-nums">
              {formatDay(expense.date)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.label}</span>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatCents(expense.amountCents)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => void onDelete(expense)}
            >
              Delete
            </Button>
          </li>
        );
      })}
    </ul>
  );
}