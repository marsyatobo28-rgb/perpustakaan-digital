import { formatTanggal } from "@/lib/format";

export default function StatusBadge({ loan, status }) {
  if (status.kode === "kembali") {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        Dikembalikan {formatTanggal(loan.tanggal_kembali)}
      </span>
    );
  }
  if (status.kode === "terlambat") {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
        Terlambat {status.hariTerlambat} hari
      </span>
    );
  }
  return (
    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
      {status.sisaHari === 0 ? "Jatuh tempo hari ini" : `Sisa ${status.sisaHari} hari`}
    </span>
  );
}
