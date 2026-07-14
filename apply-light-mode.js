const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  let files;
  try {
    files = fs.readdirSync(dirPath);
  } catch(e) {
    return arrayOfFiles || [];
  }

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
}

const files = [
  ...getAllFiles('src/app/dashboard'),
  ...getAllFiles('src/app/admin'),
  ...getAllFiles('src/components')
];

let replacedCount = 0;

files.forEach(file => {
  if (file.includes('DashboardClient.tsx') && !file.includes('temp')) return; // Already done
  if (file.includes('layout.tsx')) return; // Don't mess with layouts just in case

  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Additional specific class replacements based on the log
  content = content.replace(/bg-black\/80 backdrop-blur-2xl border border-white\/10 rounded-\[2rem\] shadow-2xl/g, 'bg-white/90 backdrop-blur-md border border-emerald-100 rounded-[2rem] shadow-xl shadow-emerald-900/5');
  content = content.replace(/bg-black\/80 backdrop-blur-xl p-6 rounded-\[2rem\] shadow-2xl border border-white\/20/g, 'bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-emerald-100 shadow-emerald-900/5');
  content = content.replace(/bg-black\/80 backdrop-blur-xl rounded-\[2rem\] shadow-2xl border border-white\/20/g, 'bg-white/90 backdrop-blur-md rounded-[2rem] shadow-xl border border-emerald-100 shadow-emerald-900/5');
  content = content.replace(/bg-black\/80 backdrop-blur-xl border-white\/10/g, 'bg-white/90 backdrop-blur-md border-emerald-100 shadow-xl shadow-emerald-900/5');
  content = content.replace(/bg-black\/80 backdrop-blur-xl/g, 'bg-white/90 backdrop-blur-md');
  content = content.replace(/bg-black\/30 backdrop-blur-md rounded-\[2rem\]/g, 'bg-white/90 backdrop-blur-md rounded-[2rem]');
  content = content.replace(/bg-black\/30 backdrop-blur-md rounded-xl/g, 'bg-white/90 backdrop-blur-md rounded-xl');
  content = content.replace(/bg-black\/20/g, 'bg-emerald-50');
  content = content.replace(/bg-black\/80 border border-white\/10/g, 'bg-white border border-emerald-200');
  content = content.replace(/bg-black\/80 border border-white\/20/g, 'bg-white border border-emerald-200');
  content = content.replace(/bg-black\/80 p-3/g, 'bg-white/90 p-3');
  content = content.replace(/bg-black\/30/g, 'bg-emerald-50');
  
  content = content.replace(/border-white\/20/g, 'border-emerald-200');
  content = content.replace(/border-white\/10/g, 'border-emerald-100');
  content = content.replace(/border-white\/30/g, 'border-emerald-300');
  content = content.replace(/border-white\/40/g, 'border-emerald-400');
  
  content = content.replace(/bg-black\/80 backdrop-blur-sm/g, 'bg-black/40 backdrop-blur-sm'); // overlays
  
  // Clean up remaining text-whites that were missed or re-introduced
  content = content.replace(/text-white/g, 'text-emerald-900');
  // Re-fix buttons and some special cases
  content = content.replace(/text-emerald-900 group-hover:text-emerald-300/g, 'text-emerald-900 group-hover:text-emerald-700');
  content = content.replace(/bg-emerald-600 hover:bg-emerald-500 text-emerald-900/g, 'bg-emerald-600 hover:bg-emerald-500 text-white');
  content = content.replace(/bg-emerald-500 hover:bg-emerald-400 text-emerald-900/g, 'bg-emerald-500 hover:bg-emerald-400 text-white');
  content = content.replace(/bg-red-500 hover:bg-red-400 text-emerald-900/g, 'bg-red-500 hover:bg-red-400 text-white');
  
  content = content.replace(/hover:bg-black\/90/g, 'hover:bg-white/100');
  
  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
    replacedCount++;
  }
});

console.log('Total files updated:', replacedCount);
