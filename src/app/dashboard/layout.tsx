"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userProfile, setUserProfile] = useState<{ foto_url?: string | null } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Matikan loading saat pathname berubah (selesai navigasi)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 400);
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.email === "madinahsalamwisata@gmail.com") {
        router.replace("/admin");
        return;
      }

      fetch("/api/profil/me")
        .then(res => res.json())
        .then(data => setUserProfile(data))
        .catch(err => console.error("Failed to fetch profile:", err));
    }
  }, [status]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);
  };

  const navigation = [
    { name: "Beranda", href: "/dashboard", icon: HomeIcon },
    { name: "Profil Saya", href: "/dashboard/profil", icon: UserIcon },
    { 
      name: "Tabungan", 
      icon: WalletIcon,
      children: [
        { name: "Tabungan Umrah", href: "/dashboard/tabungan", short: "TU" },
        { name: "Tabungan Haji", href: "/dashboard/tabungan/haji", short: "TH" },
      ]
    },
    { 
      name: "Paket", 
      icon: MapIcon,
      children: [
        { name: "Paket Umrah", href: "/dashboard/paket", short: "PU" },
        { name: "Paket Haji", href: "/dashboard/paket/haji", short: "PH" },
      ]
    },
  ];

  useEffect(() => {
    navigation.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => 
          pathname === child.href
        );
        if (isChildActive && !openMenus.includes(item.name)) {
          setOpenMenus(prev => [...prev, item.name]);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="h-screen flex text-emerald-950 relative font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 bg-black">
        <img 
          src="/images/bg/makkah_thumbnail.webp" 
          alt="Background Makkah" 
          className="w-full h-full object-cover opacity-30" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/70 to-black/95"></div>
      </div>

      {/* Sidebar for desktop */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${isCollapsed ? 'md:w-20' : 'md:w-64'} z-30`}>
        <div 
          className="flex-1 flex flex-col min-h-0 relative overflow-hidden shadow-2xl border-r border-white/70 bg-white/40 backdrop-blur-xl"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative z-10 flex flex-col flex-1 min-h-0">

            <div className={`flex flex-row items-center pt-5 pb-5 flex-shrink-0 px-4 border-b border-white/70 bg-white/50 backdrop-blur-sm transition-all duration-300 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <img src="/images/ms-wisata-new-logo.png" alt="Logo" className={`${isCollapsed ? 'h-10' : 'h-14'} w-auto drop-shadow-md shrink-0 transition-all duration-300`} />
                <div className={`text-left flex flex-col justify-center overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                  <h1 className="text-sm font-extrabold text-emerald-950 drop-shadow-sm leading-tight w-[140px]">
                    Tabungan Umrah dan Haji
                  </h1>
                  <p className="text-[11px] font-bold text-yellow-300 drop-shadow-sm mt-0.5 w-[140px]">
                    Madinah Salam Wisata
                  </p>
                </div>
            </div>
          <div className="flex flex-col flex-1 min-h-0">
            <nav className="custom-scrollbar overflow-y-auto flex-1 px-2 py-6 space-y-2">
              {navigation.map((item) => {
                if (item.children) {
                  const isOpen = openMenus.includes(item.name);
                  // Parent menu without active highlight
                  return (
                    <div key={item.name} className="space-y-1 relative">
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`group w-full flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
                          isCollapsed ? 'px-0 justify-center' : 'px-4 justify-between'
                        } ${
                          isOpen 
                            ? "text-emerald-950 bg-white/50" 
                            : "text-gray-800 bg-white/40 hover:bg-white/50 hover:text-emerald-950"
                        }`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`h-5 w-5 flex-shrink-0 transition-colors duration-300 ${
                              isOpen ? "text-emerald-950" : "text-gray-700 group-hover:text-emerald-950"
                            }`}
                            aria-hidden="true"
                          />
                          <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-[150px] opacity-100 ml-3 text-left'}`}>
                            {item.name}
                          </span>
                        </div>
                        <ChevronDownIcon
                          className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
                            isOpen ? "rotate-180 text-emerald-950" : "text-gray-600 group-hover:text-emerald-950"
                          } ${isCollapsed ? 'w-0 opacity-0 ml-0 border-none' : 'w-4 opacity-100 ml-3'}`}
                          aria-hidden="true"
                        />
                      </button>
                      
                      {/* Submenu Dropdown */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          (isOpen && !isCollapsed) ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="space-y-1 pl-2 pr-2">
                          {item.children.map((child: any) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                prefetch={true}
                                onClick={(e) => {
                                  if (pathname !== child.href) setIsNavigating(true);
                                }}
                                className={`group flex items-center py-2.5 text-sm font-medium rounded-xl transition-all duration-300 backdrop-blur-sm px-4 ${
                                  isChildActive
                                    ? "text-emerald-950 bg-white/70 shadow-md font-bold"
                                    : "text-gray-700 bg-white/40 hover:text-emerald-950 hover:bg-white/50"
                                }`}
                              >
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    prefetch={true}
                    onClick={(e) => {
                      if (pathname !== item.href) setIsNavigating(true);
                    }}
                    className={`group flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
                      isCollapsed ? 'px-0 justify-center' : 'px-4'
                    } ${
                      isActive
                        ? "text-emerald-950 bg-white/70 shadow-md font-bold"
                        : "text-gray-800 bg-white/40 hover:bg-white/50 hover:text-emerald-950"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 transition-colors duration-300 ${
                        isActive ? "text-emerald-950" : "text-gray-700 group-hover:text-emerald-950"
                      }`}
                      aria-hidden="true"
                    />
                    <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-[150px] opacity-100 ml-3 text-left'}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex-shrink-0 p-4 border-t border-white/70 bg-white/40 backdrop-blur-md">
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'mb-4'}`}>
                <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 flex items-center justify-center text-emerald-950 font-bold uppercase drop-shadow-md overflow-hidden shrink-0">
                  {userProfile?.foto_url ? (
                    <img src={userProfile.foto_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    session?.user?.name?.charAt(0) || "U"
                  )}
                </div>
                <div className={`truncate transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
                  <p className="text-sm font-medium text-emerald-950 truncate drop-shadow-md">{session?.user?.name}</p>
                  <p className="text-xs font-medium text-gray-700 truncate drop-shadow-md">{session?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className={`w-full flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md text-red-100 hover:text-emerald-950 border border-red-500/30 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  isCollapsed ? 'p-2 mt-4' : 'px-4 py-2.5'
                }`}
                title="Keluar"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[100px] opacity-100 ml-2'}`}>
                  Keluar
                </span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Mobile Header & Nav */}
      <div className="md:hidden fixed top-0 w-full z-40">
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-xl h-16 px-4 shadow-md border-b border-white/70">
          <div className="flex items-center gap-3">
            <img src="/images/ms-wisata-new-logo.png" alt="Logo" className="h-9 w-auto" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-emerald-950 drop-shadow-md leading-tight">
                Tabungan Umrah & Haji
              </h1>
              <p className="text-[10px] text-gray-800 drop-shadow-md">
                Madinah Salam Wisata
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-emerald-950 hover:text-gray-800 p-2"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white/80 backdrop-blur-2xl shadow-2xl border-b border-white/70">
            <div className="px-3 pt-4 pb-6 space-y-3">
              {navigation.map((item) => {
                if (item.children) {
                  const isOpen = openMenus.includes(item.name);
                  return (
                    <div key={item.name} className="space-y-2">
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-medium transition-all border backdrop-blur-sm shadow-sm active:scale-95 ${isOpen ? 'bg-white/40 border-white/50 text-emerald-900 scale-[0.98]' : 'bg-white/70 border-white/80 text-emerald-800 hover:bg-white/30 hover:text-emerald-900'}`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 ${isOpen ? "text-emerald-900" : "text-emerald-700"}`} />
                          <span className="drop-shadow-sm font-bold">{item.name}</span>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180 text-emerald-900' : 'text-emerald-800'}`} />
                      </button>
                      {isOpen && (
                        <div className="pl-6 pr-1 space-y-2 mt-2">
                          {item.children.map(child => {
                            const isChildCurrent = pathname === child.href;
                            return (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  onClick={() => {
                                    if (pathname !== child.href) setIsNavigating(true);
                                    setMobileMenuOpen(false);
                                  }}
                                  prefetch={true}
                                  className={`${
                                  isChildCurrent
                                    ? "bg-white/50 text-emerald-900 font-bold border-white/60 shadow-md scale-[0.98]"
                                    : "bg-white/50 text-emerald-800 font-semibold hover:bg-white/30 hover:text-emerald-900 border-white/70 hover:shadow-md"
                                } flex items-center px-4 py-2.5 text-sm rounded-xl transition-all backdrop-blur-sm border drop-shadow-sm active:scale-95`}
                              >
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    onClick={() => {
                      if (pathname !== item.href) setIsNavigating(true);
                      setMobileMenuOpen(false);
                    }}
                    prefetch={true}
                    className={`${
                      isActive
                        ? "bg-white/40 text-emerald-900 font-bold border-white/50 shadow-md scale-[0.98]"
                        : "bg-white/70 text-emerald-800 font-semibold hover:bg-white/30 hover:text-emerald-900 border-white/80 hover:shadow-md"
                    } px-4 py-3 rounded-xl text-base flex items-center gap-3 transition-all backdrop-blur-sm border drop-shadow-sm active:scale-95`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-emerald-900" : "text-emerald-700"}`} />
                    <span className={isActive ? "font-bold" : "font-semibold"}>{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left text-gray-700 hover:bg-white/50 hover:text-emerald-950 px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 drop-shadow-sm active:scale-95 transition-transform"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-600" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-w-0 pt-16 md:pt-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} relative z-10 h-screen`}>
        {/* Instant Loading Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-8 bg-white/50 rounded-2xl shadow-2xl border border-white/70 backdrop-blur-xl">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-900/50"></div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-emerald-700 animate-pulse">Memuat halaman...</p>
            </div>
          </div>
        )}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Icons components to keep it standalone without external dependencies
function HomeIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function UserIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function WalletIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function MapIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function Bars3Icon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function XMarkIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ArrowLeftOnRectangleIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function ChevronDownIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
