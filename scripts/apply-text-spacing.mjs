import fs from 'node:fs';

const spacingStyles = `
/* ==========================================================================
   TITLE & SUBTITLE TEXT SPACING & FLEX COLUMN COHESION
   Resolves all occurrences where titles and descriptions ran together.
   ========================================================================== */

/* 1. Admission Form Sections (#new-case) */
.admission-section > div:first-child > span {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  min-width: 0 !important;
}

.admission-section strong {
  display: block !important;
  font: 700 17px 'Plus Jakarta Sans', sans-serif !important;
  color: #4B6382 !important;
  line-height: 1.25 !important;
}

.admission-section small {
  display: block !important;
  font-size: 13px !important;
  color: var(--muted) !important;
  line-height: 1.4 !important;
}

/* 2. Documents List (.doc-info) */
.doc-info {
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
  min-width: 0 !important;
  flex: 1 !important;
}

.doc-info b {
  display: block !important;
  font-size: 14px !important;
  color: var(--ink) !important;
  line-height: 1.3 !important;
}

.doc-info small {
  display: block !important;
  color: var(--muted) !important;
  font-size: 12.5px !important;
  line-height: 1.4 !important;
}

/* 3. Storage Room Headers (.room-title) & Add Card */
.room-title {
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
  min-width: 0 !important;
}

.room-title b {
  display: block !important;
  font-size: 15px !important;
  color: var(--ink) !important;
  line-height: 1.3 !important;
}

.room-title small {
  display: block !important;
  color: var(--muted) !important;
  font-size: 12.5px !important;
}

.storage-add-card > div:first-child {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  min-width: 0 !important;
}

.storage-add-card > div:first-child b {
  display: block !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  color: var(--ink) !important;
}

.storage-add-card > div:first-child small {
  display: block !important;
  font-size: 12.5px !important;
  color: var(--muted) !important;
}

/* 4. Release Checklist Items & Proof */
.release-check-copy {
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
  min-width: 0 !important;
}

.release-check-copy b {
  display: block !important;
  font-size: 13.5px !important;
  color: var(--ink) !important;
  line-height: 1.3 !important;
}

.release-check-copy small {
  display: block !important;
  font-size: 12px !important;
  color: var(--muted) !important;
  line-height: 1.35 !important;
}

.release-doc-proof > div {
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
  min-width: 0 !important;
}

.release-doc-proof b {
  display: block !important;
  font-size: 13.5px !important;
  font-weight: 700 !important;
}

.release-doc-proof small {
  display: block !important;
  font-size: 12px !important;
}

/* 5. Team Summary Stat Blocks (#team) */
.team-summary > div > span:not(.summary-icon) {
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
  min-width: 0 !important;
}

.team-summary b {
  display: block !important;
  font: 800 26px/1 'Plus Jakarta Sans', sans-serif !important;
  color: var(--ink) !important;
}

.team-summary small {
  display: block !important;
  font-size: 12.5px !important;
  color: var(--muted) !important;
  margin-top: 2px !important;
}

/* 6. Section Card Headers with subtitle <small> */
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
}

/* 7. Message Prep Heading */
.message-prep > div:first-child {
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
}

.message-prep > div:first-child b {
  display: block !important;
  font-size: 14.5px !important;
  color: var(--ink) !important;
}

.message-prep > div:first-child small {
  display: block !important;
  font-size: 12.5px !important;
  color: var(--muted) !important;
}
`;

fs.appendFileSync('preview/preview.css', '\n' + spacingStyles, 'utf8');
console.log('Appended text spacing styles to preview/preview.css');

fs.appendFileSync('src/app/phase2.css', '\n' + spacingStyles, 'utf8');
console.log('Appended text spacing styles to src/app/phase2.css');
