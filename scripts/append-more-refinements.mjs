import fs from 'node:fs';

const previewCss = fs.readFileSync('preview/preview.css', 'utf8');

const moreRefinements = `
/* 7. REMAINING COMPONENT POLISH */
.member-table {
  overflow-x: auto;
}

.docs-list {
  margin-top: 22px;
}

.invoice-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.invoice-card-head > span:first-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.invoice-card-head b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  color: var(--ink);
}

.invoice-card-head small {
  font-size: 12px;
  color: var(--muted);
}

.invoice-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--line-subtle);
  border-bottom: 1px solid var(--line-subtle);
}

.invoice-items > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13.5px;
}

.invoice-items span {
  color: var(--ink);
}

.invoice-items b {
  font-family: 'JetBrains Mono', monospace;
  color: var(--palette-steel);
}

.invoice-totals {
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  padding: 14px 0 6px;
  font-size: 13.5px;
}

.invoice-totals > div {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.invoice-totals span {
  font-size: 11.5px;
  color: var(--muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.invoice-totals b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  color: var(--ink);
}

.invoice-issued {
  background: #EEF3F8;
  color: var(--palette-steel);
  border: 1px solid #CDD5DB;
}

.invoice-partially-paid {
  background: #FAF3EB;
  color: var(--palette-bronze);
  border: 1px solid var(--palette-sand);
}

.invoice-paid {
  background: #F0F7F2;
  color: #2D7D46;
  border: 1px solid #B8DCBF;
}

.release-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin: 18px 0;
  padding: 20px;
  background: #FAF8F5;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.release-summary > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.release-summary small {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--palette-steel);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.release-summary b {
  font-size: 14px;
  color: var(--ink);
}

.storage-assignment {
  display: flex;
  flex-direction: column;
}

/* Sign-in art ambient rings */
.art-orbit {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(227, 195, 157, 0.16);
  pointer-events: none;
}

.orbit-one {
  width: 280px;
  height: 280px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.orbit-two {
  width: 440px;
  height: 440px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
`;

fs.writeFileSync('preview/preview.css', previewCss + '\n' + moreRefinements, 'utf8');
console.log('Appended additional refinements to preview/preview.css');
