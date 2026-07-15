
CREATE TABLE public.payout_wallets (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  usdt_address TEXT NOT NULL DEFAULT '',
  network TEXT NOT NULL DEFAULT 'TRC20',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payout_wallets TO authenticated;
GRANT ALL ON public.payout_wallets TO service_role;

ALTER TABLE public.payout_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own wallet"
  ON public.payout_wallets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
  ON public.payout_wallets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_payout_wallets_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_payout_wallets_touch
  BEFORE UPDATE ON public.payout_wallets
  FOR EACH ROW EXECUTE FUNCTION public.touch_payout_wallets_updated_at();

DROP FUNCTION IF EXISTS public.list_employees();

CREATE OR REPLACE FUNCTION public.list_employees()
RETURNS TABLE(user_id uuid, email text, account_count bigint, weekly_views bigint, usdt_address text, usdt_network text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT
    u.id,
    u.email::text,
    COALESCE(c.cnt, 0)::bigint,
    COALESCE(c.wv, 0)::bigint,
    COALESCE(w.usdt_address, '')::text,
    COALESCE(w.network, '')::text
  FROM auth.users u
  JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'employee'
  LEFT JOIN (
    SELECT added_by_user_id, count(*) AS cnt,
           sum(GREATEST(0, current_views - weekly_starting_views)) AS wv
    FROM public.x_tracker_accounts
    GROUP BY added_by_user_id
  ) c ON c.added_by_user_id = u.id
  LEFT JOIN public.payout_wallets w ON w.user_id = u.id
  WHERE public.has_role(auth.uid(), 'admin');
$function$;
