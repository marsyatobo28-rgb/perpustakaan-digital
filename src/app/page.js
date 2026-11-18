import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: books, error } = await supabase
    .from("books")
    .select("id, judul, penulis, kategori, stok")
    .order("judul");

  if (error) {
    return (
      <p className="p-8 text-red-600">Gagal memuat data: {error.message}</p>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">Perpustakaan Digital</h1>
      <p className="mt-1 text-gray-500">
        Tes koneksi Supabase: {books.length} buku ditemukan
      </p>
      <ul className="mt-6 divide-y">
        {books.map((b) => (
          <li key={b.id} className="py-3">
            <p className="font-medium">{b.judul}</p>
            <p className="text-sm text-gray-500">
              {b.penulis} · {b.kategori} · stok {b.stok}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
