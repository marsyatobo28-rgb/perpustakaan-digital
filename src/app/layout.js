import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "Perpustakaan Digital",
  description: "Aplikasi perpustakaan digital berbasis cloud",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geist.className} flex min-h-screen flex-col antialiased`}>
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:p-0">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white print:hidden">
          <div className="mx-auto max-w-6xl px-4 py-5 text-center text-sm text-slate-500">
            © 2026 Kelompok 3 Kelas C · Cloud Computing · Universitas Citra Bangsa
          </div>
        </footer>
      </body>
    </html>
  );
}
