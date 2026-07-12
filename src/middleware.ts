import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Check for NextAuth session cookie (works for both dev HTTP and prod HTTPS)
  const hasSessionToken = 
    req.cookies.has("next-auth.session-token") || 
    req.cookies.has("__Secure-next-auth.session-token");
  
  if (!hasSessionToken) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profil/:path*", "/tabungan/:path*", "/paket/:path*", "/admin/:path*"],
};
