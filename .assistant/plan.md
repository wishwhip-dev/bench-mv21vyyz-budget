# Plan

Goal: A monthly spending tracker. I add an expense with an amount, a category (food, transport, home, fun or other) and a date, and see this month's total and a chart of spending by category. I can switch to earlier months and delete an expense I got wrong. Everything survives a reload and is comfortable on a phone.

1. The home page shows an 'Add expense' form with a labelled amount input, a category select offering exactly food, transport, home, fun and other, a date input defaulting to today, and a submit button named 'Add expense'; submitting it with a valid amount and category visibly adds the expense to the page
2. The expense form can be used from the home page opened directly by its URL, with no sign-in, URL parameter or prior navigation
3. Below the form, the current month shows a large readout of the total spent, the number of expenses, and the category with the highest spend this month
4. A chart (built with the shipped Recharts wrapper) shows spending by category for the month being viewed, with one bar or segment per category that has spending and a labelled amount for each; a month with spending in only one category still renders a readable chart, not a blank area
5. A list or table shows each expense of the viewed month with its date, category, amount and a 'Delete' button; pressing 'Delete' removes that row from the page immediately, shows a confirmation toast, and the month total, expense count and chart update at the same moment
6. Month navigation with 'Previous' and 'Next' month controls switches the total, chart and expense list to another calendar month, and the month being viewed is named on screen; 'Next' is disabled or absent on months after the current one
7. An expense dated in a past or future month is filed under its own calendar month: after switching to that month its total, chart and list include it, and it never appears in the month being viewed when it was added
8. The 5 categories are defined in a data module (with display names and colours) in lib/, separate from the chart and form components that use them
9. Adding an expense writes it to the provided Dexie database and deleting removes it from there; after adding an expense and reloading the page, the expense, the month total and the chart are all still correct
10. Months with no expenses show an empty state saying so, with the total shown as zero and the count shown as zero, rather than a blank area
11. A month with many expenses (20 or more) renders every row in the list without breaking the layout, and its total equals the sum of the listed amounts
12. The layout is usable at phone width: the form, total, chart and expense list stack in a single column, controls are at least 32px tall, and the whole page can be used without horizontal scrolling
13. app/identity.ts is updated with a name and description matching the spending tracker, and the page title reflects it
14. Amounts are entered and displayed as currency values with two decimal places handled correctly (e.g. 12.50), and submitting the form with an empty amount, a non-numeric amount or an amount of zero or less shows a validation message instead of adding a broken row

These are the outcomes this task is judged against.