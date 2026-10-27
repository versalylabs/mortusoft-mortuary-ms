import fs from 'node:fs';

const server = fs.readFileSync('local-preview-server.mjs', 'utf8');
const lines = server.split('\n');
const idx = lines.findIndex(l => l.includes("path === '/api/cases'") || l.includes('path === "/api/cases"'));
console.log('cases route line:', idx + 1);
lines.slice(idx, idx + 50).forEach((l, i) => console.log((idx+1+i) + ': ' + l));
