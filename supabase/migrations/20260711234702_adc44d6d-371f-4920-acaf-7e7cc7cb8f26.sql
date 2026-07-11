
ALTER TABLE public.x_tracker_accounts
  ADD COLUMN IF NOT EXISTS previous_views bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_gained_since_last bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payout_owed_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_refresh_at timestamptz;
