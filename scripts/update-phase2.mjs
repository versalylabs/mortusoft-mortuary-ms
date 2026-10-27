import fs from 'node:fs';

let phase2 = fs.readFileSync('src/app/phase2.css', 'utf8');

// Replace .member-person block with improved version
const oldMemberPerson = `.member-person {
  display: flex;
  align-items: center;
  gap: 14px;
}

.member-avatar {
  height: 40px;
  width: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13.5px;
  font-weight: 700;
  background: var(--palette-steel);
  color: #ffffff;
}

.member-person b {
  font-size: 14px;
  color: var(--ink);
  font-weight: 600;
}

.member-person small {
  font-size: 12.5px;
  color: var(--muted);
}

.member-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
}

.member-active { color: #2D7D46; }
.member-active i { height: 7px; width: 7px; border-radius: 50%; background: #2D7D46; }`;

const newMemberPerson = `.member-person {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.member-avatar {
  height: 42px;
  width: 42px;
  flex: 0 0 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
  background: var(--palette-steel);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(7, 23, 57, 0.12);
}

.member-color-0 { background: #071739; color: #ffffff; }
.member-color-1 { background: #4B6382; color: #ffffff; }
.member-color-2 { background: #A68868; color: #ffffff; }
.member-color-3 { background: #2E4563; color: #ffffff; }

.member-person > span:not(.member-avatar) {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.member-person b {
  font-size: 14px;
  color: var(--ink);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-person small {
  font-size: 12.5px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-row select {
  height: 40px;
  appearance: none;
  background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234B6382' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 0 34px 0 14px;
  font: 600 13px 'Plus Jakarta Sans', sans-serif;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.member-row select:hover:not(:disabled) {
  border-color: var(--palette-steel);
}

.member-row select:focus {
  border-color: var(--palette-steel);
  outline: none;
  box-shadow: 0 0 0 3px rgba(75, 99, 130, 0.18);
}

.member-row select:disabled {
  background-color: #F4EFEA;
  color: var(--muted);
  cursor: not-allowed;
  opacity: 0.75;
}

.member-menu {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--palette-steel);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.member-menu:hover {
  background: #FDF2F2;
  border-color: #F0A8A8;
  color: #D32F2F;
  transform: translateY(-1px);
}

.member-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 700;
}

.member-status i {
  height: 8px;
  width: 8px;
  border-radius: 50%;
  display: inline-block;
}

.member-active { color: #2D7D46; }
.member-active i {
  background: #2D7D46;
  box-shadow: 0 0 0 3px rgba(45, 125, 70, 0.18);
}

.member-invited { color: var(--palette-bronze); }
.member-invited i {
  background: var(--palette-bronze);
  box-shadow: 0 0 0 3px rgba(166, 136, 104, 0.22);
}

.team-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 28px;
  background: #FAF8F5;
  border-top: 1px solid var(--line);
  font-size: 12.5px;
  color: var(--muted);
}

.team-card-foot button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid transparent;
  font: 700 13px 'Plus Jakarta Sans', sans-serif;
  color: var(--palette-steel);
  cursor: pointer;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.team-card-foot button:hover {
  background: #EAE3DA;
  border-color: var(--line);
  color: var(--ink);
}

.roles-note {
  margin-top: 24px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  background: var(--paper-card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.roles-note-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #FAF3EB;
  color: var(--palette-bronze);
  display: grid;
  place-items: center;
  font-size: 18px;
  flex: 0 0 42px;
  border: 1px solid var(--palette-sand);
}

.roles-note > div {
  flex: 1;
  min-width: 0;
}

.roles-note b {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
  display: block;
  margin-bottom: 3px;
}

.roles-note p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.45;
  margin: 0;
}

.roles-note-tag {
  margin-left: auto;
  padding: 6px 14px;
  background: #EEF3F8;
  border: 1px solid #CDD5DB;
  border-radius: var(--radius-full);
  color: var(--palette-steel);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.7px;
  white-space: nowrap;
}

.team-notice {
  margin-top: 18px;
  padding: 14px 18px;
  background: #FAF3EB;
  border: 1px solid var(--palette-sand);
  border-radius: var(--radius-md);
  color: #4A3B32;
  font-size: 13.5px;
  line-height: 1.5;
}

.team-notice a {
  color: var(--palette-steel);
  font-weight: 700;
  text-decoration: underline;
  word-break: break-all;
}

.modal-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #FAF3EB;
  color: var(--palette-bronze);
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
  border: 1px solid var(--palette-sand);
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Setup wizard extra components */
.setup-main {
  flex: 1;
  min-width: 0;
}

.setup-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #FAF8F5;
  border: 1px solid var(--line);
  color: var(--palette-steel);
  display: grid;
  place-items: center;
  font-size: 20px;
  flex: 0 0 44px;
}

.setup-hint {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin-top: 14px;
  padding: 12px 16px;
  background: #FAF8F5;
  border-left: 3px solid var(--palette-bronze);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.setup-footnote {
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 18px;
  text-align: center;
}

.rail-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--palette-bronze);
  margin: 0 0 8px;
}

.rail-help {
  margin-top: 40px;
  padding: 18px;
  background: #FAF8F5;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.rail-help span {
  color: var(--palette-bronze);
  font-size: 18px;
  display: block;
  margin-bottom: 6px;
}

.rail-help b {
  font-size: 13.5px;
  color: var(--ink);
  display: block;
}

.rail-help p {
  font-size: 12.5px;
  color: var(--muted);
  margin: 4px 0 0;
  line-height: 1.5;
}

.numbering-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.numbering-panel .setup-hint {
  grid-column: 1 / -1;
}

.numbering-copy {
  padding: 20px;
  background: #FAF8F5;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.numbering-copy span {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--palette-steel);
}

.numbering-copy strong {
  font-family: 'JetBrains Mono', monospace;
  font-size: 26px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: 0.5px;
}

.numbering-copy small {
  font-size: 12.5px;
  color: var(--muted);
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-list > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #FAF8F5;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.review-list b {
  font-size: 13.5px;
  color: var(--ink);
}

.review-list span {
  font-size: 13.5px;
  color: var(--palette-steel);
  font-weight: 600;
}

#edit-facility {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  padding: 4px 12px;
  font: 700 12px 'Plus Jakarta Sans', sans-serif;
  color: var(--palette-steel);
  cursor: pointer;
  margin-left: 14px;
  transition: all 0.15s ease;
}

#edit-facility:hover {
  background: #EAE3DA;
  border-color: var(--palette-steel);
  color: var(--ink);
}`;

phase2 = phase2.replace(oldMemberPerson, newMemberPerson);
fs.writeFileSync('src/app/phase2.css', phase2, 'utf8');
console.log('Updated src/app/phase2.css successfully');
