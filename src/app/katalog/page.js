import Link from "next/link";
import { getSession } from "@/lib/auth";
import { bersihkanCari } from "@/lib/format";
import Cover from "@/components/cover";

export const metadata = { title: "Katalog | Perpustakaan Digital" };

export default async function KatalogPage({ searchParams }) {
  const params = await searchParams;
  const q = bersihkanCari(params.q);
  const kategori = String(params.kategori ?? "");
  const { supabase } = await getSession();

  let query = supabase
    .from("books")
    .select("id, judul, penulis, tahun, kategori, stok, cover_url")
    .order("judul");
  if (q) query = query.or(`judul.ilike.%${q}%,penulis.ilike.%${q}%`);
  if (kategori) query = query.eq("kategori", kategori);

  const [{ data: books, error }, { data: semua }] = await Promise.all([
    query,
    supabase.from("books").select("kategori"),
  ]);
  const daftarKategori = [...new Set((semua ?? []).map((b) => b.kategori))].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Katalog Buku</h1>
        <p className="text-slate-500">
          Cari koleksi berdasarkan judul, penulis, atau kategori.
        </p>
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul atau penulis..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <select
          name="kategori"
          defaultValue={kategori}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        >
          <option value="">Semua kategori</option>
          {daftarKategori.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700">
          Cari
        </button>
        {(q || kategori) && (
          <Link
            href="/katalog"
            className="rounded-lg px-4 py-2 text-center text-slate-600 hover:bg-slate-100"
          >
            Reset
          </Link>
        )}
      </form>

      {error && <p className="text-red-600">Gagal memuat katalog: {error.message}</p>}

      <p className="text-sm text-slate-500">{books?.length ?? 0} buku ditemukan</p>

      {books?.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Tidak ada buku yang cocok dengan pencarianmu.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {books?.map((b) => (
            <Link
              key={b.id}
              href={`/katalog/${b.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-3 hover:border-indigo-300 hover:shadow-md"
            >
              <Cover buku={b} />
              <div className="mt-3 space-y-1">
                <p className="line-clamp-2 font-semibold leading-snug group-hover:text-indigo-700">
                  {b.judul}
                </p>
                <p className="line-clamp-1 text-sm text-slate-500">{b.penulis}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                    {b.kategori}
                  </span>
                  {b.stok > 0 ? (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-700">
                      Tersedia {b.stok}
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-600">
                      Habis
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
