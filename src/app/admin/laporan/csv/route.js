import { getSession } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import { ambilDataLaporan, ambilPeriode, teksStatus } from "@/lib/laporan";

// Unduh rekap transaksi sebagai CSV (bisa dibuka di Excel)
export async function GET(request) {
  const { supabase, profile } = await getSession();
  if (profile?.role !== "admin") {
    return new Response("Akses ditolak", { status: 403 });
  }

  const periode = ambilPeriode(Object.fromEntries(request.nextUrl.searchParams));
  const { transaksi, error } = await ambilDataLaporan(supabase, periode);
  if (error) return new Response(`Gagal memuat data: ${error.message}`, { status: 500 });

  const sel = (nilai) => `"${String(nilai ?? "").replace(/"/g, '""')}"`;
  const baris = [
    ["No", "Tanggal Pinjam", "Nama Anggota", "NIM", "Judul Buku", "Jatuh Tempo", "Tanggal Kembali", "Status", "Denda (Rp)"],
    ...transaksi.map((l, i) => [
      i + 1,
      formatTanggal(l.tanggal_pinjam),
      l.profiles?.nama,
      l.profiles?.nim,
      l.books?.judul,
      formatTanggal(l.jatuh_tempo),
      l.tanggal_kembali ? formatTanggal(l.tanggal_kembali) : "-",
      teksStatus(l),
      l.status === "dikembalikan" ? l.denda : l.info.estimasiDenda,
    ]),
  ];

  // Pemisah titik koma (;) sesuai pengaturan Excel berbahasa Indonesia,
  // dan BOM di awal supaya huruf terbaca benar.
  const isi = "﻿" + baris.map((b) => b.map(sel).join(";")).join("\r\n");

  return new Response(isi, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-perpustakaan-${periode.dari}_${periode.sampai}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
