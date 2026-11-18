import { requireAdmin } from "@/lib/auth";
import { bersihkanCari, formatTanggal } from "@/lib/format";

export const metadata = { title: "Anggota | Perpustakaan Digital" };

export default async function AnggotaPage({ searchParams }) {
  const params = await searchParams;
  const q = bersihkanCari(params.q);
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("profiles")
    .select("id, nama, nim, email, no_hp, created_at")
    .eq("role", "anggota")
    .order("nama");
  if (q) query = query.or(`nama.ilike.%${q}%,nim.ilike.%${q}%,email.ilike.%${q}%`);

  const [{ data: anggota, error }, { data: aktif }] = await Promise.all([
    query,
    supabase.from("loans").select("member_id").eq("status", "dipinjam"),
  ]);

  // Hitung jumlah buku yang sedang dipinjam tiap anggota
  const jumlahPinjam = {};
  for (const l of aktif ?? []) {
    jumlahPinjam[l.member_id] = (jumlahPinjam[l.member_id] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Anggota</h1>
        <p className="text-slate-500">
          {anggota?.length ?? 0} anggota terdaftar. Anggota baru mendaftar sendiri
          lewat halaman Daftar.
        </p>
      </div>

      {error && <p className="text-red-600">Gagal memuat data: {error.message}</p>}

      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama, NIM, atau email..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100">
          Cari
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">NIM</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">No. HP</th>
              <th className="px-4 py-3 font-medium">Terdaftar</th>
              <th className="px-4 py-3 font-medium">Sedang pinjam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {anggota?.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-semibold">{a.nama}</td>
                <td className="px-4 py-3">{a.nim || "-"}</td>
                <td className="px-4 py-3">{a.email}</td>
                <td className="px-4 py-3">{a.no_hp || "-"}</td>
                <td className="px-4 py-3">{formatTanggal(a.created_at)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-semibold text-indigo-700">
                    {jumlahPinjam[a.id] ?? 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {anggota?.length === 0 && (
          <p className="p-8 text-center text-slate-500">Belum ada anggota.</p>
        )}
      </div>
    </div>
  );
}
