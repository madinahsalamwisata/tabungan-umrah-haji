const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/DashboardClient.tsx', 'utf8');

// Replace Izin PPIU
content = content.replace(/bg-emerald-900\/80 backdrop-blur-md border border-emerald-700\/50/g, 'bg-emerald-700 border border-emerald-600');

// Replace Pengumuman items
content = content.replace(/bg-emerald-900\/80 backdrop-blur-md border-emerald-700\/50 hover:bg-emerald-800\/80/g, 'bg-emerald-700 border-emerald-600 hover:bg-emerald-600');

// Replace empty state pengumuman
content = content.replace(/bg-emerald-900\/80 backdrop-blur-md rounded-xl border border-emerald-700\/50/g, 'bg-emerald-700 rounded-xl border border-emerald-600');

// Replace Accordions
content = content.replace(/bg-emerald-900\/80 backdrop-blur-sm shadow-sm transition-all hover:bg-emerald-800\/80/g, 'bg-emerald-700 shadow-sm transition-all hover:bg-emerald-600');

fs.writeFileSync('src/app/dashboard/DashboardClient.tsx', content, 'utf8');
console.log('Done replacing colors');
