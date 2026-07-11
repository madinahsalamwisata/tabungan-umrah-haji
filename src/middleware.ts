export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/profil/:path*", "/tabungan/:path*", "/paket/:path*"],
};
