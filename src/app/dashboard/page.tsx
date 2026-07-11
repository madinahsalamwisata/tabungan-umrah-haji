export default function DashboardPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-emerald-200 rounded-lg h-96 flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="bg-emerald-100 p-4 rounded-full mb-4">
          <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-emerald-900 mb-2">Selamat Datang di Dashboard!</h2>
        <p className="text-emerald-600 max-w-md mx-auto">
          Anda telah berhasil masuk ke sistem tabungan Umrah. Di sini Anda akan dapat melihat paket umrah, merencanakan tabungan, dan melihat riwayat setoran.
        </p>
      </div>
    </div>
  );
}
