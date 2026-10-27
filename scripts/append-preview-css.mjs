import fs from 'node:fs';

const previewCss = fs.readFileSync('preview/preview.css', 'utf8');

const additions = `
/* ==========================================================================
   SYSTEM REFINEMENTS & COMPONENT HARMONIZATION (COASTAL OCEANIC PALETTE)
   ========================================================================== */

/* 1. PEOPLE & ACCESS (#team) */
.team-wrap {
  max-width: 1260px;
  margin: 0 auto;
  padding: 40px 36px 64px;
}

.member-person {
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

/* 2. SETUP WIZARD (#setup) */
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
}

/* 3. CASE DETAIL ENHANCEMENTS (#case-detail) */
.current-location {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #FAF8F5;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--ink);
  margin: 12px 0 16px;
}

.current-location b {
  color: var(--palette-steel);
  font-weight: 700;
}

.storage-assign-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.storage-assign-row select {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: #ffffff;
  font: 500 13.5px 'Plus Jakarta Sans', sans-serif;
  color: var(--ink);
  outline: 0;
}

.storage-assign-row select:focus {
  border-color: var(--palette-steel);
  box-shadow: 0 0 0 3px rgba(75, 99, 130, 0.18);
}

.storage-assign-row .auth-submit {
  margin-top: 0;
  white-space: nowrap;
  height: 44px;
  padding: 0 20px;
}

.movement-timeline {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--line-subtle);
}

.movement-empty {
  font-size: 13.5px;
  color: var(--muted);
  font-style: italic;
  padding: 14px 0;
}

.movement-reason-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custody-shield, .docs-icon, .communication-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FAF8F5;
  border: 1px solid var(--line);
  color: var(--palette-steel);
  display: grid;
  place-items: center;
  font-size: 17px;
  flex: 0 0 40px;
}

/* Invoices & Billing Details */
.invoice-form {
  margin-top: 20px;
  padding: 22px;
  background: #FAF8F5;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-lg);
}

.invoice-form-heading {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.invoice-form-heading b {
  font-size: 15px;
  color: var(--ink);
  font-weight: 700;
}

.invoice-form-heading small {
  font-size: 12.5px;
  color: var(--muted);
}

.invoice-line-row {
  display: grid;
  grid-template-columns: 1fr 180px 38px;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 12px;
}

.invoice-line-row label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
}

.invoice-line-row input {
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: #ffffff;
  font: 500 13px 'Plus Jakarta Sans', sans-serif;
  color: var(--ink);
}

.invoice-line-remove {
  height: 42px;
  width: 38px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--muted);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.invoice-line-remove:hover {
  background: #FDF2F2;
  border-color: #F0A8A8;
  color: #D32F2F;
}

.add-line-button {
  background: #ffffff;
  border: 1.5px dashed var(--line);
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  color: var(--palette-steel);
  font: 700 13px 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: all 0.15s ease;
}

.add-line-button:hover {
  background: #F4EFEA;
  border-color: var(--palette-steel);
  color: var(--ink);
}

.invoice-form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}

.invoice-totals {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--line-subtle);
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
}

.billing-note {
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 10px;
}

.payment-details {
  margin-top: 20px;
  border-top: 1px solid var(--line-subtle);
  padding-top: 16px;
}

.payment-details summary {
  font-weight: 700;
  font-size: 13.5px;
  color: var(--palette-steel);
  cursor: pointer;
  user-select: none;
  margin-bottom: 12px;
}

.payment-form {
  display: grid;
  grid-template-columns: 1fr 140px 160px auto;
  gap: 12px;
  align-items: flex-end;
  margin-top: 12px;
  padding: 18px;
  background: #FAF8F5;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.payment-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
}

.payment-form input, .payment-form select {
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: #ffffff;
  font: 13px 'Plus Jakarta Sans', sans-serif;
}

.payment-history {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Release Clearance & Handover */
.release-state-badge {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
}

.release-pending {
  background: #FAF3EB;
  color: var(--palette-bronze);
  border: 1px solid var(--palette-sand);
}

.release-guardrail {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 18px;
  background: #FAF8F5;
  border-left: 3px solid var(--palette-steel);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin: 16px 0;
  font-size: 13px;
}

.release-guardrail b {
  font-size: 11.5px;
  color: var(--palette-steel);
  letter-spacing: 0.5px;
}

.release-check-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--line-subtle);
  font-size: 12.5px;
  color: var(--muted);
}

.release-doc-proof {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  font-size: 13px;
}

.proof-complete {
  background: #F0F7F2;
  border: 1px solid #B8DCBF;
  color: #2D7D46;
}

.proof-missing {
  background: #FDF2F2;
  border: 1px solid #F0A8A8;
  color: #9C1C1C;
}

.handover-form {
  margin-top: 26px;
  padding: 24px;
  background: #FAF8F5;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-lg);
}

.handover-fields {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 16px;
  margin: 16px 0;
}

.handover-fields label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
}

.handover-fields input {
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: #ffffff;
  font: 13.5px 'Plus Jakarta Sans', sans-serif;
}

.handover-confirm {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 20px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}

.case-close-card {
  border-top: 2px solid var(--palette-bronze);
  margin-top: 26px;
}

.case-close-card textarea {
  width: 100%;
  margin-top: 8px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font: 500 13.5px 'Plus Jakarta Sans', sans-serif;
  color: var(--ink);
}

.case-close-card button {
  margin-top: 14px;
}

/* Family Communications */
.communication-guardrail {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 18px;
  background: #FAF8F5;
  border-left: 3px solid var(--palette-bronze);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin: 16px 0;
  font-size: 13px;
}

.communication-guardrail b {
  font-size: 11.5px;
  color: var(--palette-bronze);
  letter-spacing: 0.5px;
}

.contact-preferences-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line-subtle);
}

.contact-preferences-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
}

.contact-preferences-form input, .contact-preferences-form select {
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: #ffffff;
  font: 13.5px 'Plus Jakarta Sans', sans-serif;
}

.contact-preferences-form .consent-recorded {
  grid-column: span 2;
  padding: 12px 16px;
  background: #FAF8F5;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 12.5px;
  color: var(--muted);
}

.contact-preferences-form button {
  grid-column: span 2;
  justify-self: flex-start;
}

.message-prep {
  margin-top: 20px;
  padding: 20px;
  background: #FAF8F5;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.message-prep > div b {
  font-size: 14.5px;
  color: var(--ink);
  display: block;
}

.message-prep > div small {
  font-size: 12.5px;
  color: var(--muted);
}

.message-prep form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-prep form label {
  flex: 1;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
}

.message-prep form select {
  height: 42px;
  padding: 0 12px;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  background: #ffffff;
  font: 13.5px 'Plus Jakarta Sans', sans-serif;
}

.message-prep form .auth-submit {
  margin: 0;
  height: 42px;
  white-space: nowrap;
  padding: 0 20px;
}

.consent-required {
  color: #D32F2F;
  font-size: 12px;
  font-weight: 600;
}

.message-log {
  margin-top: 22px;
}

.family-message-entry {
  padding: 16px;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.family-message-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12.5px;
}

.family-message-meta b {
  color: var(--ink);
  font-weight: 700;
}

.family-message-meta span {
  color: var(--palette-steel);
  font-weight: 600;
}

.family-message-meta small {
  margin-left: auto;
  color: var(--muted);
}

.family-message-entry p {
  font-size: 13.5px;
  color: var(--ink);
  margin: 6px 0;
}

.family-message-status {
  display: inline-block;
  padding: 3px 9px;
  background: #FAF3EB;
  color: var(--palette-bronze);
  border-radius: var(--radius-xs);
  font-size: 11px;
  font-weight: 700;
}

/* 4. STORAGE ROOM MANAGEMENT (#storage) */
.storage-room-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 24px;
}

.room-remove {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: #ffffff;
  color: var(--palette-steel);
  font-size: 14px;
  cursor: pointer;
  margin-left: auto;
  transition: all 0.15s ease;
}

.room-remove:hover {
  background: #FDF2F2;
  border-color: #F0A8A8;
  color: #D32F2F;
}

/* 5. OPERATIONAL REPORTS (#reports) */
.reports-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.report-day-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--palette-steel);
  text-align: right;
}

.report-status-row {
  display: grid;
  grid-template-columns: 140px 1fr 60px;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line-subtle);
  font-size: 13px;
  color: var(--ink);
}

.report-status-row b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--palette-steel);
  text-align: right;
}

.report-services-panel {
  grid-column: 1 / -1;
}

.report-services {
  display: flex;
  flex-direction: column;
  margin-top: 18px;
}

.report-service-row {
  display: grid;
  grid-template-columns: 240px 1fr 140px;
  align-items: center;
  gap: 18px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line-subtle);
  font-size: 13.5px;
}

.report-service-row span {
  color: var(--ink);
  font-weight: 600;
}

.report-service-row b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13.5px;
  color: var(--palette-steel);
  font-weight: 700;
  text-align: right;
}

.report-empty {
  font-size: 13.5px;
  color: var(--muted);
  font-style: italic;
  padding: 16px 0;
  text-align: center;
}

.report-footnote {
  grid-column: 1 / -1;
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 18px;
  line-height: 1.5;
}

/* 6. GENERAL UTILITIES & POLISH */
.form-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  font: 600 13px 'Plus Jakarta Sans', sans-serif;
  color: var(--palette-steel);
  cursor: pointer;
  margin-top: 16px;
  padding: 6px 0;
  transition: color 0.15s ease;
}

.form-back:hover {
  color: var(--ink);
}

.inline-help {
  font-size: 12px;
  color: var(--muted);
}

#case-status-filter {
  appearance: none;
  background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234B6382' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center;
  padding-right: 36px;
}
`;

fs.writeFileSync('preview/preview.css', previewCss + '\n' + additions, 'utf8');
console.log('Appended comprehensive system styles to preview/preview.css');
