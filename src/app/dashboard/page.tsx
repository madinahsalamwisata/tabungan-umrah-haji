import { PrismaClient } from "@prisma/client";
import DashboardClient from "./DashboardClient";

const prisma = new PrismaClient();

// Revalidate every 0 seconds (always dynamic) or you can set a revalidate time
export const revalidate = 0;

export default async function DashboardPage() {
  // Fetch data server-side
  const pengumuman = await prisma.pengumuman.findMany({
    orderBy: [
      { is_penting: 'desc' },
      { created_at: 'desc' }
    ],
    take: 10, // Get top 10 recent announcements
  });

  // Convert to plain object to pass to client component safely
  const serializedPengumuman = pengumuman.map(p => ({
    ...p,
    created_at: p.created_at.toISOString(),
  }));

  return <DashboardClient initialPengumuman={serializedPengumuman} />;
}
