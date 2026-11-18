import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { hariIni } from "@/lib/format";

export const metadata = { title: "Dashboard | Perpustakaan Digital" };

function KartuAngka({ label, nilai, warna = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${warna}`}>{nilai ?? 0}</p>
    </div>
  );
}

function Pintasan({ href, judul, isi }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm"
    >
      <p className="font-semibold text-indigo-700">{judul} →</p>
      <p className="mt-1 text-sm text-slate-500">{isi}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireUser();
  const isAdmin = profile?.role === "admin";
  const today = hariIni();
  const hitung = { count: "exact", head: true };

  if (isAdmin) {
    const [buku, anggota, dipinjam, terlambat] = await Promise.all([
      supabase.from("books").select("*", hitung),
      supabase.from("profiles").select("*", hitung).eq("role", "anggota"),
      supabase.from("loans").select("*", hitung).eq("status", "dipinjam"),
      supabase
        .from("loans")
        .select("*", hitung)
        .eq("status", "dipinjam")
        .lt("jatuh_tempo", today),
    ]);

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-slate-500">Selamat datang, {profile.nama}.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KartuAngka label="Judul buku" nilai={buku.count} />
          <KartuAngka label="Anggota" nilai={anggota.count} />
          <KartuAngka label="Sedang dipinjam" nilai={dipinjam.count} warna="text-indigo-700" />
          <KartuAngka label="Terlambat" nilai={terlambat.count} warna="text-red-600" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Pintasan href="/admin/buku" judul="Kelola Buku" isi="Tambah, ubah, dan hapus koleksi." />
          <Pintasan href="/admin/anggota" judul="Anggota" isi="Lihat data anggota terdaftar." />
          <Pintasan href="/admin/peminjaman" judul="Peminjaman" isi="Catat pinjam dan pengembalian." />
          <Pintasan href="/admin/laporan" judul="Laporan" isi="Rekap dan cetak laporan." />
        </div>
      </div>
    );
  }

  const [dipinjam, terlambat] = await Promise.all([
    supabase
      .from("loans")
      .select("*", hitung)
      .eq("member_id", user.id)
      .eq("status", "dipinjam"),
    supabase
      .from("loans")
      .select("*", hitung)
      .eq("member_id", user.id)
      .eq("status", "dipinjam")
      .lt("jatuh_tempo", today),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Halo, {profile?.nama ?? user.email} 👋</h1>
        <p className="text-slate-500">Dashboard anggota perpustakaan.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KartuAngka label="Buku sedang dipinjam" nilai={dipinjam.count} warna="text-indigo-700" />
        <KartuAngka label="Terlambat dikembalikan" nilai={terlambat.count} warna="text-red-600" />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
          <p className="text-slate-500">Profil</p>
          <p className="mt-1 font-semibold">{profile?.nama}</p>
          <p className="text-slate-500">NIM: {profile?.nim || "-"}</p>
          <p className="text-slate-500">{profile?.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Pintasan href="/katalog" judul="Cari Buku" isi="Lihat koleksi dan stok buku." />
        <Pintasan href="/pinjaman-saya" judul="Pinjaman Saya" isi="Riwayat dan jatuh tempo pinjamanmu." />
      </div>
    </div>
  );
}
