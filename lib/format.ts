/**
 * Money in and money out. Amounts are stored and summed in pence (integers) so 12.50 never turns
 * into 12.499999, and are shown through one formatter so every figure on the page reads the same.
 *
 * The formatter is constructed with an explicit locale, so the server and the browser render
 * identical strings — no hydration mismatch.
 */
const currencyFormatter = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

/** `1250` (pence) → `£12.50`. */
export function formatCents(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

/**
 * What the visitor typed → pence, or `null` with the reason it was refused. Accepts `12.50`,
 * `12.5`, `£12.50`, `1,250` and `1,250.00`; refuses anything that is not a positive amount of at
 * most two decimal places.
 */
export function parseAmountToCents(input: string): { cents: number } | { error: string } {
  const raw = input.trim().replace(/^£\s*/, "").replace(/,/g, "");
  if (raw === "") return { error: "Enter an amount." };
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    return { error: raw.includes(".")
      ? "Use a number with at most two decimal places, like 12.50."
      : "Enter a number, like 12.50." };
  }
  const [units, decimals = ""] = raw.split(".");
  const pence = decimals.padEnd(2, "0");
  const cents = Number(units) * 100 + Number(pence);
  if (!Number.isSafeInteger(cents) || cents <= 0) return { error: "The amount must be more than zero." };
  return { cents };
}
