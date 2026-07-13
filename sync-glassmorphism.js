const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = [
  { 
    from: /bg-white\/10 backdrop-blur-xl border border-white\/20/g, 
    to: 'bg-black/40 backdrop-blur-xl border border-white/10' 
  },
  { 
    from: /bg-white\/10 backdrop-blur-2xl/g, 
    to: 'bg-black/40 backdrop-blur-xl' 
  },
  { 
    from: /bg-white\/10 backdrop-blur-xl/g, 
    to: 'bg-black/40 backdrop-blur-xl' 
  },
  {
    from: /border border-white\/20 bg-white\/10 backdrop-blur-xl/g,
    to: 'border border-white/10 bg-black/40 backdrop-blur-xl'
  },
  {
    from: /bg-white\/10 backdrop-blur-md border border-white\/20/g,
    to: 'bg-black/40 backdrop-blur-xl border border-white/10'
  }
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

console.log('Glassmorphism sync completed!');
