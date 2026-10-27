import fs from 'node:fs';

const js = fs.readFileSync('preview/app.js', 'utf8');
const lines = js.split('\n');

lines.forEach((l, i) => {
  if (l.includes('.addEventListener("submit"') || l.includes(".onsubmit =") || l.includes('form.addEventListener("submit"')) {
    console.log(`Line ${i+1}: ${l.trim().slice(0, 100)}`);
    // print next 10 lines
    for (let j = 1; j <= 8; j++) {
      if (lines[i+j]) console.log(`   +${j}: ${lines[i+j].trim().slice(0, 120)}`);
    }
  }
});
