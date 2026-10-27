import fs from 'node:fs';

const additions = `
.report-range .auth-submit,
.audit-filters .auth-submit {
  width: auto;
  max-width: fit-content;
  flex: 0 0 auto;
  height: 42px;
  padding: 0 22px;
  white-space: nowrap;
}

#report-range-label {
  margin-left: auto;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--palette-steel);
  background: #EEF3F8;
  border: 1px solid #CDD5DB;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.3px;
  display: inline-flex;
  align-items: center;
}
`;

fs.appendFileSync('src/app/phase2.css', additions, 'utf8');
console.log('Appended to src/app/phase2.css successfully');
