const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
content = content.replace(/bg-gradient-to-br from-emerald-900\/60 to-black\/60 backdrop-blur-xl/g, 'bg-emerald-950 backdrop-blur-xl border-emerald-800');
fs.writeFileSync('src/app/dashboard/layout.tsx', content, 'utf8');

let dashboard = fs.readFileSync('src/app/dashboard/DashboardClient.tsx', 'utf8');

// Izin PPIU
dashboard = dashboard.replace(/bg-emerald-50 border border-emerald-200/g, 'bg-emerald-900/80 backdrop-blur-md border border-emerald-700/50');
dashboard = dashboard.replace(/text-gray-500 block uppercase tracking-wider">Izin PPIU/g, 'text-emerald-200 block uppercase tracking-wider">Izin PPIU');
dashboard = dashboard.replace(/text-sm font-bold text-emerald-800">0301/g, 'text-sm font-bold text-white">0301');

// Pengumuman Items
dashboard = dashboard.replace(/bg-gradient-to-br from-yellow-50\/90 to-white\/90 border-yellow-300/g, 'bg-gradient-to-br from-yellow-600/30 to-yellow-800/50 backdrop-blur-md border-yellow-500/50 hover:from-yellow-600/40 hover:to-yellow-800/60');
dashboard = dashboard.replace(/bg-white\/80 border-gray-200 hover:bg-white\/10/g, 'bg-emerald-900/80 backdrop-blur-md border-emerald-700/50 hover:bg-emerald-800/80');
dashboard = dashboard.replace(/bg-white\/90 border-gray-200 hover:bg-white/g, 'bg-emerald-900/80 backdrop-blur-md border-emerald-700/50 hover:bg-emerald-800/80');

dashboard = dashboard.replace(/\(item\.is_penting \? "text-emerald-800" : "text-gray-800"\)/g, '(item.is_penting ? "text-yellow-400" : "text-white")');
dashboard = dashboard.replace(/text-gray-500 uppercase tracking-wide flex items-center/g, 'text-emerald-200/70 uppercase tracking-wide flex items-center');

// Pengumuman Empty state
dashboard = dashboard.replace(/text-gray-500 bg-white\/90 rounded-xl border border-gray-200/g, 'text-emerald-200 bg-emerald-900/80 backdrop-blur-md rounded-xl border border-emerald-700/50');
dashboard = dashboard.replace(/text-gray-900\/20 mb-3/g, 'text-emerald-500/50 mb-3');

// Accordions
dashboard = dashboard.replace(/border-gray-200 rounded-xl overflow-hidden bg-white\/90 backdrop-blur-sm shadow-sm transition-all hover:bg-white/g, 'border-emerald-700/50 rounded-xl overflow-hidden bg-emerald-900/80 backdrop-blur-sm shadow-sm transition-all hover:bg-emerald-800/80');
dashboard = dashboard.replace(/<FileText className="w-5 h-5 text-emerald-800" \/>/g, '<FileText className="w-5 h-5 text-white" />');
dashboard = dashboard.replace(/<CreditCard className="w-5 h-5 text-emerald-800" \/>/g, '<CreditCard className="w-5 h-5 text-white" />');
dashboard = dashboard.replace(/<Briefcase className="w-5 h-5 text-emerald-800" \/>/g, '<Briefcase className="w-5 h-5 text-white" />');
dashboard = dashboard.replace(/<Info className="w-5 h-5 text-emerald-800" \/>/g, '<Info className="w-5 h-5 text-white" />');

dashboard = dashboard.replace(/<span className="font-bold text-sm text-gray-900">/g, '<span className="font-bold text-sm text-white">');
dashboard = dashboard.replace(/<span className="font-bold text-sm text-gray-900 drop-shadow-sm">/g, '<span className="font-bold text-sm text-white drop-shadow-sm">');
dashboard = dashboard.replace(/<ChevronUp className="text-gray-500 w-5 h-5" \/>/g, '<ChevronUp className="text-emerald-200 w-5 h-5" />');
dashboard = dashboard.replace(/<ChevronDown className="text-gray-500 w-5 h-5" \/>/g, '<ChevronDown className="text-emerald-200 w-5 h-5" />');

// Accordion Content texts
dashboard = dashboard.replace(/text-xs text-gray-600 border-t border-gray-200/g, 'text-xs text-emerald-100 border-t border-emerald-700/50');
dashboard = dashboard.replace(/<strong className="text-gray-900 block mb-0.5">/g, '<strong className="text-white block mb-0.5">');

fs.writeFileSync('src/app/dashboard/DashboardClient.tsx', dashboard, 'utf8');
console.log('Update finished');
