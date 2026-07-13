const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = [
  // Text Colors
  { from: /text-white/g, to: 'text-emerald-950' },
  { from: /text-gray-200/g, to: 'text-gray-800' },
  { from: /text-gray-300/g, to: 'text-gray-700' },
  { from: /text-gray-400/g, to: 'text-gray-600' },
  { from: /text-emerald-100/g, to: 'text-emerald-900' },
  { from: /text-emerald-200/g, to: 'text-emerald-800' },
  { from: /text-emerald-300/g, to: 'text-emerald-700' },
  { from: /text-emerald-400/g, to: 'text-emerald-700' },
  
  // Background Colors (Glassmorphism Light)
  { from: /bg-black\/20/g, to: 'bg-white/40' },
  { from: /bg-black\/30/g, to: 'bg-white/50' },
  { from: /bg-black\/40/g, to: 'bg-white/60' },
  { from: /bg-black\/60/g, to: 'bg-white/80' },
  { from: /bg-white\/5([^0])/g, to: 'bg-white/40$1' }, // Match bg-white/5 but not bg-white/50
  { from: /bg-white\/10/g, to: 'bg-white/50' },
  { from: /bg-white\/15/g, to: 'bg-white/60' },
  { from: /bg-white\/20/g, to: 'bg-white/70' },

  // Hover states
  { from: /hover:bg-white\/5([^0])/g, to: 'hover:bg-white/50$1' },
  { from: /hover:bg-white\/10/g, to: 'hover:bg-white/60' },
  { from: /hover:bg-white\/15/g, to: 'hover:bg-white/70' },
  { from: /hover:bg-white\/20/g, to: 'hover:bg-white/80' },
  { from: /hover:text-white/g, to: 'hover:text-emerald-900' },

  // Border Colors
  { from: /border-white\/10/g, to: 'border-white/60' },
  { from: /border-white\/20/g, to: 'border-white/70' },
  { from: /border-white\/30/g, to: 'border-white/80' },
  { from: /border-emerald-500\/30/g, to: 'border-emerald-500/40' },

  // Gradients
  { from: /from-emerald-900\/60/g, to: 'from-emerald-100/70' },
  { from: /to-black\/40/g, to: 'to-white/50' },
  { from: /from-black\/80/g, to: 'from-white/60' },
  { from: /via-emerald-950\/70/g, to: 'via-emerald-100/60' },
  { from: /to-black\/90/g, to: 'to-white/70' },

  // Admin Specific Hardcoded Colors
  { from: /bg-\[#0a0f0c\]/g, to: 'bg-emerald-50' },
  { from: /bg-\[#0f1712\]/g, to: 'bg-white/60' },
  { from: /bg-\[#0f1712\]\/90/g, to: 'bg-white/90' },
  { from: /bg-\[#0f1712\]\/80/g, to: 'bg-white/80' },
];

function walkDir(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (stat.isFile() && fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walkDir(directory);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

console.log('Theme switch completed!');
