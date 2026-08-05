import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  // Primary background/accent from Mint #C0FDDF -> #D9F4F3
  { regex: /#C0FDDF/gi, replacement: '#D9F4F3' },
  { regex: /192,\s*253,\s*223/g, replacement: '217, 244, 243' },
  // Secondary background teal #00BCD4 -> something that matches D9F4F3 better, like #B2EBF2 (or just keep it as an accent)
  { regex: /#00BCD4/gi, replacement: '#D9F4F3' },
  // Dark teal text #00838F -> Dark slate #263238
  { regex: /#00838F/gi, replacement: '#263238' },
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
