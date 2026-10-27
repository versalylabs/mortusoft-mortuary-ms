import fs from 'node:fs';

const authHeadingCss = `
/* ==========================================================================
   LOGIN PAGE MAIN HEADING COLOR (#A68868 / Warm Bronze Brown)
   High contrast against dark ocean navy background.
   ========================================================================== */
.auth-story h1,
.story-content h1 {
  color: #A68868 !important;
}

.story-content h1 span {
  color: #E3C39D !important;
}
`;

// 1. preview/preview.css
fs.appendFileSync('preview/preview.css', '\n' + authHeadingCss, 'utf8');
console.log('Appended login heading color to preview/preview.css');

// 2. src/app/phase2.css
fs.appendFileSync('src/app/phase2.css', '\n' + authHeadingCss, 'utf8');
console.log('Appended login heading color to src/app/phase2.css');

// 3. src/app/globals.css
fs.appendFileSync('src/app/globals.css', '\n' + authHeadingCss, 'utf8');
console.log('Appended login heading color to src/app/globals.css');
