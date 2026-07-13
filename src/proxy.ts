import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  // Check for NextAuth session cookie (works for both dev HTTP and prod HTTPS)
  const hasSessionToken = 
    req.cookies.has("next-auth.session-token") || 
    req.cookies.has("__Secure-next-auth.session-token");
  
  if (!hasSessionToken) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Karena token JWT terenkripsi dan decoding butuh secret di middleware edge, 
  // kita mengandalkan layout.tsx untuk client-side check role.
  // Tapi kita biarkan middleware meloloskan request yang sudah punya token.
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profil/:path*", "/tabungan/:path*", "/paket/:path*", "/admin/:path*"],
};
