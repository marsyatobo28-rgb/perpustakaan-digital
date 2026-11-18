// Kotak pesan sukses/gagal
export default function Pesan({ jenis = "sukses", children }) {
  if (!children) return null;
  const gaya =
    jenis === "gagal"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-green-50 text-green-700 border-green-200";
  return (
    <p className={`rounded-lg border px-4 py-2.5 text-sm ${gaya}`}>{children}</p>
  );
}
