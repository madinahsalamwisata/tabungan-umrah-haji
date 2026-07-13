export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm relative z-50">
      <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-xl border border-emerald-100/50 backdrop-blur-md">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-emerald-900">Memuat Data...</h3>
          <p className="text-sm text-emerald-600/80 animate-pulse">Mohon tunggu sebentar</p>
        </div>
      </div>
    </div>
  );
}
