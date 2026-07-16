import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => {
    if (!input?.userId || typeof input.userId !== "string") throw new Error("userId required");
    return input;
  })
  .handler(async ({ data, context }) => {
    // Verify caller is an admin (RLS-scoped check)
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uid = data.userId;

    // Clean up app data (auth.users delete may not cascade to all tables)
    await supabaseAdmin.from("x_tracker_screenshots").delete().eq("uploaded_by_user_id", uid);
    await supabaseAdmin.from("x_tracker_history").delete().eq("added_by_user_id", uid);
    await supabaseAdmin.from("x_tracker_accounts").delete().eq("added_by_user_id", uid);
    await supabaseAdmin.from("payout_wallets").delete().eq("user_id", uid);
    await supabaseAdmin.from("employee_managers").delete().eq("user_id", uid);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (delErr) throw new Error(delErr.message);

    return { ok: true };
  });
