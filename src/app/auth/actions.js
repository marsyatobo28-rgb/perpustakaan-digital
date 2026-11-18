"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!email || !password) {
    return { error: "Email dan password wajib diisi.", values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error: "Email belum diverifikasi. Cek kotak masuk email kamu.",
        values,
      };
    }
    return { error: "Email atau password salah.", values };
  }

  redirect("/dashboard");
}

export async function daftar(prevState, formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const nim = String(formData.get("nim") ?? "").trim();
  const no_hp = String(formData.get("no_hp") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const konfirmasi = String(formData.get("konfirmasi") ?? "");
  const values = { nama, nim, no_hp, email };

  if (!nama || !email || !password) {
    return { error: "Nama, email, dan password wajib diisi.", values };
  }
  if (password.length < 6) {
    return { error: "Password minimal 6 karakter.", values };
  }
  if (password !== konfirmasi) {
    return { error: "Konfirmasi password tidak sama.", values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Data ini dibaca trigger handle_new_user untuk mengisi tabel profiles
    options: { data: { nama, nim, no_hp } },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "Email ini sudah terdaftar. Silakan masuk.", values };
    }
    return { error: `Pendaftaran gagal: ${error.message}`, values };
  }

  // Kalau verifikasi email masih aktif di Supabase, belum ada sesi login
  if (!data.session) {
    return {
      success:
        "Pendaftaran berhasil! Cek email untuk verifikasi, lalu masuk dengan akunmu.",
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
