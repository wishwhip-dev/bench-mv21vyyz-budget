/**
 * The five spending categories, defined once here so the form, the chart and the list all read
 * the same truth. Colours are the project's themed chart tokens (`app/globals.css`), so everything
 * that paints a category follows the palette.
 */
export type CategoryId = "food" | "transport" | "home" | "fun" | "other";

export type Category = {
  id: CategoryId;
  label: string;
  /** A CSS colour, always one of the themed chart tokens. */
  color: string;
};

export const CATEGORIES: readonly Category[] = [
  { id: "food", label: "Food", color: "var(--chart-1)" },
  { id: "transport", label: "Transport", color: "var(--chart-2)" },
  { id: "home", label: "Home", color: "var(--chart-3)" },
  { id: "fun", label: "Fun", color: "var(--chart-4)" },
  { id: "other", label: "Other", color: "var(--chart-5)" },
] as const;

const CATEGORY_BY_ID = new Map<string, Category>(CATEGORIES.map((category) => [category.id, category]));

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORY_BY_ID.has(value);
}

export function getCategory(id: string): Category {
  return CATEGORY_BY_ID.get(id) ?? CATEGORY_BY_ID.get("other")!;
}
