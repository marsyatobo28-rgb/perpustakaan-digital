// Grafik sederhana berbasis HTML/CSS (tanpa library), satu warna (indigo).

function batasAtas(maks) {
  if (maks <= 1) return 2;
  return maks % 2 === 0 ? maks : maks + 1; // genap supaya garis tengah bulat
}

// Grafik kolom: jumlah peminjaman per hari / per bulan
export function GrafikKolom({ data, satuan = "peminjaman" }) {
  const atas = batasAtas(Math.max(0, ...data.map((d) => d.jumlah)));
  const tinggi = 180;
  const tengah = Math.floor((data.length - 1) / 2);

  return (
    <div className="flex gap-2">
      {/* Sumbu Y */}
      <div
        className="relative w-6 shrink-0 text-right text-xs tabular-nums text-slate-400"
        style={{ height: tinggi }}
      >
        <span className="absolute right-0 top-0 -translate-y-1/2">{atas}</span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2">{atas / 2}</span>
        <span className="absolute bottom-0 right-0 translate-y-1/2">0</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height: tinggi }}>
          {/* Garis bantu */}
          <div className="absolute inset-x-0 top-0 border-t border-slate-100" />
          <div className="absolute inset-x-0 top-1/2 border-t border-slate-100" />
          <div className="absolute inset-x-0 bottom-0 border-t border-slate-300" />

          {/* Kolom */}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d) => (
              <div
                key={d.kunci}
                className="group relative flex h-full flex-1 items-end justify-center rounded-sm hover:bg-slate-100/70"
              >
                {d.jumlah > 0 && (
                  <div
                    className="w-full max-w-6 rounded-t-[4px] bg-indigo-600"
                    style={{ height: `${(d.jumlah / atas) * 100}%` }}
                  />
                )}
                <div className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white group-hover:block print:hidden">
                  {d.label}: <b>{d.jumlah}</b> {satuan}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Label sumbu X: awal, tengah, akhir */}
        <div className="flex gap-[2px] pt-2">
          {data.map((d, i) => (
            <div key={d.kunci} className="relative flex-1">
              {(i === 0 || i === tengah || i === data.length - 1) && (
                <span
                  className={`absolute whitespace-nowrap text-xs text-slate-500 ${
                    i === 0
                      ? "left-0"
                      : i === data.length - 1
                        ? "right-0"
                        : "left-1/2 -translate-x-1/2"
                  }`}
                >
                  {d.label}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}

// Grafik batang horizontal: buku terpopuler
export function GrafikBatang({ data }) {
  const maks = Math.max(1, ...data.map((d) => d.jumlah));

  return (
    <ol className="space-y-3">
      {data.map((d, i) => (
        <li
          key={d.judul}
          className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-3 text-sm"
        >
          <span className="truncate" title={`${d.judul} - ${d.penulis}`}>
            <span className="text-slate-400">{i + 1}.</span> {d.judul}
          </span>
          <div className="flex items-center gap-2">
            <div
              className="h-5 min-w-1 rounded-r-[4px] bg-indigo-600"
              style={{ width: `${(d.jumlah / maks) * 82}%` }}
              title={`${d.judul}: dipinjam ${d.jumlah}x`}
            />
            <span className="whitespace-nowrap tabular-nums text-slate-600">
              {d.jumlah}x
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
