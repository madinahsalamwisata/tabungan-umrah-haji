import { getSettings } from "@/lib/settings";
import SyaratKetentuanClient from "./SyaratKetentuanClient";

export const metadata = {
  title: "Syarat & Ketentuan Khusus | Tabungan Umrah & Haji",
};

export const revalidate = 0;

export default async function SyaratKetentuanPage() {
  const initialSettings = await getSettings();

  return <SyaratKetentuanClient initialSettings={initialSettings} />;
}
