"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [counts, setCounts] = useState({ jamaah: 0, pengumuman: 0 });

  // Get dynamic sidebar menu badge counts
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/counts")
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.jamaah === "number") {
            setCounts(data);
          }
        })
        .catch((err) => console.error("Error fetching counts:", err));
    }
  }, [status, pathname]);

  // Turn off loading navigation state when route finishes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email !== "madinahsalamwisata@gmail.com") {
      router.replace("/dashboard");
    }
  }, [status]);

  const navigation = [
    { 
      name: "Admin Dashboard", 
      href: "/admin", 
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
      )
    },
    { 
      name: "Data Jamaah", 
      href: "/admin/jamaah", 
      countKey: "jamaah" as const,
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      )
    },
    { 
      name: "Pengumuman", 
      href: "/admin/pengumuman", 
      countKey: "pengumuman" as const,
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      )
    },
    { 
      name: "Manajemen Paket", 
      href: "/admin/paket", 
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
      )
    },
  ];

  if (status === "loading" || session?.user?.email !== "madinahsalamwisata@gmail.com") {
    return (
      <div className="min-h-screen bg-[#0f1712] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-krem text-teks-900 font-sans overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-[264px] z-30 bg-white border-r border-garis">
        {/* Sidebar Head */}
        <div className="bg-gradient-to-br from-hijau-900 to-hijau-700 px-5 py-[26px] flex items-center gap-3 shrink-0">
          <img 
            src="/ms-wisata-new-logo.png" 
            alt="MS Wisata Logo" 
            className="w-[42px] h-[42px] object-contain shrink-0" 
          />
          <div className="text-left flex flex-col justify-center">
            <h1 className="text-sm font-bold text-white leading-tight">
              Admin Panel
            </h1>
            <p className="text-[10.5px] font-bold text-white/60 mt-0.5 uppercase tracking-wider">
              Madinah Salam Wisata
            </p>
          </div>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 flex flex-col min-h-0 text-slate-800 overflow-hidden">
          {/* Role Chip */}
          <div className="px-5 pt-4 shrink-0">
            <span className="inline-flex items-center gap-1.5 bg-hijau-100 text-hijau-800 text-[10.5px] font-extrabold tracking-wide px-3 py-1 rounded-full">
              <svg className="w-3.5 h-3.5 stroke-hijau-800 stroke-[2.2] fill-none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Super Admin
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 pr-1 custom-scrollbar space-y-1 pb-4">
            <div className="text-[10.5px] uppercase tracking-wider text-teks-300 font-extrabold mt-2 mb-2 mx-3">Menu Utama</div>
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
              const count = item.countKey ? counts[item.countKey] : 0;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={() => { if (pathname !== item.href) setIsNavigating(true); }}
                  className={`group flex items-center py-2.5 px-3 text-[13.5px] font-semibold rounded-xl transition-all duration-200 gap-3 ${
                    isActive
                      ? "text-hijau-900 bg-hijau-100 font-bold"
                      : "text-teks-500 hover:bg-krem hover:text-teks-900"
                  }`}
                >
                  <item.icon className={`h-[18px] w-[18px] flex-shrink-0 stroke-2 fill-none transition-colors duration-200 ${isActive ? "stroke-hijau-800" : "stroke-teks-300 group-hover:stroke-teks-900"}`} />
                  <span className="font-sans flex-1 text-left">{item.name}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${isActive ? "bg-emas text-hijau-900" : "bg-hijau-900 text-white"}`}>
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Foot */}
          <div className="p-4 border-t border-garis shrink-0 mt-auto bg-white">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-[13px] font-bold text-[#B3423A] hover:bg-[#FBEAE8] transition-colors text-left cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[#B3423A] stroke-[2.1] fill-none" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Keluar Admin
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-[264px] relative z-10 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-[76px] flex-shrink-0 bg-white border-b border-garis flex items-center justify-between px-6 sm:px-8 sticky top-0 z-20">
          <div className="search flex items-center gap-2 bg-krem border border-garis rounded-xl px-3.5 py-2 w-72 sm:w-80">
            <svg className="w-4 h-4 stroke-teks-300 stroke-2 fill-none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Cari jamaah, paket, atau pengumuman..." 
              className="border-none bg-transparent outline-none text-xs w-full text-teks-900 font-sans"
            />
          </div>
          <div className="top-right flex items-center gap-4">
            <div className="bell w-10 h-10 rounded-full bg-hijau-100 flex items-center justify-center relative cursor-pointer hover:bg-hijau-100/80 transition-colors">
              <svg className="w-[18px] h-[18px] stroke-hijau-800 stroke-2 fill-none" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <div className="dot absolute top-2.5 right-2.5 w-[7px] h-[7px] rounded-full bg-emas border-1.5 border-white"></div>
            </div>
            <div className="user-chip flex items-center gap-2.5 cursor-pointer">
              <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-hijau-700 to-hijau-900 flex items-center justify-center font-serif font-bold text-white text-[13px] shrink-0">
                {session?.user?.name?.[0] || "A"}
              </div>
              <div className="text-left hidden sm:block">
                <div className="uname text-xs font-bold text-teks-900 leading-tight">{session?.user?.name || "Administrator"}</div>
                <div className="urole text-[10px] text-teks-500 mt-0.5">Super Admin</div>
              </div>
              <svg className="w-3.5 h-3.5 text-teks-300 stroke-[2.4]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </header>

        {/* Mobile Header overlay */}
        <div className="md:hidden bg-gradient-to-br from-hijau-900 to-hijau-700 h-16 flex items-center justify-between px-4 shadow-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <img src="/ms-wisata-new-logo.png" alt="Logo" className="h-9 w-auto" />
            <h1 className="text-sm font-bold text-white">Admin Panel</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-gray-200 p-2"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            )}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl border-b border-garis z-30 transition-all">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
                const count = item.countKey ? counts[item.countKey] : 0;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      if (pathname !== item.href) setIsNavigating(true);
                      setMobileMenuOpen(false);
                    }}
                    prefetch={true}
                    className={`flex items-center py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                      isActive
                        ? "bg-hijau-100 text-hijau-900 border-hijau-200"
                        : "bg-white text-teks-500 hover:bg-krem border-garis"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 stroke-2 fill-none ${isActive ? "stroke-hijau-800" : "stroke-teks-300"}`} />
                    <span className="flex-1 text-left">{item.name}</span>
                    {count > 0 && (
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${isActive ? "bg-emas text-hijau-900" : "bg-hijau-900 text-white"}`}>
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left mt-4 text-[#B3423A] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors"
              >
                <svg className="w-5 h-5 stroke-[#B3423A] stroke-[2.1] fill-none" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Keluar Admin
              </button>
            </div>
          </div>
        )}

        {/* Instant Loading Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm px-4">
            <div className="flex items-center gap-3 py-3 px-5 bg-emerald-950 rounded-full shadow-2xl border border-emerald-800">
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-800"></div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-xs font-bold text-white tracking-wide animate-pulse">Loading...</p>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
