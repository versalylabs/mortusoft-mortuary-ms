import fs from 'node:fs';

const html = fs.readFileSync('preview/index.html', 'utf8');
const js = fs.readFileSync('preview/app.js', 'utf8');

function findUsage(term) {
  console.log(`\n=== USAGE: ${term} ===`);
  const htmlLines = html.split('\n');
  htmlLines.forEach((l, i) => {
    if (l.includes(term)) console.log(`HTML:${i+1}: ${l.slice(0, 160)}`);
  });
  const jsLines = js.split('\n');
  jsLines.forEach((l, i) => {
    if (l.includes(term)) console.log(`JS:${i+1}: ${l.slice(0, 160)}`);
  });
}

['team-card-foot', 'roles-note', 'member-menu', 'storage-assign-row', 'invoice-line-remove', 'release-check', 'contact-preferences-form', 'setup-main', 'report-services'].forEach(findUsage);
