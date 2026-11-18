import Link from "next/link";
import { getSession } from "@/lib/auth";

const FITUR = [
  {
    ikon: "🔎",
    judul: "Katalog Online",
    isi: "Cari buku berdasarkan judul, penulis, atau kategori kapan saja.",
  },
  {
    ikon: "🔄",
    judul: "Peminjaman & Pengembalian",
    isi: "Masa pinjam 7 hari dengan denda keterlambatan dihitung otomatis.",
  },
  {
    ikon: "📊",
    judul: "Laporan Perpustakaan",
    isi: "Rekap peminjaman, buku terpopuler, dan denda dalam satu halaman.",
  },
];

export default async function Home() {
  const { supabase, user } = await getSession();
  const { count } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-16 text-center text-white sm:px-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">
          Berbasis Cloud
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
          Perpustakaan Digital
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
          Cari, pinjam, dan kelola koleksi buku dari mana saja. Dibangun dengan
          Next.js, Supabase, dan Vercel.
        </p>
        <p className="mt-6 text-lg font-semibold">
          {count ?? 0} judul buku tersedia
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/katalog"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Lihat Katalog
          </Link>
          <Link
            href={user ? "/dashboard" : "/login"}
            className="rounded-xl border border-white/60 px-5 py-3 font-semibold text-white hover:bg-white/10"
          >
            {user ? "Ke Dashboard" : "Masuk"}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FITUR.map((f) => (
          <div
            key={f.judul}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="text-3xl" aria-hidden>
              {f.ikon}
            </div>
            <h2 className="mt-3 font-semibold">{f.judul}</h2>
            <p className="mt-1 text-sm text-slate-500">{f.isi}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
