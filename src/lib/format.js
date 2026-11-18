const ZONA_WAKTU = "Asia/Makassar"; // WITA (UTC+8)

// Tanggal hari ini dalam format YYYY-MM-DD (WITA)
export function hariIni() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_WAKTU }).format(
    new Date()
  );
}

// "2026-11-18" -> "18 Nov 2026"
export function formatTanggal(tanggal) {
  if (!tanggal) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
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
