
## Goal

Reorganize the admin X-Tracker into cleaner, purpose-built views without changing any of the underlying logic (database, RLS, invite codes, 10% commission, $3/1k, account ownership, manager dashboard). This is a pure UI/organization refactor of `src/components/admin/XTrackerPanel.tsx` + a small addition to `admin.index.tsx` tab labels.

## New admin structure (admin-only view modes)

Manager and employee views stay exactly as they are today. For admins, replace the current single "Accounts / Team" combo with four clearly separated sub-views inside the X Tracker tab:

1. **Overview** (default)
2. **Employee detail** (opened by clicking an employee/row)
3. **Screenshot history**
4. **Payroll**

Managers continue to see the existing manager view only.

### 1. Overview dashboard

One flat table, one row per X account, columns:

- Employee name (link → Employee detail)
- Manager assigned (LUCAS / ALY / BLAKE badge)
- X username (link to profile)
- Pinned post date
- Days since pinned post started (computed from `pinned_post_date`)
- Current views
- Previous views
- Views gained (current − previous)
- Payment owed ($3/1k on views gained since `weekly_starting_views`)
- Last screenshot upload date
- Payment status (Pending / Paid — see payroll section)

Filters at top:
- Manager (LUCAS / ALY / BLAKE / All)
- Employee (searchable dropdown)
- Payment status (All / Pending / Paid)
- Sort by: Views gained, Payment owed, Last upload, Employee name

No new tracked data — everything is derived from existing `x_tracker_accounts` + `employee_managers` + `user_roles`. Payment status reads from a new lightweight `paid_at` marker (see Payroll).

### 2. Employee detail view

Clicking an employee opens a detail pane with three sections:

- **Employee information**: name (from auth email), Discord (if present in existing data — otherwise omitted, no new field), manager assigned, invite code used, date joined (`auth.users.created_at`).
- **X account information** (repeats per account they own): X username, profile link, pinned post link, pinned post start date.
- **View tracking** (per account): previous views, current views, views gained, payment calc, last screenshot date, plus the existing "upload screenshot" control unchanged.

### 3. Screenshot history

Already stored in `x_tracker_screenshots` and never overwritten. New dedicated view listing all uploads (filterable by employee / account) with columns:

- Screenshot date
- Extracted view count
- Views gained since previous screenshot
- Payment generated
- Thumbnail (existing signed URL)

### 4. Payroll

Table showing one row per account for the current payment period:

- Employee
- Manager
- Views generated this period (current − `weekly_starting_views`)
- Amount owed
- Manager commission (10% of amount owed)
- Payment status (Pending / Paid) + "Mark as paid" button

"Mark as paid" writes a row into a new tiny table `x_payments` (id, account_id, period_start, period_end, views_paid, amount_cents, manager_commission_cents, paid_at, marked_by). This is the ONLY new DB object; it does not change payout math or existing "Close week & reset" behavior — it just records that a period was settled so the Overview/Payroll can show Pending vs Paid.

### Manager dashboard

Untouched. Managers keep the current single "Accounts / Team" experience scoped by RLS.

## Implementation steps

1. Migration: create `public.x_payments` (+ GRANTs, RLS: admins full access, managers/employees no access) and a helper to fetch latest payment per account.
2. Refactor `XTrackerPanel.tsx`:
   - Split the admin branch into 4 sub-components (`OverviewTable`, `EmployeeDetail`, `ScreenshotHistory`, `Payroll`) driven by an internal `adminView` state with a sub-nav (segmented control).
   - Leave the manager and employee branches untouched.
   - Reuse existing data hooks; add derived selectors for filters/sort and "days since pinned".
3. In `admin.index.tsx`, keep the "X Tracker" tab; no other tab changes.
4. Verify with a quick Playwright pass that admin sees the new sub-nav and manager still sees the old view.

## Out of scope (per your instructions)

- No new tracked fields on accounts (Discord username is only shown if it already exists in current data; otherwise the row is omitted, not added as a new required field).
- No changes to $3/1k rate, 10% commission, invite codes, RLS, or manager dashboard.
- No changes to the weekly close/reset flow.
