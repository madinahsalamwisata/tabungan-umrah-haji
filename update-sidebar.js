const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'src', 'app', 'dashboard', 'layout.tsx');
let content = fs.readFileSync(layoutPath, 'utf8');

content = content.replace(
  'const [openMenus, setOpenMenus] = useState<string[]>([]);',
  `const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<{ foto_url?: string | null } | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profil/me")
        .then(res => res.json())
        .then(data => setUserProfile(data))
        .catch(err => console.error("Failed to fetch profile:", err));
    }
  }, [status]);`
);

content = content.replace(
  '{ name: "Tabungan Umrah", href: "/dashboard/tabungan" },',
  '{ name: "Tabungan Umrah", href: "/dashboard/tabungan", short: "TU" },'
).replace(
  '{ name: "Tabungan Haji", href: "/dashboard/tabungan/haji" },',
  '{ name: "Tabungan Haji", href: "/dashboard/tabungan/haji", short: "TH" },'
).replace(
  '{ name: "Paket Umrah", href: "/dashboard/paket" },',
  '{ name: "Paket Umrah", href: "/dashboard/paket", short: "PU" },'
).replace(
  '{ name: "Paket Haji", href: "/dashboard/paket/haji" },',
  '{ name: "Paket Haji", href: "/dashboard/paket/haji", short: "PH" },'
);

content = content.replace(
  '<div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">',
  '<div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${isCollapsed ? \'md:w-20\' : \'md:w-64\'}`}>'
);

content = content.replace(
  /<div className="relative z-10 flex flex-col flex-1 min-h-0 bg-white\/5 backdrop-blur-sm">\s*<div className="flex flex-row items-center pt-5 pb-5 flex-shrink-0 px-5 border-b border-white\/30 bg-white\/20 backdrop-blur-md gap-3\.5 rounded-b-lg">\s*<img src="\/images\/ms-wisata-new-logo\.png" alt="Logo" className="h-14 w-auto drop-shadow-md shrink-0" \/>\s*<div className="text-left flex flex-col justify-center">\s*<h1 className="text-sm font-extrabold text-white drop-shadow-sm leading-tight">\s*Tabungan Umrah & Haji\s*<\/h1>\s*<p className="text-\[11px\] font-bold text-yellow-300 drop-shadow-sm mt-0\.5">\s*Madinah Salam Wisata\s*<\/p>\s*<\/div>\s*<\/div>/g,
  `<div className="relative z-10 flex flex-col flex-1 min-h-0 bg-white/5 backdrop-blur-sm">
            {/* Toggle Sidebar Button */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-6 bg-emerald-600 text-white rounded-full p-1 shadow-md border-2 border-white z-50 hover:bg-emerald-700 transition-colors hidden md:block"
            >
              <ChevronDownIcon className={\`w-4 h-4 transition-transform duration-300 \${isCollapsed ? '-rotate-90' : 'rotate-90'}\`} />
            </button>

            <div className={\`flex flex-row items-center pt-5 pb-5 flex-shrink-0 px-5 border-b border-white/30 bg-white/20 backdrop-blur-md rounded-b-lg transition-all duration-300 \${isCollapsed ? 'justify-center' : 'gap-3.5'}\`}>
              <img src="/images/ms-wisata-new-logo.png" alt="Logo" className={\`\${isCollapsed ? 'h-10' : 'h-14'} w-auto drop-shadow-md shrink-0 transition-all duration-300\`} />
              {!isCollapsed && (
                <div className="text-left flex flex-col justify-center overflow-hidden transition-all duration-300">
                  <h1 className="text-sm font-extrabold text-white drop-shadow-sm leading-tight whitespace-nowrap">
                    Tabungan Umrah & Haji
                  </h1>
                  <p className="text-[11px] font-bold text-yellow-300 drop-shadow-sm mt-0.5 whitespace-nowrap">
                    Madinah Salam Wisata
                  </p>
                </div>
              )}
            </div>`
);

content = content.replace(
  /<button\s*onClick={\(\) => toggleMenu\(item\.name\)}\s*className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm \${[^}]*}\`}\s*>\s*<div className="flex items-center">\s*<item\.icon\s*className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-300 \${[^}]*}\`}\s*aria-hidden="true"\s*\/>\s*{item\.name}\s*<\/div>\s*<ChevronDownIcon\s*className={`ml-3 h-4 w-4 flex-shrink-0 transition-transform duration-300 \${[^}]*}\`}\s*aria-hidden="true"\s*\/>\s*<\/button>/g,
  `<button
                        onClick={() => toggleMenu(item.name)}
                        className={\`group w-full flex items-center justify-between py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm \${
                          isCollapsed ? 'px-0 justify-center' : 'px-4'
                        } \${
                          isOpen 
                            ? "text-white bg-white/10" 
                            : "text-gray-200 bg-white/5 hover:bg-white/10 hover:text-white"
                        }\`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <div className={\`flex items-center \${isCollapsed ? 'w-full justify-center' : ''}\`}>
                          <item.icon
                            className={\`\${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0 transition-colors duration-300 \${
                              isOpen ? "text-white" : "text-gray-300 group-hover:text-white"
                            }\`}
                            aria-hidden="true"
                          />
                          {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDownIcon
                            className={\`ml-3 h-4 w-4 flex-shrink-0 transition-transform duration-300 \${
                              isOpen ? "rotate-180 text-white" : "text-gray-400 group-hover:text-white"
                            }\`}
                            aria-hidden="true"
                          />
                        )}
                      </button>`
);

content = content.replace(
  /<div\s*className={`overflow-hidden transition-all duration-300 ease-in-out \${[^}]*}\`}\s*>\s*<div className="pl-2 pr-2 space-y-1">\s*{item\.children\.map\(\(child\) => {\s*const isChildActive = pathname === child\.href;\s*return \(\s*<Link\s*key={child\.name}\s*href={child\.href}\s*className={`group flex items-center px-4 py-2\.5 text-sm font-medium rounded-xl transition-all duration-300 backdrop-blur-sm \${[^}]*}\`}\s*>\s*{child\.name}\s*<\/Link>\s*\);\s*}\)}\s*<\/div>\s*<\/div>/g,
  `<div
                        className={\`overflow-hidden transition-all duration-300 ease-in-out \${
                          isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                        }\`}
                      >
                        <div className={\`space-y-1 \${isCollapsed ? 'px-0' : 'pl-2 pr-2'}\`}>
                          {item.children.map((child: any) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={\`group flex items-center py-2.5 text-sm font-medium rounded-xl transition-all duration-300 backdrop-blur-sm \${
                                  isCollapsed ? 'px-0 justify-center font-bold text-xs' : 'px-4'
                                } \${
                                  isChildActive
                                    ? "text-white bg-white/20 shadow-md font-bold border-l-[3px] border-yellow-400"
                                    : "text-gray-300 bg-white/5 hover:text-white hover:bg-white/10"
                                }\`}
                                title={isCollapsed ? child.name : undefined}
                              >
                                {isCollapsed ? child.short : child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>`
);

content = content.replace(
  /<Link\s*key={item\.name}\s*href={item\.href!}\s*className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm \${[^}]*}\`}\s*>\s*<item\.icon\s*className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-300 \${[^}]*}\`}\s*aria-hidden="true"\s*\/>\s*{item\.name}\s*<\/Link>/g,
  `<Link
                    key={item.name}
                    href={item.href!}
                    className={\`group flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm \${
                      isCollapsed ? 'px-0 justify-center' : 'px-4'
                    } \${
                      isActive
                        ? "text-white bg-white/20 shadow-md font-bold border-l-[3px] border-yellow-400"
                        : "text-gray-200 bg-white/5 hover:bg-white/10 hover:text-white"
                    }\`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={\`\${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0 transition-colors duration-300 \${
                        isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                      }\`}
                      aria-hidden="true"
                    />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </Link>`
);

content = content.replace(
  /<div className="flex items-center mb-4">\s*<div className="w-8 h-8 rounded-full bg-white\/20 backdrop-blur-sm border border-white\/30 flex items-center justify-center text-white font-bold uppercase drop-shadow-md">\s*{session\?\.user\?\.name\?\.charAt\(0\) \|\| "U"}\s*<\/div>\s*<div className="ml-3 truncate">\s*<p className="text-sm font-medium text-white truncate drop-shadow-md">{session\?\.user\?\.name}<\/p>\s*<p className="text-xs font-medium text-gray-300 truncate drop-shadow-md">{session\?\.user\?\.email}<\/p>\s*<\/div>\s*<\/div>\s*<button\s*onClick={\(\) => signOut\({ callbackUrl: "\/login" }\)}\s*className="w-full flex items-center justify-center gap-2 bg-white\/10 hover:bg-white\/20 backdrop-blur-md text-white border border-white\/20 px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm"\s*>\s*<ArrowLeftOnRectangleIcon className="w-5 h-5" \/>\s*Keluar\s*<\/button>/g,
  `<div className={\`flex items-center \${isCollapsed ? 'justify-center' : 'mb-4'}\`}>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold uppercase drop-shadow-md overflow-hidden shrink-0">
                  {userProfile?.foto_url ? (
                    <img src={userProfile.foto_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    session?.user?.name?.charAt(0) || "U"
                  )}
                </div>
                {!isCollapsed && (
                  <div className="ml-3 truncate">
                    <p className="text-sm font-medium text-white truncate drop-shadow-md">{session?.user?.name}</p>
                    <p className="text-xs font-medium text-gray-300 truncate drop-shadow-md">{session?.user?.email}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className={\`w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-md text-sm font-bold transition-colors shadow-sm \${
                  isCollapsed ? 'p-2 mt-4' : 'px-4 py-2'
                }\`}
                title="Keluar"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                {!isCollapsed && <span>Keluar</span>}
              </button>`
);

content = content.replace(
  /<div className="flex-1 md:ml-64 flex flex-col min-w-0 pt-16 md:pt-0">/,
  '<div className={`flex-1 flex flex-col min-w-0 pt-16 md:pt-0 transition-all duration-300 ${isCollapsed ? \'md:ml-20\' : \'md:ml-64\'}`}>'
);

fs.writeFileSync(layoutPath, content, 'utf8');
console.log('Successfully updated layout.tsx');
