const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.md')) {
      callback(filePath);
    }
  });
}

let fixed = 0;
let failed = 0;

walkDir('src/content/blog', (file) => {
  const content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('description: "이 글을 읽어보세요."')) return;
  
  const match = content.match(/^## 한줄 요약\s*\n\n(.+?)(?:\n\n|$)/m);
  if (!match) {
    console.log(`⚠ ${file}`);
    failed++;
    return;
  }
  
  const summary = match[1].trim().replace(/"/g, '\\"');
  const newContent = content.replace(
    'description: "이 글을 읽어보세요."',
    `description: "${summary}"`
  );
  
  fs.writeFileSync(file, newContent, 'utf-8');
  console.log(`✓ ${file}`);
  fixed++;
});

console.log(`\n총 ${fixed}개 파일 수정됨, ${failed}개 실패`);
