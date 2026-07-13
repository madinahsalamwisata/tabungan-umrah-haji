export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative z-50">
      <div className="flex flex-col items-center gap-4 p-8 bg-white/10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-900/50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-emerald-300 drop-shadow-md">Memuat Data...</h3>
          <p className="text-sm text-emerald-100/80 animate-pulse mt-1 drop-shadow-sm">Mohon tunggu sebentar</p>
        </div>
      </div>
    </div>
  );
}
