import fs from 'node:fs';

let css = fs.readFileSync('preview/preview.css', 'utf8');

const target = `.report-range, .audit-filters {
  display: flex;
  align-items: end;
  gap: 16px;
  margin: 26px 0 22px;
  padding: 22px 28px;
  background: var(--paper-card);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.report-range input, .audit-filters input {
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 13.5px;
}`;

const replacement = `.report-range, .audit-filters {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin: 26px 0 22px;
  padding: 20px 24px;
  background: var(--paper-card);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
}

.report-range label, .audit-filters label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--ink);
}

.report-range input, .audit-filters input {
  height: 42px;
  padding: 0 14px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: #ffffff;
  color: var(--ink);
  font: 500 13px 'Plus Jakarta Sans', sans-serif;
  outline: 0;
  transition: all 0.15s ease;
}

.report-range input:focus, .audit-filters input:focus {
  border-color: var(--palette-steel);
  box-shadow: 0 0 0 3px rgba(75, 99, 130, 0.18);
}

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
}`;

if (css.includes(target)) {
  css = css.replace(target, replacement);
  fs.writeFileSync('preview/preview.css', css, 'utf8');
  console.log('Successfully updated preview/preview.css');
} else {
  console.log('Target block not found in preview.css, appending replacement');
  css += '\n' + replacement + '\n';
  fs.writeFileSync('preview/preview.css', css, 'utf8');
}
