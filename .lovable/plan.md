## Make USDT wallet addresses visible in the admin dashboard

Right now the crypto address only shows after you drill into a specific employee (Admin → Employees → click a name → info card). It's also hidden behind an email match, so if the account's `employee_name` label doesn't equal the auth email, it renders as "—". That's why it looks like the address isn't anywhere.

### Changes (all in `src/components/admin/XTrackerPanel.tsx`)

1. **Employees tab — list view (`AdminEmployees`, ~line 2062):**
   - Add two columns to the summary table: `USDT address` (click-to-copy, monospace, truncated) and `Network`.
   - Resolve the wallet by joining accounts → employees via `added_by_user_id` → `employees.user_id` (not by email match), so it works even when the contact name differs from the auth email.

2. **Employees tab — detail view (~line 2107):**
   - Use the same user-id-based lookup for `USDT address` / `Network` so it stops falling back to "—" when the label doesn't match the auth email.
   - Make the address click-to-copy.

3. **Payroll tab (`AdminPayroll`, ~line 2174):**
   - Add a `USDT address` column next to Employee so you can copy the address at payout time without leaving the tab.

4. **Overview tab (`AdminOverview`, ~line 1988):**
   - Add a compact `USDT` column (short form: first 6 + last 4 chars, click-to-copy, tooltip with full address) so admins can spot missing wallets at a glance.

No database, RLS, employee dashboard, or manager dashboard changes — this is purely surfacing existing `payout_wallets` data in more admin views.