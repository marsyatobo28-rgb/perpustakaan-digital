"use client";

export default function TombolCetak() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
    >
      🖨️ Cetak / Simpan PDF
    </button>
  );
}
