import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import Cover from "@/components/cover";

export default async function DetailBukuPage({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const { supabase, profile } = await getSession();
  const { data: buku } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!buku) notFound();

  const info = [
    ["Penulis", buku.penulis],
    ["Penerbit", buku.penerbit || "-"],
    ["Tahun terbit", buku.tahun || "-"],
    ["Kategori", buku.kategori],
    ["Stok", buku.stok],
  ];

  return (
    <div className="space-y-6">
      <Link href="/katalog" className="text-sm font-medium text-indigo-700">
        ← Kembali ke katalog
      </Link>

      <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-[220px_1fr]">
        <Cover buku={buku} />
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold">{buku.judul}</h1>
            <p className="text-slate-500">{buku.penulis}</p>
          </div>

          {buku.stok > 0 ? (
            <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              Tersedia {buku.stok} eksemplar
            </span>
          ) : (
            <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
              Stok habis, sedang dipinjam semua
            </span>
          )}

          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            {info.map(([label, nilai]) => (
              <div key={label} className="contents">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium">{nilai}</dd>
              </div>
            ))}
          </dl>

          {buku.deskripsi && (
            <div>
              <h2 className="font-semibold">Deskripsi</h2>
              <p className="mt-1 text-slate-600">{buku.deskripsi}</p>
            </div>
          )}

          {profile?.role === "admin" ? (
            <Link
              href={`/admin/buku/${buku.id}/edit`}
              className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Edit buku ini
            </Link>
          ) : (
            <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
              Untuk meminjam, bawa kartu anggota ke petugas perpustakaan. Peminjaman
              dicatat oleh petugas, masa pinjam 7 hari.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
