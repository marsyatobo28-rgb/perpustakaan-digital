import { hariIni } from "@/lib/format";
import { selisihHari, statusPinjaman, tambahHari } from "@/lib/aturan";

const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

// Membaca periode laporan dari URL. Bawaan: awal bulan ini s.d. hari ini.
export function ambilPeriode(params) {
  const today = hariIni();
  let dari = POLA_TANGGAL.test(params.dari ?? "") ? params.dari : today.slice(0, 8) + "01";
  let sampai = POLA_TANGGAL.test(params.sampai ?? "") ? params.sampai : today;
  if (dari > sampai) [dari, sampai] = [sampai, dari];
  return { dari, sampai, today };
}

const labelHari = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });
const labelBulan = new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric", timeZone: "UTC" });

const KOLOM =
  "id, book_id, member_id, tanggal_pinjam, jatuh_tempo, tanggal_kembali, status, denda, diperpanjang, books(judul, penulis), profiles(nama, nim)";

export async function ambilDataLaporan(supabase, { dari, sampai, today }) {
  const [pinjam, kembali, aktif] = await Promise.all([
    supabase
      .from("loans")
      .select(KOLOM)
      .gte("tanggal_pinjam", dari)
      .lte("tanggal_pinjam", sampai)
      .order("tanggal_pinjam")
      .order("id"),
    supabase
      .from("loans")
      .select(KOLOM)
      .gte("tanggal_kembali", dari)
      .lte("tanggal_kembali", sampai),
    supabase.from("loans").select(KOLOM).eq("status", "dipinjam"),
  ]);

  const error = pinjam.error || kembali.error || aktif.error;
  const beriStatus = (l) => ({ ...l, info: statusPinjaman(l, today) });

  const transaksi = (pinjam.data ?? []).map(beriStatus);
  const pengembalian = kembali.data ?? [];
  const sedangDipinjam = (aktif.data ?? []).map(beriStatus);
  const terlambat = sedangDipinjam.filter((l) => l.info.kode === "terlambat");
  const totalDenda = pengembalian.reduce((jml, l) => jml + l.denda, 0);

  // Buku terpopuler pada periode ini
  const perBuku = new Map();
  for (const l of transaksi) {
    const e = perBuku.get(l.book_id) ?? {
      judul: l.books?.judul ?? "-",
      penulis: l.books?.penulis ?? "",
      jumlah: 0,
    };
    e.jumlah += 1;
    perBuku.set(l.book_id, e);
  }
  const terpopuler = [...perBuku.values()]
    .sort((a, b) => b.jumlah - a.jumlah || a.judul.localeCompare(b.judul))
    .slice(0, 5);

  // Grafik: per hari, atau per bulan kalau periodenya lebih dari 62 hari
  const perBulan = selisihHari(sampai, dari) + 1 > 62;
  const hitung = new Map();
  for (const l of transaksi) {
    const kunci = perBulan ? l.tanggal_pinjam.slice(0, 7) : l.tanggal_pinjam;
    hitung.set(kunci, (hitung.get(kunci) ?? 0) + 1);
  }
  const grafik = [];
  if (perBulan) {
    for (let t = dari.slice(0, 7) + "-01"; t.slice(0, 7) <= sampai.slice(0, 7); ) {
      const kunci = t.slice(0, 7);
      grafik.push({ kunci, label: labelBulan.format(new Date(t)), jumlah: hitung.get(kunci) ?? 0 });
      const d = new Date(t + "T00:00:00Z");
      d.setUTCMonth(d.getUTCMonth() + 1);
      t = d.toISOString().slice(0, 10);
    }
  } else {
    for (let t = dari; t <= sampai; t = tambahHari(t, 1)) {
      grafik.push({ kunci: t, label: labelHari.format(new Date(t)), jumlah: hitung.get(t) ?? 0 });
    }
  }

  // Denda per anggota (dari pengembalian pada periode ini)
  const perAnggota = new Map();
  for (const l of pengembalian) {
    if (l.denda <= 0) continue;
    const e = perAnggota.get(l.member_id) ?? {
      nama: l.profiles?.nama ?? "-",
      nim: l.profiles?.nim ?? "",
      kali: 0,
      total: 0,
    };
    e.kali += 1;
    e.total += l.denda;
    perAnggota.set(l.member_id, e);
  }
  const dendaPerAnggota = [...perAnggota.values()].sort((a, b) => b.total - a.total);

  return {
    error,
    transaksi,
    pengembalian,
    sedangDipinjam,
    terlambat,
    totalDenda,
    terpopuler,
    grafik: { perBulan, data: grafik },
    dendaPerAnggota,
  };
}

// Teks status untuk tabel & CSV
export function teksStatus(l) {
  if (l.info.kode === "kembali") return "Dikembalikan";
  if (l.info.kode === "terlambat") return `Terlambat ${l.info.hariTerlambat} hari`;
  return "Dipinjam";
}
