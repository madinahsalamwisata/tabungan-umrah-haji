import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=InvalidToken", req.url));
    }

    const user = await prisma.jamaah.findFirst({
      where: {
        verification_token: token,
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=TokenNotFound", req.url));
    }

    await prisma.jamaah.update({
      where: {
        id: user.id,
      },
      data: {
        is_verified: true,
        verification_token: null,
      },
    });

    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/login?error=ServerError", req.url));
  }
}
