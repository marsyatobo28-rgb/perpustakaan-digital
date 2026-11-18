"use client";

import { useFormStatus } from "react-dom";

function Tombol({ children, className }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending ? "Memproses..." : children}
    </button>
  );
}

// Tombol yang meminta konfirmasi dulu sebelum menjalankan server action
export default function TombolKonfirmasi({ action, konfirmasi, fields = {}, className = "", children }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (konfirmasi && !window.confirm(konfirmasi)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([nama, nilai]) => (
        <input key={nama} type="hidden" name={nama} value={nilai} />
      ))}
      <Tombol className={className}>{children}</Tombol>
    </form>
  );
}
