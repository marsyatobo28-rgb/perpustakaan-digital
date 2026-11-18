// Tampil otomatis selama data sedang diambil dari server cloud
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-slate-500">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
      <p className="text-sm">Memuat data dari cloud...</p>
    </div>
  );
}
