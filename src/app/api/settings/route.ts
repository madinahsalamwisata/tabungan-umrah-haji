import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settingsMap = await getSettings();
    return NextResponse.json(settingsMap);
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    // Update multiple settings keys in a transaction
    const updatePromises = Object.entries(body).map(([key, val]) => {
      if (typeof val !== "string") return Promise.resolve();
      return prisma.setting.upsert({
        where: { key },
        update: { value: val },
        create: { key, value: val }
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Pengaturan berhasil disimpan" });
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
