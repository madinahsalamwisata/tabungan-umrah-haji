import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TabunganHajiDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="relative rounded-2xl p-8 md:p-12 shadow-xl overflow-hidden text-center border border-white/10 flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('/images/bg/bg-paket.jpeg')" }}></div>
        <div className="absolute inset-0 bg-[#111814]/40 backdrop-blur-sm z-0"></div>
        
        <div className="relative z-10 mx-auto w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2 className="relative z-10 text-lg md:text-xl font-semibold text-white mb-3">Tabungan Haji Segera Hadir</h2>
        <p className="relative z-10 text-white/80 max-w-2xl mx-auto leading-relaxed text-sm md:text-base italic font-light">
          "Semoga Allah <i>Subhanahu Wa Ta'ala</i> memudahkan kami untuk segera menyelenggarakan program Haji dan memudahkan langkah jamaah kami untuk menunaikan ibadah Haji ke Baitullah. Amin Ya Rabbal 'Alamin."
        </p>
      </div>

      <div className="pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Paket Estimasi Haji</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada paket estimasi</h3>
          <p className="mt-1 text-sm text-gray-500">Saat ini belum ada paket estimasi Haji yang tersedia untuk ditampilkan.</p>
        </div>
      </div>
    </div>
  );
}
