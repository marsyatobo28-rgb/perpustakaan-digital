import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import BookForm from "@/components/book-form";

export const metadata = { title: "Edit Buku | Perpustakaan Digital" };

export default async function EditBukuPage({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const [{ data: buku }, { data: semua }] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).maybeSingle(),
    supabase.from("books").select("kategori"),
  ]);
  if (!buku) notFound();
  const daftarKategori = [...new Set((semua ?? []).map((b) => b.kategori))].sort();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/buku" className="text-sm font-medium text-indigo-700">
          ← Kembali
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit Buku</h1>
      </div>
      <BookForm buku={buku} daftarKategori={daftarKategori} />
    </div>
  );
}
