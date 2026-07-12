"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

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
        { name: "Tabungan Umrah", href: "/dashboard/tabungan" },
        { name: "Tabungan Haji", href: "/dashboard/tabungan/haji" },
      ]
    },
    { 
      name: "Paket", 
      icon: MapIcon,
      children: [
        { name: "Paket Umrah", href: "/dashboard/paket" },
        { name: "Paket Haji", href: "/dashboard/paket/haji" },
      ]
    },
  ];

  useEffect(() => {
    navigation.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => 
          pathname === child.href || (child.href !== '/dashboard' && pathname.startsWith(child.href + '/'))
        );
        if (isChildActive && !openMenus.includes(item.name)) {
          setOpenMenus(prev => [...prev, item.name]);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white flex text-black">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden shadow-2xl border-r border-white/20 bg-white/10 backdrop-blur-md">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/bg-sidebar-new.jpeg" alt="Sidebar Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
          </div>
          
          <div className="relative z-10 flex flex-col flex-1 bg-white/5 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center pt-1 pb-4 flex-shrink-0 px-4 border-b border-white/30 bg-white/20 backdrop-blur-md space-y-0">
              <img src="/images/logo_.png" alt="Logo" className="h-24 w-auto drop-shadow-md -mb-1" />
              <div className="text-center space-y-0">
                <h1 className="text-base font-extrabold text-emerald-950 drop-shadow-sm leading-tight">
                  Tabungan Umrah & Haji
                </h1>
                <p className="text-xs font-bold text-emerald-900 drop-shadow-sm">
                  Madinah Salam Wisata
                </p>
              </div>
            </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-6 space-y-3 overflow-y-auto">
              {navigation.map((item) => {
                if (item.children) {
                  const isOpen = openMenus.includes(item.name);
                  return (
                    <div key={item.name} className="space-y-2">
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all border backdrop-blur-sm shadow-sm ${isOpen ? 'bg-white/40 border-white/50 text-emerald-900 scale-[0.98]' : 'bg-white/20 border-white/30 text-emerald-800 hover:bg-white/30 hover:text-emerald-900 hover:shadow-md'}`}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`${
                              isOpen ? "text-emerald-900" : "text-emerald-700 group-hover:text-emerald-900"
                            } flex-shrink-0 -ml-1 mr-3 h-5 w-5`}
                          />
                          <span className="drop-shadow-sm font-bold">{item.name}</span>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180 text-emerald-900' : 'text-emerald-800'}`} />
                      </button>
                      {isOpen && (
                        <div className="pl-6 pr-1 space-y-2 mt-2">
                          {item.children.map(child => {
                            const isChildCurrent = pathname === child.href || (child.href !== '/dashboard' && pathname.startsWith(child.href + '/'));
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={`${
                                  isChildCurrent
                                    ? "bg-white/50 text-emerald-900 font-bold border-white/60 shadow-md scale-[0.98]"
                                    : "bg-white/10 text-emerald-800 font-semibold hover:bg-white/30 hover:text-emerald-900 border-white/20 hover:shadow-md"
                                } flex items-center px-4 py-2.5 text-xs md:text-sm rounded-xl transition-all backdrop-blur-sm border drop-shadow-sm`}
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
                    className={`${
                      isActive
                        ? "bg-white/40 text-emerald-900 border-white/50 font-bold shadow-md scale-[0.98]"
                        : "bg-white/20 text-emerald-800 font-semibold hover:bg-white/30 hover:text-emerald-900 border-white/30 hover:shadow-md"
                    } group flex items-center px-4 py-3 text-sm rounded-xl transition-all backdrop-blur-sm border drop-shadow-sm`}
                  >
                    <item.icon
                      className={`${
                        isActive ? "text-emerald-900" : "text-emerald-700 group-hover:text-emerald-900"
                      } flex-shrink-0 -ml-1 mr-3 h-5 w-5`}
                    />
                    <span className={isActive ? "font-bold" : "font-semibold"}>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold uppercase drop-shadow-md">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium text-white truncate drop-shadow-md">{session?.user?.name}</p>
                  <p className="text-xs font-medium text-gray-300 truncate drop-shadow-md">{session?.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                Keluar
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Mobile Header & Nav */}
      <div className="md:hidden fixed top-0 w-full z-20">
        <div className="flex items-center justify-between bg-black/70 backdrop-blur-sm h-16 px-4 shadow-md border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/images/logo_.png" alt="Logo" className="h-9 w-auto" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-white drop-shadow-md leading-tight">
                Tabungan Umrah & Haji
              </h1>
              <p className="text-[10px] text-gray-200 drop-shadow-md">
                Madinah Salam Wisata
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-gray-200 p-2"
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
          <div className="relative bg-black/70 backdrop-blur-md shadow-xl border-b border-white/10">
            <div className="px-3 pt-4 pb-4 space-y-3">
              {navigation.map((item) => {
                if (item.children) {
                  const isOpen = openMenus.includes(item.name);
                  return (
                    <div key={item.name} className="space-y-2">
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-medium transition-all border backdrop-blur-sm shadow-sm ${isOpen ? 'bg-white/40 border-white/50 text-emerald-900 scale-[0.98]' : 'bg-white/20 border-white/30 text-emerald-800 hover:bg-white/30 hover:text-emerald-900'}`}
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
                            const isChildCurrent = pathname === child.href || (child.href !== '/dashboard' && pathname.startsWith(child.href + '/'));
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`${
                                  isChildCurrent
                                    ? "bg-white/50 text-emerald-900 font-bold border-white/60 shadow-md scale-[0.98]"
                                    : "bg-white/10 text-emerald-800 font-semibold hover:bg-white/30 hover:text-emerald-900 border-white/20 hover:shadow-md"
                                } block px-4 py-2.5 text-sm rounded-xl transition-all backdrop-blur-sm border drop-shadow-sm`}
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
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${
                      isActive
                        ? "bg-white/40 text-emerald-900 font-bold border-white/50 shadow-md scale-[0.98]"
                        : "bg-white/20 text-emerald-800 font-semibold hover:bg-white/30 hover:text-emerald-900 border-white/30 hover:shadow-md"
                    } block px-4 py-3 rounded-xl text-base flex items-center gap-3 transition-all backdrop-blur-sm border drop-shadow-sm`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-emerald-900" : "text-emerald-700"}`} />
                    <span className={isActive ? "font-bold" : "font-semibold"}>{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left text-gray-300 hover:bg-white/10 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 drop-shadow-sm"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-400" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 pt-16 md:pt-0">
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
