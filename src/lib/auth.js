import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Mengambil user yang sedang login beserta profilnya (role, nama, dll).
// cache() membuat data ini cukup diambil sekali per request.
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nama, nim, email, no_hp, role")
    .eq("id", user.id)
    .single();

  return { supabase, user, profile };
});

// Dipakai di halaman yang wajib login
export async function requireUser() {
  const session = await getSession();
  if (!session.user) redirect("/login");
  return session;
}

// Dipakai di halaman khusus admin
export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile?.role !== "admin") redirect("/dashboard");
  return session;
}
