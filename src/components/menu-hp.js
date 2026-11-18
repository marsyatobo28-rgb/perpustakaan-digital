"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/app/auth/actions";

// Menu lipat (☰) untuk layar HP & tablet
export default function MenuHP({ menu, nama, role, sudahLogin }) {
  const [buka, setBuka] = useState(false);
  const tutup = () => setBuka(false);

  return (
    <div className="ml-auto lg:hidden">
      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        aria-expanded={buka}
        aria-label={buka ? "Tutup menu" : "Buka menu"}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-xl text-slate-700 hover:bg-slate-100"
      >
        {buka ? "✕" : "☰"}
      </button>

      {buka && (
        <div className="absolute inset-x-0 top-full z-30 border-b border-slate-200 bg-white px-4 pb-4 shadow-lg">
          {sudahLogin && (
            <p className="border-b border-slate-100 py-3 text-sm text-slate-700">
              {nama}
              <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {role}
              </span>
            </p>
          )}
          <ul className="py-2">
            {menu.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={tutup}
                  className="block rounded-lg px-2 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {sudahLogin ? (
            <form action={logout} onSubmit={tutup}>
              <button className="w-full rounded-lg border border-slate-300 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
                Keluar
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={tutup}
                className="rounded-lg border border-slate-300 py-2.5 text-center font-medium text-slate-700"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                onClick={tutup}
                className="rounded-lg bg-indigo-600 py-2.5 text-center font-medium text-white"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
