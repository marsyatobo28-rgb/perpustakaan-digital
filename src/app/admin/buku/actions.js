"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

function ambilData(formData) {
  const teks = (nama) => String(formData.get(nama) ?? "").trim();
  const tahun = teks("tahun");
  const stok = teks("stok");
  return {
    judul: teks("judul"),
    penulis: teks("penulis"),
    penerbit: teks("penerbit") || null,
    tahun: tahun ? Number(tahun) : null,
    kategori: teks("kategori"),
    stok: stok === "" ? 0 : Number(stok),
    deskripsi: teks("deskripsi") || null,
    cover_url: teks("cover_url") || null,
  };
}

export async function simpanBuku(prevState, formData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = ambilData(formData);

  if (!data.judul || !data.penulis || !data.kategori) {
    return { error: "Judul, penulis, dan kategori wajib diisi." };
  }
  if (data.tahun !== null && (!Number.isInteger(data.tahun) || data.tahun < 1000 || data.tahun > 2100)) {
    return { error: "Tahun terbit tidak valid." };
  }
  if (!Number.isInteger(data.stok) || data.stok < 0) {
    return { error: "Stok harus angka bulat 0 atau lebih." };
  }

  const { error } = id
    ? await supabase.from("books").update(data).eq("id", id)
    : await supabase.from("books").insert(data);

  if (error) return { error: `Gagal menyimpan: ${error.message}` };

  revalidatePath("/admin/buku");
  revalidatePath("/katalog");
  redirect(`/admin/buku?pesan=${id ? "diubah" : "ditambah"}`);
}

export async function hapusBuku(prevState, formData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const { data: buku } = await supabase
    .from("books")
    .select("cover_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return { error: "Tidak bisa dihapus: buku ini punya riwayat peminjaman." };
    }
    return { error: `Gagal menghapus: ${error.message}` };
  }

  // Hapus file cover dari Storage (kalau ada)
  const penanda = "/storage/v1/object/public/covers/";
  if (buku?.cover_url?.includes(penanda)) {
    const pathFile = buku.cover_url.split(penanda)[1];
    await supabase.storage.from("covers").remove([pathFile]);
  }

  revalidatePath("/admin/buku");
  revalidatePath("/katalog");
  redirect("/admin/buku?pesan=dihapus");
}
