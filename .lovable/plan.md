# Employee Self-Serve X Account Tracking

Let 100+ employees sign up on their own, add and track their own X accounts, and upload weekly screenshots — without manual approval. Gated by a shared invite code so strangers can't just wander in.

## User flow

1. Employee visits `/employee/login`, enters name + email + password + **invite code**.
2. If code matches, account is auto-created and `employee` role granted via a secure server function.
3. Employee lands on `/employee` — sees only their own X accounts, can add new ones (same simplified flow: username + pinned post screenshot), and upload weekly screenshots.
4. They see views and views gained. **No payout, rate, or commission info anywhere.**
5. Admin sees every employee's accounts in the existing admin panel with an "Added by" column (same pattern as managers).

## Database changes

- Add `'employee'` to the `app_role` enum.
- New table `employee_invite_codes` (code, active, created_at) — admin-managed. Server function verifies against active codes.
- Update RLS on `x_tracker_accounts`, `x_tracker_history`, `x_tracker_screenshots`:
  - Employees: SELECT/INSERT/UPDATE only where `added_by_user_id = auth.uid()`.
  - Admins: unchanged (see all).
  - Managers: unchanged (see own).

## Auth setup

- Enable email/password signup in Supabase auth.
- **Auto-confirm email = ON** (no email verification friction for 100+ employees).
- No Supabase admin approval; the invite code is the gate.

## Server function: `redeemInviteAndSignup`

- Input: email, password, name, invite_code.
- Verifies invite code against `employee_invite_codes` (active only).
- Creates auth user via admin client, grants `employee` role in `user_roles`.
- Returns success/failure. Client then signs in normally.
- Rate-limited per IP to prevent code brute-forcing (simple in-memory or table-based counter).

## Frontend

- **New route `/employee/login`**: combined sign-in + sign-up tabs. Sign-up form has invite code field.
- **New route `/employee`** (under `_authenticated`): employee dashboard.
  - Lists their X accounts (username, current views, views gained since last, last updated).
  - "Add account" button — reuses simplified flow (X username + pinned post + screenshot upload, OCR extracts starting views).
  - "Upload weekly screenshot" per account.
  - No payout/rate/commission fields shown anywhere.
- **Admin panel**: existing "Added by" column already handles this; employee emails will show alongside managers. Optionally add role badge (M/E) to distinguish.
- Admin gets a small "Invite codes" mini-panel to create/rotate codes.

## Technical notes

- Employee dashboard reuses `XTrackerPanel` logic but stripped down — cleaner to make a dedicated `EmployeePanel.tsx` that shares the AccountForm and ScreenshotUploadModal sub-components with payout props hidden.
- `has_role(auth.uid(), 'employee')` used in RLS and route guards.
- Admin `list_managers()` RPC pattern extended with `list_employees()` for admin visibility.
- Invite code is a shared secret; you can rotate it by deactivating old codes and creating new ones. Compromise recovery = rotate + review recently added accounts.

## Security considerations

- Invite code is a soft gate — anyone with the code can sign up. That's the trade-off for zero manual approval. Rotate periodically.
- Employees are fully isolated by RLS — one employee cannot see or modify another's accounts.
- All payout logic remains server-side and gated behind admin/manager roles.
