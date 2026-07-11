const fs = require('fs');

const files = [
  "src/lib/auth.ts",
  "src/app/dashboard/tabungan/page.tsx",
  "src/app/dashboard/tabungan/baru/page.tsx",
  "src/app/dashboard/profil/page.tsx",
  "src/app/dashboard/paket/page.tsx",
  "src/app/api/tabungan/sync/route.ts",
  "src/app/api/tabungan/hapus/route.ts",
  "src/app/api/tabungan/edit/route.ts",
  "src/app/api/tabungan/bayar/route.ts",
  "src/app/api/tabungan/baru/route.ts",
  "src/app/api/register/route.ts",
  "src/app/api/profil/route.ts"
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('import { PrismaClient } from "@prisma/client";', 'import { prisma } from "@/lib/prisma";');
  content = content.replace('const prisma = new PrismaClient();', '');
  // some files might have single quotes
  content = content.replace("import { PrismaClient } from '@prisma/client';", 'import { prisma } from "@/lib/prisma";');
  
  // Ensure we don't leave double newlines
  content = content.replace('import { prisma } from "@/lib/prisma";\r\n\r\n\r\n', 'import { prisma } from "@/lib/prisma";\r\n');
  content = content.replace('import { prisma } from "@/lib/prisma";\n\n\n', 'import { prisma } from "@/lib/prisma";\n');
  
  fs.writeFileSync(file, content);
}
console.log("Done");
