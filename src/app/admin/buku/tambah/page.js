import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import BookForm from "@/components/book-form";

export const metadata = { title: "Tambah Buku | Perpustakaan Digital" };

export default async function TambahBukuPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("books").select("kategori");
  const daftarKategori = [...new Set((data ?? []).map((b) => b.kategori))].sort();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/buku" className="text-sm font-medium text-indigo-700">
          ← Kembali
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Tambah Buku</h1>
      </div>
      <BookForm daftarKategori={daftarKategori} />
    </div>
  );
}
