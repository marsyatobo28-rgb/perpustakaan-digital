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
      <body className={`${geist.className} min-h-screen antialiased`}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
