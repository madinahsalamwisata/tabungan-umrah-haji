import { getSettings } from "@/lib/settings";
import TentangKamiClient from "./TentangKamiClient";

export const metadata = {
  title: "Tentang Kami | Tabungan Umrah & Haji",
};

export const revalidate = 0;

export default async function TentangKamiPage() {
  const initialSettings = await getSettings();

  return <TentangKamiClient initialSettings={initialSettings} />;
}
