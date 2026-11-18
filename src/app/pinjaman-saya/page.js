import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { formatRupiah, formatTanggal, hariIni } from "@/lib/format";
import { MAKS_PINJAM, statusPinjaman } from "@/lib/aturan";
import Cover from "@/components/cover";
import StatusBadge from "@/components/status-badge";

export const metadata = { title: "Pinjaman Saya | Perpustakaan Digital" };

export default async function PinjamanSayaPage() {
  const { supabase, user, profile } = await requireUser();
  if (profile?.role === "admin") redirect("/admin/peminjaman");

  const today = hariIni();
  const { data: loans, error } = await supabase
    .from("loans")
    .select(
      "id, tanggal_pinjam, jatuh_tempo, tanggal_kembali, status, denda, diperpanjang, books(id, judul, penulis, cover_url)"
    )
    .eq("member_id", user.id)
    .order("created_at", { ascending: false });

  const semua = (loans ?? []).map((l) => ({ ...l, info: statusPinjaman(l, today) }));
  const aktif = semua.filter((l) => l.status === "dipinjam");
  const riwayat = semua.filter((l) => l.status === "dikembalikan");
  const totalDenda = riwayat.reduce((jml, l) => jml + l.denda, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pinjaman Saya</h1>
        <p className="text-slate-500">
          Sedang meminjam {aktif.length} dari maksimal {MAKS_PINJAM} buku.
        </p>
      </div>

      {error && <p className="text-red-600">Gagal memuat data: {error.message}</p>}

      <section className="space-y-3">
        <h2 className="font-semibold">Sedang dipinjam</h2>
        {aktif.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Kamu tidak sedang meminjam buku.{" "}
            <Link href="/katalog" className="font-semibold text-indigo-700">
              Lihat katalog
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aktif.map((l) => (
              <div
                key={l.id}
                className={`flex gap-4 rounded-2xl border bg-white p-4 ${
                  l.info.kode === "terlambat" ? "border-red-200" : "border-slate-200"
                }`}
              >
                <div className="w-20 shrink-0">
                  {l.books && <Cover buku={l.books} className="!p-2 text-[0px]" />}
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="font-semibold leading-snug">{l.books?.judul}</p>
                  <p className="text-slate-500">{l.books?.penulis}</p>
                  <p>
                    Jatuh tempo: <b>{formatTanggal(l.jatuh_tempo)}</b>
                    {l.diperpanjang && <span className="text-slate-400"> (diperpanjang)</span>}
                  </p>
                  <StatusBadge loan={l} status={l.info} />
                  {l.info.estimasiDenda > 0 && (
                    <p className="text-red-600">
                      Denda berjalan: {formatRupiah(l.info.estimasiDenda)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Riwayat pengembalian</h2>
          <p className="text-sm text-slate-500">
            Total denda dibayar: <b>{formatRupiah(totalDenda)}</b>
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Buku</th>
                <th className="px-4 py-3 font-medium">Pinjam</th>
                <th className="px-4 py-3 font-medium">Kembali</th>
                <th className="px-4 py-3 font-medium">Denda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riwayat.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 font-medium">{l.books?.judul}</td>
                  <td className="px-4 py-3">{formatTanggal(l.tanggal_pinjam)}</td>
                  <td className="px-4 py-3">{formatTanggal(l.tanggal_kembali)}</td>
                  <td className={`px-4 py-3 ${l.denda > 0 ? "font-semibold text-red-600" : ""}`}>
                    {formatRupiah(l.denda)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {riwayat.length === 0 && (
            <p className="p-6 text-center text-slate-500">Belum ada riwayat.</p>
          )}
        </div>
      </section>
    </div>
  );
}
