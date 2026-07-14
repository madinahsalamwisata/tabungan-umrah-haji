const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/DashboardClient.tsx', 'utf8');

// 1. Important announcement boxes -> green background, same as regular
content = content.replace(
  /bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 hover:from-yellow-200 hover:to-yellow-300/g,
  'bg-emerald-700 border-emerald-600 hover:bg-emerald-600'
);

content = content.replace(
  /item\.is_penting \? "text-yellow-900" : "text-white"/g,
  'item.is_penting ? "text-white" : "text-white"'
);

content = content.replace(
  /item\.is_penting \? "text-yellow-800" : "text-emerald-100"/g,
  'item.is_penting ? "text-emerald-100" : "text-emerald-100"'
);

// 2. Headings -> text-emerald-900
content = content.replace(/text-3xl font-bold text-gray-900 mb-2/g, 'text-3xl font-bold text-emerald-900 mb-2');
content = content.replace(/text-lg font-bold text-gray-900/g, 'text-lg font-bold text-emerald-900');

fs.writeFileSync('src/app/dashboard/DashboardClient.tsx', content, 'utf8');
console.log('Fixed styles');
