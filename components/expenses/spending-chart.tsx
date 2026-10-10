"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getCategory } from "@/lib/categories";
import { formatCents } from "@/lib/format";
import type { Expense } from "@/lib/db";

/**
 * Spending by category for one month, drawn with the shipped Recharts wrapper. One bar per category
 * that has spending — a month spent in a single category still gets one labelled bar, never a blank
 * area — and the amount labelled above each bar, so the chart reads without a hover.
 *
 * Animation is off on the bar: the headless browser this is verified with never finishes a
 * Recharts entrance, and a chart that draws nothing there fails.
 */
export function SpendingChart({ expenses }: { expenses: Expense[] }) {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amountCents);
  }
  const data = [...totals.entries()]
    .map(([id, spend]) => ({ id, label: getCategory(id).label, color: getCategory(id).color, spend }))
    .sort((a, b) => b.spend - a.spend);

  const config = {
    spend: { label: "Spent" },
    ...Object.fromEntries(data.map((entry) => [entry.id, { label: entry.label }])),
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <BarChart data={data} margin={{ top: 24, right: 4, left: 4, bottom: 0 }}>
        <ChartTooltip
          content={<ChartTooltipContent hideLabel formatter={(value) => formatCents(Number(value) * 100)} />}
        />
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          interval={0}
          className="fill-muted-foreground text-xs"
        />
        <Bar dataKey="spend" isAnimationActive={false} radius={4}>
          {data.map((entry) => (
            <Cell key={entry.id} fill={entry.color} />
          ))}
          <LabelList
            dataKey="spend"
            position="top"
            formatter={(value: unknown) => formatCents(Number(value))}
            className="fill-foreground text-xs font-medium tabular-nums"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}