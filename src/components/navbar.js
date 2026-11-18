import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/auth/actions";
import MenuHP from "@/components/menu-hp";

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
  const nama = profile?.nama ?? user?.email;

  return (
    <header className="relative border-b border-slate-200 bg-white print:hidden">
      <nav className="mx-auto flex max-w-6xl items-center gap-8 px-4 py-3 lg:py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-indigo-700"
        >
          <span aria-hidden>📚</span> Perpustakaan Digital
        </Link>

        {/* Menu layar lebar */}
        <ul className="hidden flex-1 items-center gap-x-5 text-sm font-medium text-slate-600 lg:flex">
          {menu.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-indigo-700">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {user ? (
          <div className="hidden items-center gap-3 text-sm lg:flex">
            <span className="text-slate-700">
              {nama}
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
          <div className="hidden items-center gap-2 text-sm font-medium lg:flex">
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

        {/* Menu layar HP */}
        <MenuHP menu={menu} nama={nama} role={role} sudahLogin={!!user} />
      </nav>
    </header>
  );
}
