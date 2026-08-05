import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  { regex: /#D3FFE9/gi, replacement: '#D9F4F3' },
  { regex: /211,\s*255,\s*233/g, replacement: '217, 244, 243' }
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

for (const dir of DIRECTORIES) {
  const fullDirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullDirPath)) {
    processDirectory(fullDirPath);
  }
}
