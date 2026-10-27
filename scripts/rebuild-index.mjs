import { readFileSync, writeFileSync } from "node:fs";

let html = readFileSync("preview/index.html", "utf8");

// Check if /preview.css is linked
if (!html.includes('href="/preview.css"')) {
  html = html.replace(
    '<link rel="stylesheet" href="/src/app/phase2.css">',
    '<link rel="stylesheet" href="/src/app/phase2.css"><link rel="stylesheet" href="/preview.css">'
  );
}

// Remove the scattered inline <style>...</style> blocks that override preview.css with 7px/8px fonts
// Keep only [hidden]{display:none!important}
html = html.replace(/<style>\s*\[hidden\]\{display:none!important\}<\/style>[\s\S]*?<\/head>/, `<style>[hidden]{display:none!important}</style>\n</head>`);

// Remove any remaining <style>...</style> tags in the body
html = html.replace(/<style>[\s\S]*?<\/style>/g, "");

// Re-add the essential [hidden] rule in head
html = html.replace("<head>", `<head>\n  <style>[hidden]{display:none!important}</style>`);

writeFileSync("preview/index.html", html, "utf8");
console.log("preview/index.html successfully updated!");
