"use client";

import { useActionState } from "react";
import { hapusBuku } from "@/app/admin/buku/actions";

export default function HapusBukuButton({ id, judul }) {
  const [state, formAction, pending] = useActionState(hapusBuku, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`Hapus buku "${judul}"?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        disabled={pending}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "Menghapus..." : "Hapus"}
      </button>
      {state?.error && (
        <p className="mt-1 max-w-48 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
