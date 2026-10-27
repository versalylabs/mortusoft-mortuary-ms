import fs from 'node:fs';

const js = fs.readFileSync('preview/app.js', 'utf8');
const lines = js.split('\n');
lines.forEach((l, i) => {
  if (l.includes('<select') || l.includes('select') || l.includes('status-filter')) {
    if (l.includes('select') || l.includes('filter')) {
      console.log(`${i+1}: ${l.trim().slice(0, 120)}`);
    }
  }
});
