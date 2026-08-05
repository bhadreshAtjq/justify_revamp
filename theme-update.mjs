import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPLACEMENTS = [
  // Hex Colors (case insensitive regex)
  { regex: /#0E4650/gi, replacement: '#2E7D32' },
  { regex: /#00969E/gi, replacement: '#1B5E20' },
  { regex: /#00767C/gi, replacement: '#1B5E20' },
  { regex: /#06B6D4/gi, replacement: '#F9A825' },
  { regex: /#F8FAFC/gi, replacement: '#F8FAF5' },
  { regex: /#1E293B/gi, replacement: '#263238' },
  { regex: /#64748B/gi, replacement: '#607D8B' },
  { regex: /#22C55E/gi, replacement: '#43A047' },
  { regex: /#F59E0B/gi, replacement: '#FB8C00' },
  { regex: /#EF4444/gi, replacement: '#E53935' },
  { regex: /#DC2626/gi, replacement: '#E53935' },
  { regex: /#D97706/gi, replacement: '#FB8C00' },
  // RGB values for rgba()
  { regex: /14,\s*70,\s*80/g, replacement: '46, 125, 50' },    // Primary
  { regex: /0,\s*150,\s*158/g, replacement: '27, 94, 32' },     // Secondary
  { regex: /6,\s*182,\s*212/g, replacement: '249, 168, 37' },   // Accent
  { regex: /245,\s*158,\s*11/g, replacement: '251, 140, 0' },   // Warning
  { regex: /30,\s*41,\s*59/g, replacement: '38, 50, 56' },      // Text Primary rgb for border (approx)
];

const DIRECTORIES = ['app', 'components'];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && /\.(tsx|ts|css|js|jsx)$/.test(file)) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replacement } of REPLACEMENTS) {
    content = content.replace(regex, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

console.log('Starting theme color replacement...');
for (const dir of DIRECTORIES) {
  const fullDirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullDirPath)) {
    processDirectory(fullDirPath);
  } else {
    console.warn(`Directory not found: ${fullDirPath}`);
  }
}
console.log('Theme replacement complete.');
