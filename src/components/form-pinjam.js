"use client";

import { useActionState } from "react";
import { catatPinjam } from "@/app/admin/peminjaman/actions";
import Pesan from "@/components/pesan";

export default function FormPinjam({ anggota, buku, jatuhTempo, maksPinjam }) {
  const [state, formAction, pending] = useActionState(catatPinjam, null);
  const v = state?.values ?? {};

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div>
        <h2 className="font-semibold">Catat Peminjaman Baru</h2>
        <p className="text-sm text-slate-500">
          Jatuh tempo otomatis: <b>{jatuhTempo}</b> · maksimal {maksPinjam} buku per anggota
        </p>
      </div>

      {state?.error && <Pesan jenis="gagal">{state.error}</Pesan>}

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Anggota</span>
          <select
            name="member_id"
            defaultValue={v.member_id ?? ""}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            <option value="" disabled>
              Pilih anggota...
            </option>
            {anggota.map((a) => (
              <option key={a.id} value={a.id} disabled={a.aktif >= maksPinjam}>
                {a.nama}
                {a.nim ? ` (${a.nim})` : ""} · pinjam {a.aktif}/{maksPinjam}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Buku</span>
          <select
            name="book_id"
            defaultValue={v.book_id ?? ""}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            <option value="" disabled>
              Pilih buku...
            </option>
            {buku.map((b) => (
              <option key={b.id} value={b.id}>
                {b.judul} · stok {b.stok}
              </option>
            ))}
          </select>
        </label>

        <button
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Pinjamkan"}
        </button>
      </div>

      {anggota.length === 0 && (
        <p className="text-sm text-amber-700">
          Belum ada anggota. Minta anggota mendaftar lewat halaman Daftar.
        </p>
      )}
    </form>
  );
}
