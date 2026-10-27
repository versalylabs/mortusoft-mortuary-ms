import fs from 'node:fs';

const html = fs.readFileSync('preview/index.html', 'utf8');
const js = fs.readFileSync('preview/app.js', 'utf8');

console.log('--- ALL OCCURRENCES OF <small> IN HTML ---');
html.split('\n').forEach((l, i) => {
  if (l.includes('<small>')) {
    // print all matches of tags surrounding small
    const matches = l.match(/<[^>]+>[^<]+<\/[^>]+>\s*<small>[^<]+<\/small>/g);
    if (matches) console.log(`HTML:${i+1}:`, matches);
  }
});

console.log('\n--- ALL OCCURRENCES OF <small> IN JS ---');
js.split('\n').forEach((l, i) => {
  if (l.includes('<small>')) {
    const matches = l.match(/<[^>]+>[^<]+<\/[^>]+>\s*<small>[^<]+<\/small>/g);
    if (matches) console.log(`JS:${i+1}:`, matches);
  }
});
