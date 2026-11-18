import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { bersihkanCari } from "@/lib/format";
import Cover from "@/components/cover";
import Pesan from "@/components/pesan";
import HapusBukuButton from "@/components/hapus-buku-button";

export const metadata = { title: "Kelola Buku | Perpustakaan Digital" };

const TEKS_PESAN = {
  ditambah: "Buku baru berhasil ditambahkan.",
  diubah: "Perubahan buku berhasil disimpan.",
  dihapus: "Buku berhasil dihapus.",
};

export default async function KelolaBukuPage({ searchParams }) {
  const params = await searchParams;
  const q = bersihkanCari(params.q);
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("books")
    .select("id, judul, penulis, penerbit, tahun, kategori, stok, cover_url")
    .order("created_at", { ascending: false });
  if (q) query = query.or(`judul.ilike.%${q}%,penulis.ilike.%${q}%`);
  const { data: books, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Buku</h1>
          <p className="text-slate-500">{books?.length ?? 0} judul buku</p>
        </div>
        <Link
          href="/admin/buku/tambah"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
        >
          + Tambah Buku
        </Link>
      </div>

      <Pesan>{TEKS_PESAN[params.pesan]}</Pesan>
      {error && <Pesan jenis="gagal">Gagal memuat data: {error.message}</Pesan>}

      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul atau penulis..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100">
          Cari
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Buku</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Tahun</th>
              <th className="px-4 py-3 font-medium">Stok</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books?.map((b) => (
              <tr key={b.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <div className="w-12 shrink-0">
                      <Cover buku={b} className="rounded-md !p-1 text-[0px]" />
                    </div>
                    <div>
                      <p className="font-semibold">{b.judul}</p>
                      <p className="text-slate-500">
                        {b.penulis}
                        {b.penerbit ? ` · ${b.penerbit}` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{b.kategori}</td>
                <td className="px-4 py-3">{b.tahun ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className={b.stok > 0 ? "font-semibold" : "font-semibold text-red-600"}>
                    {b.stok}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-1">
                    <Link
                      href={`/admin/buku/${b.id}/edit`}
                      className="rounded-lg px-3 py-1.5 font-medium text-indigo-700 hover:bg-indigo-50"
                    >
                      Edit
                    </Link>
                    <HapusBukuButton id={b.id} judul={b.judul} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {books?.length === 0 && (
          <p className="p-8 text-center text-slate-500">Tidak ada buku.</p>
        )}
      </div>
    </div>
  );
}
