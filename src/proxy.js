import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Semua halaman, kecuali file statis dan gambar
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
