import Link from "next/link";

export const metadata = { title: "Halaman tidak ditemukan | Perpustakaan Digital" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl" aria-hidden>
        📕
      </p>
      <h1 className="mt-4 text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-slate-500">
        Halaman atau buku yang kamu cari tidak ada, atau sudah dihapus.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
        >
          Ke Beranda
        </Link>
        <Link
          href="/katalog"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          Lihat Katalog
        </Link>
      </div>
    </div>
  );
}
