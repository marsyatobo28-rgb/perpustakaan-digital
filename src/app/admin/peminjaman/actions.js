"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatRupiah, formatTanggal } from "@/lib/format";

function kembaliDenganPesan(pesan, jenis = "sukses") {
  revalidatePath("/admin/peminjaman");
  revalidatePath("/katalog");
  redirect(
    `/admin/peminjaman?pesan=${encodeURIComponent(pesan)}&jenis=${jenis}`
  );
}

export async function catatPinjam(prevState, formData) {
  const { supabase } = await requireAdmin();
  const memberId = String(formData.get("member_id") ?? "");
  const bookId = String(formData.get("book_id") ?? "");
  const values = { member_id: memberId, book_id: bookId };

  if (!memberId || !bookId) {
    return { error: "Pilih anggota dan buku terlebih dahulu.", values };
  }

  const { data, error } = await supabase.rpc("pinjam_buku", {
    p_book_id: Number(bookId),
    p_member_id: memberId,
  });

  if (error) return { error: error.message, values };

  kembaliDenganPesan(
    `Peminjaman berhasil dicatat. Jatuh tempo ${formatTanggal(data.jatuh_tempo)}.`
  );
}

export async function kembalikan(formData) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("kembalikan_buku", {
    p_loan_id: Number(formData.get("loan_id")),
  });

  if (error) kembaliDenganPesan(error.message, "gagal");

  kembaliDenganPesan(
    data.denda > 0
      ? `Buku dikembalikan terlambat. Denda yang harus dibayar: ${formatRupiah(data.denda)}.`
      : "Buku dikembalikan tepat waktu. Tidak ada denda."
  );
}

export async function perpanjang(formData) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("perpanjang_buku", {
    p_loan_id: Number(formData.get("loan_id")),
  });

  if (error) kembaliDenganPesan(error.message, "gagal");

  kembaliDenganPesan(
    `Peminjaman diperpanjang. Jatuh tempo baru ${formatTanggal(data.jatuh_tempo)}.`
  );
}
