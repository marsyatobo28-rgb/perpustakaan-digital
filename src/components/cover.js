// Gambar sampul buku. Kalau belum ada cover, tampilkan sampul default.
export default function Cover({ buku, className = "" }) {
  if (buku.cover_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={buku.cover_url}
        alt={`Sampul ${buku.judul}`}
        className={`aspect-[2/3] w-full rounded-xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex aspect-[2/3] w-full flex-col justify-between rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-3 text-white ${className}`}
    >
      <span className="text-2xl" aria-hidden>
        📖
      </span>
      <span className="line-clamp-4 text-sm font-semibold leading-snug">
        {buku.judul}
      </span>
    </div>
  );
}
