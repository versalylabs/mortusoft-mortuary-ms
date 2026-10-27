import fs from 'node:fs';

const html = fs.readFileSync('preview/index.html', 'utf8');
const lines = html.split('\n');

console.log('--- LINE 27: Case detail ---');
console.log(lines[26]);

console.log('--- LINE 28: Setup ---');
console.log(lines[27]);

console.log('--- LINE 29: Team ---');
console.log(lines[28]);
