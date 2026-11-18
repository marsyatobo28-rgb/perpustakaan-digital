"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/auth/actions";
import Field from "@/components/field";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Masuk</h1>
        <p className="mt-1 text-sm text-slate-500">
          Masuk sebagai admin atau anggota perpustakaan.
        </p>

        {state?.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <Field
            label="Email"
            name="email"
            type="email"
            defaultValue={state?.values?.email}
            required
          />
          <Field label="Password" name="password" type="password" required />
          <button
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold text-indigo-700">
            Daftar sebagai anggota
          </Link>
        </p>
      </div>
    </div>
  );
}
