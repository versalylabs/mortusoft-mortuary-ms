import fs from 'node:fs';

const html = fs.readFileSync('preview/index.html', 'utf8');
const js = fs.readFileSync('preview/app.js', 'utf8');
const pcss = fs.readFileSync('preview/preview.css', 'utf8');
const ph2 = fs.readFileSync('src/app/phase2.css', 'utf8');
const glob = fs.readFileSync('src/app/globals.css', 'utf8');

const combinedCss = pcss + '\n' + ph2 + '\n' + glob;

const classes = new Set();
for (const match of html.matchAll(/class=["']([^"']+)["']/g)) {
  match[1].split(/\s+/).forEach(c => c && classes.add(c.trim()));
}
for (const match of js.matchAll(/class=["']([^"']+)["']/g)) {
  match[1].split(/\s+/).forEach(c => c && classes.add(c.trim()));
}
for (const match of js.matchAll(/className\s*=\s*["']([^"']+)["']/g)) {
  match[1].split(/\s+/).forEach(c => c && classes.add(c.trim()));
}

console.log('Total unique classes in HTML + JS:', classes.size);
const missing = [];
for (const c of Array.from(classes).sort()) {
  if (!combinedCss.includes('.' + c)) {
    missing.push(c);
  }
}
console.log('Classes not found in CSS:');
console.log(missing);
