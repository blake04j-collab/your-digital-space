
CREATE OR REPLACE FUNCTION public.get_my_manager_commission()
RETURNS TABLE(lifetime_commission_cents bigint, paid_baseline_cents bigint, unpaid_commission_cents bigint)
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  lifetime_pay bigint := 0;
  baseline bigint := 0;
  commission bigint;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  SELECT COALESCE(SUM((GREATEST(0, current_views - weekly_starting_views) * rate_cents_per_1k) / 1000), 0)
    INTO lifetime_pay
    FROM public.x_tracker_accounts WHERE added_by_user_id = uid;
  lifetime_pay := lifetime_pay + COALESCE((
    SELECT SUM(h.weekly_pay_cents)
    FROM public.x_tracker_history h
    JOIN public.x_tracker_accounts a ON a.id = h.account_id
    WHERE a.added_by_user_id = uid
  ), 0);
  commission := ROUND(lifetime_pay * 0.10);
  SELECT COALESCE(b.paid_baseline_cents, 0) INTO baseline
    FROM public.x_manager_commission_baseline b WHERE b.user_id = uid;
  RETURN QUERY SELECT commission, baseline, GREATEST(0::bigint, commission - baseline);
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_manager_commission() TO authenticated;
