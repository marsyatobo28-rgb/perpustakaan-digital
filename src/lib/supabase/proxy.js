import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Halaman yang boleh dibuka tanpa login
const HALAMAN_PUBLIK = ["/", "/login", "/daftar", "/katalog"];
// Halaman yang tidak perlu dibuka lagi kalau sudah login
const HALAMAN_TAMU = ["/login", "/daftar"];

function cocok(path, daftar) {
  return daftar.some(
    (p) => path === p || (p !== "/" && path.startsWith(p + "/"))
  );
}

export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    }
  );

  // Memperbarui sesi login. Jangan menaruh kode lain di antara
  // createServerClient dan getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && !cocok(path, HALAMAN_PUBLIK)) {
    return alihkan(request, response, "/login");
  }

  if (user && cocok(path, HALAMAN_TAMU)) {
    return alihkan(request, response, "/dashboard");
  }

  return response;
}

// Redirect sambil membawa cookie sesi yang baru diperbarui
function alihkan(request, response, pathname) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
