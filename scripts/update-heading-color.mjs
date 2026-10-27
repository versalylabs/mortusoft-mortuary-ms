import fs from 'node:fs';

const headingCss = `
/* ==========================================================================
   PAGE MAIN HEADINGS COLOR (#4B6382 / Steel Slate Blue)
   ========================================================================== */
h1,
.preview-body h1,
.case-heading h1,
.team-header h1,
.reports-heading h1,
.workspace-rail h1,
.setup-heading h2,
.page-heading h1,
#welcome-name {
  color: #4B6382 !important;
}

h1 span:not(#welcome-name),
.heading-period {
  color: #A68868 !important;
}
`;

// 1. preview/preview.css
fs.appendFileSync('preview/preview.css', '\n' + headingCss, 'utf8');
console.log('Appended heading color to preview/preview.css');

// 2. src/app/phase2.css
fs.appendFileSync('src/app/phase2.css', '\n' + headingCss, 'utf8');
console.log('Appended heading color to src/app/phase2.css');

// 3. src/app/globals.css
fs.appendFileSync('src/app/globals.css', '\n' + headingCss, 'utf8');
console.log('Appended heading color to src/app/globals.css');
