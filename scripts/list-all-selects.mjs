import fs from 'node:fs';

const html = fs.readFileSync('preview/index.html', 'utf8');
const js = fs.readFileSync('preview/app.js', 'utf8');

console.log('=== SELECTS IN HTML ===');
for (const match of html.matchAll(/<select[^>]*>/g)) {
  console.log(match[0]);
}

console.log('\n=== SELECTS IN JS ===');
for (const match of js.matchAll(/<select[^>]*>/g)) {
  console.log(match[0]);
}
