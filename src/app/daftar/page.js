"use client";

import Link from "next/link";
import { useActionState } from "react";
import { daftar } from "@/app/auth/actions";
import Field from "@/components/field";

export default function DaftarPage() {
  const [state, formAction, pending] = useActionState(daftar, null);
  const v = state?.values ?? {};

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Daftar Anggota</h1>
        <p className="mt-1 text-sm text-slate-500">
          Buat akun untuk melihat riwayat peminjaman bukumu.
        </p>

        {state?.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.success}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <Field label="Nama lengkap" name="nama" defaultValue={v.nama} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="NIM" name="nim" defaultValue={v.nim} />
            <Field label="No. HP" name="no_hp" type="tel" defaultValue={v.no_hp} />
          </div>
          <Field label="Email" name="email" type="email" defaultValue={v.email} required />
          <Field label="Password (min. 6 karakter)" name="password" type="password" minLength={6} required />
          <Field label="Ulangi password" name="konfirmasi" type="password" minLength={6} required />
          <button
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-indigo-700">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
