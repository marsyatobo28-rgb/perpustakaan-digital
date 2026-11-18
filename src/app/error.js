"use client"; // Halaman error wajib berupa Client Component

import { useEffect } from "react";

export default function Error({ error, retry, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const cobaLagi = retry ?? reset;

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl" aria-hidden>
        ⚠️
      </p>
      <h1 className="mt-4 text-2xl font-bold">Terjadi kesalahan</h1>
      <p className="mt-2 text-slate-500">
        Gagal memuat halaman. Periksa koneksi internet, lalu coba lagi.
      </p>
      <button
        type="button"
        onClick={() => cobaLagi?.()}
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
      >
        Coba lagi
      </button>
    </div>
  );
}
