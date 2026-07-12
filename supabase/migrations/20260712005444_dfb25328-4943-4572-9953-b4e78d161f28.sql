
CREATE TABLE public.x_manager_commission_baseline (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  paid_baseline_cents bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.x_manager_commission_baseline TO authenticated;
GRANT ALL ON public.x_manager_commission_baseline TO service_role;
ALTER TABLE public.x_manager_commission_baseline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads baselines" ON public.x_manager_commission_baseline
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin writes baselines" ON public.x_manager_commission_baseline
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.list_managers()
RETURNS TABLE(user_id uuid, email text, paid_baseline_cents bigint)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT u.id, u.email::text, COALESCE(b.paid_baseline_cents, 0)::bigint
  FROM auth.users u
  JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'manager'
  LEFT JOIN public.x_manager_commission_baseline b ON b.user_id = u.id
  WHERE public.has_role(auth.uid(), 'admin');
$$;
GRANT EXECUTE ON FUNCTION public.list_managers() TO authenticated;

CREATE OR REPLACE FUNCTION public.reset_manager_commission(_manager uuid, _lifetime_cents bigint)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  INSERT INTO public.x_manager_commission_baseline (user_id, paid_baseline_cents, updated_at)
  VALUES (_manager, _lifetime_cents, now())
  ON CONFLICT (user_id) DO UPDATE SET paid_baseline_cents = EXCLUDED.paid_baseline_cents, updated_at = now();
END;
$$;
GRANT EXECUTE ON FUNCTION public.reset_manager_commission(uuid, bigint) TO authenticated;
