# Fix: employees (and managers) can't upload X account screenshots

## Root cause

The RLS error surfacing in the "Add X account" modal is coming from `storage.objects`, not `x_tracker_accounts`. The `x-screenshots` bucket currently has policies only for:

- `admin` — full access
- `manager` — upload only when an `x_tracker_accounts` row already exists with `added_by_user_id = auth.uid()` and a folder matching that account id

There is **no policy for `employee`** at all, so every employee upload fails RLS. The manager upload policy is also broken for the "add new account" flow because the code uploads the screenshot to `<newAccountId>/<ts>.jpg` **before** inserting the account row — so the `EXISTS` check finds nothing and blocks the upload for managers too on first-time add.

## Fix

One migration adding storage policies. The screenshot path is always `<accountId>/<file>`, and account ids are generated client-side then written into `added_by_user_id` on insert, so we scope storage access by role rather than by a pre-existing account row.

### Migration

Add to `storage.objects` for `bucket_id = 'x-screenshots'`:

- **Employees upload**: INSERT policy — `has_role(auth.uid(), 'employee')`
- **Employees read**: SELECT policy — `has_role(auth.uid(), 'employee')` (needed to sign URLs for their own screenshots)
- **Employees update/delete own**: for re-uploads/cleanup — owner = `auth.uid()`
- **Managers upload (fixed)**: replace the current INSERT policy with a simple `has_role(auth.uid(), 'manager')` check. Ownership is still enforced at the `x_tracker_accounts`/`x_tracker_screenshots` row level.
- **Managers read**: SELECT policy — `has_role(auth.uid(), 'manager')` (they already need to view their own + team screenshots).

Admin policies stay unchanged.

## Notes

- No frontend changes needed. The existing flow (upload → insert account → insert screenshot row) works once storage lets employees write.
- Row-level ownership on the actual tracker tables is unaffected — those policies already require `added_by_user_id = auth.uid()`, so an employee still can't create rows attributed to anyone else.
- Existing manager account/screenshot rows are unaffected.
