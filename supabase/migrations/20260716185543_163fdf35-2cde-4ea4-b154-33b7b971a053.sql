
ALTER TABLE public.x_tracker_accounts
  ADD COLUMN IF NOT EXISTS pinned_post_date date;

CREATE TABLE IF NOT EXISTS public.x_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid REFERENCES public.x_tracker_accounts(id) ON DELETE SET NULL,
  employee_name text NOT NULL DEFAULT '',
  x_username text NOT NULL DEFAULT '',
  period_start date,
  period_end date,
  views_paid bigint NOT NULL DEFAULT 0,
  amount_cents bigint NOT NULL DEFAULT 0,
  manager_commission_cents bigint NOT NULL DEFAULT 0,
  paid_at timestamptz NOT NULL DEFAULT now(),
  marked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.x_payments TO authenticated;
GRANT ALL ON public.x_payments TO service_role;

ALTER TABLE public.x_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage x_payments" ON public.x_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS x_payments_account_idx ON public.x_payments(account_id, paid_at DESC);
