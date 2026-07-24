export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white">
      <div className="flex items-center gap-3 bg-hijau-900 px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-hijau-800 animate-pulse">
        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
        <span className="text-white font-bold text-sm tracking-wide">Loading...</span>
      </div>
    </div>
  );
}
