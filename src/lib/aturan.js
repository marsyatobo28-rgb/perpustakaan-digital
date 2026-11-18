// Aturan perpustakaan. Nilainya sama dengan yang ada di fungsi database
// (pinjam_buku, kembalikan_buku, perpanjang_buku).
export const LAMA_PINJAM_HARI = 7;
export const DENDA_PER_HARI = 1000;
export const MAKS_PINJAM = 3;

// Selisih hari antara dua tanggal "YYYY-MM-DD" (a - b)
export function selisihHari(a, b) {
  return Math.round((Date.parse(a) - Date.parse(b)) / 86_400_000);
}

// Tambah n hari ke tanggal "YYYY-MM-DD"
export function tambahHari(tanggal, n) {
  const d = new Date(tanggal + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Status sebuah peminjaman pada hari ini
export function statusPinjaman(loan, hariIni) {
  if (loan.status === "dikembalikan") {
    return { kode: "kembali", hariTerlambat: 0, estimasiDenda: 0 };
  }
  const telat = selisihHari(hariIni, loan.jatuh_tempo);
  if (telat > 0) {
    return { kode: "terlambat", hariTerlambat: telat, estimasiDenda: telat * DENDA_PER_HARI };
  }
  return { kode: "dipinjam", sisaHari: -telat, hariTerlambat: 0, estimasiDenda: 0 };
}
