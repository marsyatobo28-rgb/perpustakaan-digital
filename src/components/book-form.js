"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { simpanBuku } from "@/app/admin/buku/actions";
import Field from "@/components/field";
import Pesan from "@/components/pesan";

const MAKS_UKURAN = 2 * 1024 * 1024; // 2 MB

export default function BookForm({ buku, daftarKategori = [] }) {
  const [preview, setPreview] = useState(buku?.cover_url ?? null);

  // Upload cover langsung dari browser ke Supabase Storage,
  // lalu kirim URL-nya ke server action untuk disimpan di database.
  async function aksi(prevState, formData) {
    const file = formData.get("cover");
    formData.delete("cover");

    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return { error: "File cover harus berupa gambar (JPG/PNG/WebP)." };
      }
      if (file.size > MAKS_UKURAN) {
        return { error: "Ukuran cover maksimal 2 MB." };
      }
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("covers")
        .upload(path, file, { contentType: file.type });
      if (error) return { error: `Upload cover gagal: ${error.message}` };
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      formData.set("cover_url", data.publicUrl);
    }

    return simpanBuku(prevState, formData);
  }

  const [state, formAction, pending] = useActionState(aksi, null);

  function pilihFile(e) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : buku?.cover_url ?? null);
  }

  return (
    <form
      action={formAction}
      className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-[200px_1fr]"
    >
      {buku?.id && <input type="hidden" name="id" value={buku.id} />}
      <input type="hidden" name="cover_url" value={buku?.cover_url ?? ""} />

      <div className="space-y-3">
        <div className="flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-400">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pratinjau cover" className="h-full w-full object-cover" />
          ) : (
            "Belum ada cover"
          )}
        </div>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Gambar cover</span>
          <input
            type="file"
            name="cover"
            accept="image/*"
            onChange={pilihFile}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700"
          />
          <span className="mt-1 block text-xs text-slate-400">JPG/PNG, maks. 2 MB</span>
        </label>
      </div>

      <div className="space-y-4">
        {state?.error && <Pesan jenis="gagal">{state.error}</Pesan>}

        <Field label="Judul *" name="judul" defaultValue={buku?.judul} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Penulis *" name="penulis" defaultValue={buku?.penulis} required />
          <Field label="Penerbit" name="penerbit" defaultValue={buku?.penerbit ?? ""} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Kategori *"
            name="kategori"
            list="daftar-kategori"
            defaultValue={buku?.kategori}
            required
          />
          <Field
            label="Tahun terbit"
            name="tahun"
            type="number"
            min={1000}
            max={2100}
            defaultValue={buku?.tahun ?? ""}
          />
          <Field
            label="Stok *"
            name="stok"
            type="number"
            min={0}
            defaultValue={buku?.stok ?? 1}
            required
          />
        </div>
        <datalist id="daftar-kategori">
          {daftarKategori.map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Deskripsi</span>
          <textarea
            name="deskripsi"
            rows={4}
            defaultValue={buku?.deskripsi ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <div className="flex gap-3">
          <button
            disabled={pending}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
          <Link
            href="/admin/buku"
            className="rounded-lg px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-100"
          >
            Batal
          </Link>
        </div>
      </div>
    </form>
  );
}
