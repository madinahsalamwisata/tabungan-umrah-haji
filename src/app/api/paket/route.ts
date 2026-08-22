import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pakets = await prisma.paket.findMany({
      where: { is_deleted: false },
      orderBy: { tanggal_keberangkatan: 'asc' }
    });
    return NextResponse.json(pakets);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
