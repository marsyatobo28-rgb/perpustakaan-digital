import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/auth/actions";

// Menu berbeda untuk tiap jenis pengguna
const MENU = {
  tamu: [{ href: "/katalog", label: "Katalog" }],
  anggota: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/katalog", label: "Katalog" },
    { href: "/pinjaman-saya", label: "Pinjaman Saya" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/katalog", label: "Katalog" },
    { href: "/admin/buku", label: "Kelola Buku" },
    { href: "/admin/anggota", label: "Anggota" },
    { href: "/admin/peminjaman", label: "Peminjaman" },
    { href: "/admin/laporan", label: "Laporan" },
  ],
};

export default async function Navbar() {
  const { user, profile } = await getSession();
  const role = user ? profile?.role ?? "anggota" : "tamu";
  const menu = MENU[role] ?? MENU.tamu;

  return (
    <header className="border-b border-slate-200 bg-white print:hidden">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-indigo-700"
        >
          <span aria-hidden>📚</span> Perpustakaan Digital
        </Link>

        <ul className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
          {menu.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-indigo-700">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-700">
              {profile?.nama ?? user.email}
              <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {role}
              </span>
            </span>
            <form action={logout}>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
                Keluar
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
            >
              Daftar
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
