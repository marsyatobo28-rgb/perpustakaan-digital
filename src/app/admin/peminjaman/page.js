import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatRupiah, formatTanggal, hariIni, bersihkanCari } from "@/lib/format";
import { LAMA_PINJAM_HARI, MAKS_PINJAM, statusPinjaman, tambahHari } from "@/lib/aturan";
import Pesan from "@/components/pesan";
import FormPinjam from "@/components/form-pinjam";
import StatusBadge from "@/components/status-badge";
import TombolKonfirmasi from "@/components/tombol-konfirmasi";
import { kembalikan, perpanjang } from "./actions";

export const metadata = { title: "Peminjaman | Perpustakaan Digital" };

const TAB = [
  { kode: "aktif", label: "Sedang dipinjam" },
  { kode: "terlambat", label: "Terlambat" },
  { kode: "kembali", label: "Sudah kembali" },
  { kode: "semua", label: "Semua" },
];

export default async function PeminjamanPage({ searchParams }) {
  const params = await searchParams;
  const tab = TAB.some((t) => t.kode === params.status) ? params.status : "aktif";
  const q = bersihkanCari(params.q).toLowerCase();
  const { supabase } = await requireAdmin();
  const today = hariIni();

  const [{ data: loans, error }, { data: anggota }, { data: buku }] = await Promise.all([
    supabase
      .from("loans")
      .select(
        "id, tanggal_pinjam, jatuh_tempo, tanggal_kembali, status, denda, diperpanjang, member_id, books(id, judul, penulis), profiles(id, nama, nim)"
      )
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.from("profiles").select("id, nama, nim").eq("role", "anggota").order("nama"),
    supabase.from("books").select("id, judul, stok").gt("stok", 0).order("judul"),
  ]);

  const semua = (loans ?? []).map((l) => ({ ...l, info: statusPinjaman(l, today) }));

  // Jumlah pinjaman aktif per anggota (untuk dropdown form)
  const aktifPerAnggota = {};
  for (const l of semua) {
    if (l.status === "dipinjam") {
      aktifPerAnggota[l.member_id] = (aktifPerAnggota[l.member_id] ?? 0) + 1;
    }
  }

  const jumlah = {
    aktif: semua.filter((l) => l.status === "dipinjam").length,
    terlambat: semua.filter((l) => l.info.kode === "terlambat").length,
    kembali: semua.filter((l) => l.status === "dikembalikan").length,
    semua: semua.length,
  };

  const tampil = semua
    .filter((l) =>
      tab === "aktif" ? l.status === "dipinjam"
      : tab === "terlambat" ? l.info.kode === "terlambat"
      : tab === "kembali" ? l.status === "dikembalikan"
      : true
    )
    .filter((l) =>
      !q ||
      l.books?.judul.toLowerCase().includes(q) ||
      l.profiles?.nama.toLowerCase().includes(q) ||
      (l.profiles?.nim ?? "").toLowerCase().includes(q)
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Peminjaman & Pengembalian</h1>
        <p className="text-slate-500">
          Masa pinjam {LAMA_PINJAM_HARI} hari, denda {formatRupiah(1000)}/hari, bisa
          diperpanjang 1x selama belum terlambat.
        </p>
      </div>

      <Pesan jenis={params.jenis === "gagal" ? "gagal" : "sukses"}>{params.pesan}</Pesan>
      {error && <Pesan jenis="gagal">Gagal memuat data: {error.message}</Pesan>}

      <FormPinjam
        anggota={(anggota ?? []).map((a) => ({ ...a, aktif: aktifPerAnggota[a.id] ?? 0 }))}
        buku={buku ?? []}
        jatuhTempo={formatTanggal(tambahHari(today, LAMA_PINJAM_HARI))}
        maksPinjam={MAKS_PINJAM}
      />

      <div className="flex flex-wrap items-center gap-2">
        {TAB.map((t) => (
          <Link
            key={t.kode}
            href={`/admin/peminjaman?status=${t.kode}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === t.kode
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label} ({jumlah[t.kode]})
          </Link>
        ))}
        <form className="ml-auto flex gap-2">
          <input type="hidden" name="status" value={tab} />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Cari judul / anggota..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          />
          <button className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-100">
            Cari
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Buku</th>
              <th className="px-4 py-3 font-medium">Anggota</th>
              <th className="px-4 py-3 font-medium">Pinjam</th>
              <th className="px-4 py-3 font-medium">Jatuh tempo</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Denda</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tampil.map((l) => (
              <tr key={l.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold">{l.books?.judul}</p>
                  <p className="text-slate-500">{l.books?.penulis}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{l.profiles?.nama}</p>
                  <p className="text-slate-500">{l.profiles?.nim || "-"}</p>
                </td>
                <td className="px-4 py-3">{formatTanggal(l.tanggal_pinjam)}</td>
                <td className="px-4 py-3">
                  {formatTanggal(l.jatuh_tempo)}
                  {l.diperpanjang && (
                    <span className="block text-xs text-slate-400">diperpanjang</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge loan={l} status={l.info} />
                </td>
                <td className="px-4 py-3">
                  {l.status === "dikembalikan" ? (
                    <span className={l.denda > 0 ? "font-semibold text-red-600" : ""}>
                      {formatRupiah(l.denda)}
                    </span>
                  ) : l.info.estimasiDenda > 0 ? (
                    <span className="text-red-600">± {formatRupiah(l.info.estimasiDenda)}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3">
                  {l.status === "dipinjam" && (
                    <div className="flex flex-wrap gap-1">
                      <TombolKonfirmasi
                        action={kembalikan}
                        fields={{ loan_id: l.id }}
                        konfirmasi={
                          l.info.estimasiDenda > 0
                            ? `Kembalikan "${l.books?.judul}"? Terlambat ${l.info.hariTerlambat} hari, denda ${formatRupiah(l.info.estimasiDenda)}.`
                            : `Kembalikan "${l.books?.judul}"?`
                        }
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        Kembalikan
                      </TombolKonfirmasi>
                      {!l.diperpanjang && l.info.kode !== "terlambat" && (
                        <TombolKonfirmasi
                          action={perpanjang}
                          fields={{ loan_id: l.id }}
                          konfirmasi={`Perpanjang "${l.books?.judul}" 7 hari? (hanya bisa 1x)`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Perpanjang
                        </TombolKonfirmasi>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tampil.length === 0 && (
          <p className="p-8 text-center text-slate-500">Tidak ada data peminjaman.</p>
        )}
      </div>
    </div>
  );
}
