import { readFileSync, writeFileSync } from "node:fs";

let html = readFileSync("preview/index.html", "utf8");

html = html.replace("<head>", `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b0f19">
  <title>Mortusoft · Mortuary Operations & Care Workspace</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/app/globals.css">
  <link rel="stylesheet" href="/src/app/phase2.css">
  <link rel="stylesheet" href="/preview.css">
  <style>[hidden]{display:none!important}</style>`);

// Clean out duplicate meta tags if any
html = html.replace(/<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">[\s\S]*?<title>Mortusoft · Local preview<\/title>/, "");

writeFileSync("preview/index.html", html, "utf8");
console.log("Updated head in preview/index.html");
