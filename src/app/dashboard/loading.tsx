export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center relative z-50">
      <div className="flex items-center gap-3 py-3 px-5 bg-emerald-950 rounded-full shadow-2xl border border-emerald-800 animate-in fade-in zoom-in duration-300">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-800"></div>
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-white tracking-wide animate-pulse">Memuat...</p>
      </div>
    </div>
  );
}
