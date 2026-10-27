import fs from 'node:fs';

const targetBlock = `/* 6. Section Card Headers with subtitle <small> */
.custody-heading > div,
.docs-heading > div,
.billing-heading > div,
.release-heading > div,
.communications-heading > div {
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
}

.custody-heading small,
.docs-heading small,
.billing-heading small,
.release-heading small,
.communications-heading small {
  display: block !important;
  font-size: 13px !important;
  color: var(--muted) !important;
  margin-top: 3px !important;
  line-height: 1.4 !important;
}`;

const replacementBlock = `/* 6. Section Card Headers container layout & subtitles */
.custody-heading,
.docs-heading,
.billing-heading,
.release-heading,
.communications-heading {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  gap: 18px !important;
  margin-bottom: 22px !important;
  flex-wrap: wrap !important;
}

.custody-heading > div,
.docs-heading > div,
.billing-heading > div,
.release-heading > div,
.communications-heading > div {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  flex: 1 1 260px !important;
  min-width: 0 !important;
}

.custody-heading small,
.docs-heading small,
.billing-heading small,
.release-heading small,
.communications-heading small {
  display: block !important;
  font-size: 13px !important;
  color: var(--muted) !important;
  margin-top: 4px !important;
  margin-bottom: 2px !important;
  line-height: 1.4 !important;
}

.release-state-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  white-space: nowrap !important;
  padding: 6px 14px !important;
  border-radius: var(--radius-full) !important;
  font-size: 11.5px !important;
  font-weight: 800 !important;
  letter-spacing: 0.6px !important;
  flex-shrink: 0 !important;
  margin-top: 4px !important;
}

.release-pending {
  background: #FAF3EB !important;
  color: var(--palette-bronze) !important;
  border: 1px solid var(--palette-sand) !important;
}

.release-state-badge:not(.release-pending) {
  background: var(--green-light) !important;
  color: var(--green) !important;
  border: 1px solid var(--green-border) !important;
}`;

// Update preview/preview.css
let previewCss = fs.readFileSync('preview/preview.css', 'utf8');
if (previewCss.includes(targetBlock)) {
  previewCss = previewCss.replace(targetBlock, replacementBlock);
  fs.writeFileSync('preview/preview.css', previewCss, 'utf8');
  console.log('Updated preview/preview.css');
} else {
  console.error('Target block not found in preview/preview.css');
}

// Update src/app/phase2.css
let phase2Css = fs.readFileSync('src/app/phase2.css', 'utf8');
if (phase2Css.includes(targetBlock)) {
  phase2Css = phase2Css.replace(targetBlock, replacementBlock);
  fs.writeFileSync('src/app/phase2.css', phase2Css, 'utf8');
  console.log('Updated src/app/phase2.css');
} else {
  console.error('Target block not found in src/app/phase2.css');
}
