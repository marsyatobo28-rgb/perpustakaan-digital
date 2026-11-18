const ZONA_WAKTU = "Asia/Makassar"; // WITA (UTC+8)

// Tanggal hari ini dalam format YYYY-MM-DD (WITA)
export function hariIni() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_WAKTU }).format(
    new Date()
  );
}

// "2026-11-18" atau timestamp -> "18 Nov 2026"
export function formatTanggal(tanggal) {
  if (!tanggal) return "-";
  const hanyaTanggal = /^\d{4}-\d{2}-\d{2}$/.test(tanggal);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: hanyaTanggal ? "UTC" : ZONA_WAKTU,
  }).format(new Date(tanggal));
}

// 3000 -> "Rp 3.000"
export function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka ?? 0);
}

// Membersihkan kata kunci pencarian supaya aman dipakai di filter Supabase
export function bersihkanCari(teks) {
  return String(teks ?? "")
    .replace(/[,()%*\\.:"']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}
