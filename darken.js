const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'src', 'app', 'admin'),
  path.join(__dirname, 'src', 'components', 'admin'),
  path.join(__dirname, 'src', 'app', 'dashboard'),
  path.join(__dirname, 'src', 'components', 'dashboard'),
  path.join(__dirname, 'src', 'components', 'paket'),
  path.join(__dirname, 'src', 'components', 'tabungan')
];

const replacements = [
  { from: /bg-black\/40/g, to: 'bg-black/80' },
  { from: /bg-black\/50/g, to: 'bg-black/80' },
  { from: /bg-black\/60/g, to: 'bg-black/80' },
  { from: /hover:bg-black\/50/g, to: 'hover:bg-black/90' },
  { from: /hover:bg-black\/60/g, to: 'hover:bg-black/90' },
  { from: /hover:bg-black\/70/g, to: 'hover:bg-black/90' }
];

function walkDir(targetPath) {
  let files = [];
  if (!fs.existsSync(targetPath)) return files;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (targetPath.endsWith('.tsx')) files.push(targetPath);
    return files;
  }
  const items = fs.readdirSync(targetPath);
  for (const item of items) {
    const fullPath = path.join(targetPath, item);
    const itemStat = fs.statSync(fullPath);
    if (itemStat.isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (itemStat.isFile() && fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

dirs.forEach(dir => {
  const files = walkDir(dir);
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated ' + file);
    }
  }
});
console.log('Done!');
