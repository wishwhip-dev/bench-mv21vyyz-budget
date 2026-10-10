"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addExpense } from "@/lib/data/expenses";
import { CATEGORIES, getCategory, isCategoryId } from "@/lib/categories";
import { formatCents, parseAmountToCents } from "@/lib/format";
import { formatMonth, monthId, todayKey } from "@/lib/months";

/**
 * The add-expense form. The date defaults to today (computed only on the client, after hydration —
 * the server never reads the clock), and validation errors are shown beside the field they belong
 * to, never swallowed.
 */
export function ExpenseForm({ viewedMonth }: { viewedMonth: { year: number; month: number } }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("food");
  const [date, setDate] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const today = todayKey();
  const shownDate = date || today;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseAmountToCents(amount);
    if ("error" in parsed) {
      setAmountError(parsed.error);
      return;
    }
    setAmountError(null);
    if (!shownDate) {
      setDateError("Choose the date the expense was made.");
      return;
    }
    setDateError(null);
    if (!isCategoryId(category)) {
      setAmountError("Pick a category.");
      return;
    }
    setSaving(true);
    try {
      const expense = await addExpense({ amountCents: parsed.cents, category, date: shownDate });
      const filedUnder = monthId(viewedMonth);
      const where =
        expense.date.slice(0, 7) === filedUnder
          ? `${formatCents(expense.amountCents)} for ${getCategory(expense.category).label}`
          : `${formatCents(expense.amountCents)} for ${getCategory(expense.category).label}, filed under ${formatMonth({ year: Number(expense.date.slice(0, 4)), month: Number(expense.date.slice(5, 7)) })}`;
      toast.success(`Added ${where}.`);
      setAmount("");
    } catch (error) {
      toast.error(`Could not add the expense: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-[1fr_1fr]">
      <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount (£)</Label>
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={amountError ? true : undefined}
            aria-describedby={amountError ? "amount-error" : undefined}
            className="h-10 text-lg"
          />
          {amountError && (
            <p id="amount-error" role="alert" className="text-sm text-destructive">
              {amountError}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="h-10 text-lg">
              <SelectValue placeholder="Pick a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={shownDate}
          max="9999-12-31"
          onChange={(event) => {
            setDate(event.target.value);
            setDateError(null);
          }}
          aria-invalid={dateError ? true : undefined}
          aria-describedby={dateError ? "date-error" : undefined}
          className="h-10 text-lg"
        />
        {dateError && (
          <p id="date-error" role="alert" className="text-sm text-destructive">
            {dateError}
          </p>
        )}
      </div>
      <Button type="submit" disabled={saving} className="h-10 sm:col-span-2 sm:w-48">
        {saving ? "Adding…" : "Add expense"}
      </Button>
    </form>
  );
}