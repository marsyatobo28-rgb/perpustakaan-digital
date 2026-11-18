import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { tambahHari } from "@/lib/aturan";
import { ambilDataLaporan, ambilPeriode, teksStatus } from "@/lib/laporan";
import { GrafikBatang, GrafikKolom } from "@/components/grafik";
import TombolCetak from "@/components/tombol-cetak";

export const metadata = { title: "Laporan | Perpustakaan Digital" };

function Kartu({ label, nilai, ket, warna = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 print:rounded-none">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${warna}`}>{nilai}</p>
      {ket && <p className="mt-0.5 text-xs text-slate-400">{ket}</p>}
    </div>
  );
}

function Panel({ judul, ket, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 break-inside-avoid print:rounded-none ${className}`}
    >
      <h2 className="font-semibold">{judul}</h2>
      {ket && <p className="text-sm text-slate-500">{ket}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function LaporanPage({ searchParams }) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const periode = ambilPeriode(params);
  const { dari, sampai, today } = periode;
  const d = await ambilDataLaporan(supabase, periode);

  const teksPeriode = `${formatTanggal(dari)} s.d. ${formatTanggal(sampai)}`;
  const qs = `dari=${dari}&sampai=${sampai}`;
  const PRESET = [
    { label: "Bulan ini", dari: today.slice(0, 8) + "01", sampai: today },
    { label: "7 hari terakhir", dari: tambahHari(today, -6), sampai: today },
    { label: "30 hari terakhir", dari: tambahHari(today, -29), sampai: today },
  ];

  return (
    <div className="space-y-6">
      {/* Kop laporan (khusus saat dicetak) */}
      <div className="hidden border-b-2 border-slate-900 pb-3 text-center print:block">
        <p className="text-lg font-bold uppercase">Laporan Perpustakaan Digital</p>
        <p className="text-sm">Periode {teksPeriode}</p>
        <p className="text-xs text-slate-500">Dicetak {formatTanggal(today)}</p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Laporan Perpustakaan</h1>
          <p className="text-slate-500">Periode {teksPeriode}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/admin/laporan/csv?${qs}`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            ⬇️ Export CSV
          </a>
          <TombolCetak />
        </div>
      </div>

      {/* Filter periode */}
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 print:hidden">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Dari</span>
          <input type="date" name="dari" defaultValue={dari} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Sampai</span>
          <input type="date" name="sampai" defaultValue={sampai} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Tampilkan
        </button>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {PRESET.map((p) => (
            <Link
              key={p.label}
              href={`/admin/laporan?dari=${p.dari}&sampai=${p.sampai}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                p.dari === dari && p.sampai === sampai
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </form>

      {d.error && <p className="text-red-600">Gagal memuat data: {d.error.message}</p>}

      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 print:grid-cols-5">
        <Kartu label="Peminjaman" nilai={d.transaksi.length} ket="pada periode ini" />
        <Kartu label="Pengembalian" nilai={d.pengembalian.length} ket="pada periode ini" />
        <Kartu label="Sedang dipinjam" nilai={d.sedangDipinjam.length} ket="per hari ini" warna="text-indigo-700" />
        <Kartu label="Terlambat" nilai={d.terlambat.length} ket="per hari ini" warna="text-red-600" />
        <Kartu label="Denda diterima" nilai={formatRupiah(d.totalDenda)} ket="pada periode ini" />
      </div>

      {/* Grafik */}
      <div className="grid gap-4 lg:grid-cols-5 print:grid-cols-5">
        <Panel
          className="lg:col-span-3 print:col-span-3"
          judul={`Peminjaman per ${d.grafik.perBulan ? "bulan" : "hari"}`}
          ket={`${d.transaksi.length} peminjaman · ${teksPeriode}`}
        >
          <GrafikKolom data={d.grafik.data} />
        </Panel>
        <Panel
          className="lg:col-span-2 print:col-span-2"
          judul="5 Buku Terpopuler"
          ket="Paling sering dipinjam pada periode ini"
        >
          {d.terpopuler.length ? (
            <GrafikBatang data={d.terpopuler} />
          ) : (
            <p className="text-sm text-slate-500">Belum ada peminjaman.</p>
          )}
        </Panel>
      </div>

      {/* Rekap transaksi */}
      <Panel judul="Rekap Transaksi Peminjaman" ket={`${d.transaksi.length} transaksi dipinjam pada periode ini`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm print:min-w-0 print:text-xs">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-medium">No</th>
                <th className="py-2 pr-3 font-medium">Tgl pinjam</th>
                <th className="py-2 pr-3 font-medium">Anggota</th>
                <th className="py-2 pr-3 font-medium">Buku</th>
                <th className="py-2 pr-3 font-medium">Jatuh tempo</th>
                <th className="py-2 pr-3 font-medium">Tgl kembali</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 text-right font-medium">Denda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.transaksi.map((l, i) => (
                <tr key={l.id} className="break-inside-avoid">
                  <td className="py-2 pr-3 tabular-nums text-slate-400">{i + 1}</td>
                  <td className="py-2 pr-3">{formatTanggal(l.tanggal_pinjam)}</td>
                  <td className="py-2 pr-3">
                    {l.profiles?.nama}
                    {l.profiles?.nim && <span className="text-slate-400"> · {l.profiles.nim}</span>}
                  </td>
                  <td className="py-2 pr-3">{l.books?.judul}</td>
                  <td className="py-2 pr-3">{formatTanggal(l.jatuh_tempo)}</td>
                  <td className="py-2 pr-3">{l.tanggal_kembali ? formatTanggal(l.tanggal_kembali) : "-"}</td>
                  <td className={`py-2 pr-3 ${l.info.kode === "terlambat" ? "font-semibold text-red-600" : ""}`}>
                    {teksStatus(l)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {l.status === "dikembalikan"
                      ? formatRupiah(l.denda)
                      : l.info.estimasiDenda > 0
                        ? `± ${formatRupiah(l.info.estimasiDenda)}`
                        : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {d.transaksi.length === 0 && (
            <p className="py-6 text-center text-slate-500">Tidak ada transaksi pada periode ini.</p>
          )}
        </div>
      </Panel>

      {/* Denda per anggota */}
      <Panel judul="Denda per Anggota" ket="Dari pengembalian terlambat pada periode ini">
        {d.dendaPerAnggota.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Anggota</th>
                <th className="py-2 pr-3 font-medium">NIM</th>
                <th className="py-2 pr-3 text-right font-medium">Kali terlambat</th>
                <th className="py-2 text-right font-medium">Total denda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.dendaPerAnggota.map((a) => (
                <tr key={a.nama + a.nim}>
                  <td className="py-2 pr-3 font-medium">{a.nama}</td>
                  <td className="py-2 pr-3">{a.nim || "-"}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{a.kali}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{formatRupiah(a.total)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200">
                <td className="py-2 pr-3 font-semibold" colSpan={3}>Total</td>
                <td className="py-2 text-right font-bold tabular-nums">{formatRupiah(d.totalDenda)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">Tidak ada denda pada periode ini.</p>
        )}
      </Panel>

      <p className="hidden pt-8 text-right text-sm print:block">
        Petugas Perpustakaan,
        <br />
        <br />
        <br />
        ( ................................ )
      </p>
    </div>
  );
}
