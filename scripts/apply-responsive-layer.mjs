import fs from 'node:fs';

const responsiveCss = `
/* ==========================================================================
   COMPREHENSIVE RESPONSIVE DESIGN SYSTEM (Mobile, Tablet, Desktop)
   ========================================================================== */

/* Tablet & Smaller Desktops (<= 1024px) */
@media (max-width: 1024px) {
  .preview-cards {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
  }
  .preview-actions {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
  }
  .storage-summary, .reports-summary {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .detail-grid {
    grid-template-columns: 1fr !important;
  }
  .reports-grid {
    grid-template-columns: 1fr !important;
  }
  .workspace-layout {
    grid-template-columns: 1fr !important;
  }
}

/* Tablet Portrait & Mobile Devices (<= 860px) */
@media (max-width: 860px) {
  /* Auth / Login Page */
  .auth-page {
    grid-template-columns: 1fr !important;
  }
  .auth-story {
    display: none !important;
  }
  .auth-form-side {
    min-height: 100vh !important;
    padding: 36px 20px !important;
  }
  .auth-form-wrap {
    max-width: 440px !important;
    margin: 0 auto !important;
  }

  /* Page Wrappers */
  .case-wrap,
  .admission-wrap,
  .case-detail-wrap,
  .storage-wrap,
  .reports-wrap,
  .audit-wrap,
  .team-wrap {
    padding: 24px 18px 48px !important;
  }

  /* New Admission Form Layout */
  .admission-section {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
    padding: 20px !important;
  }

  /* Tables: Horizontal Scroll Containers */
  .case-card,
  .member-table,
  .audit-card {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    border-radius: var(--radius-lg) !important;
  }

  .case-table-head,
  .case-row {
    min-width: 680px !important;
  }

  .member-head,
  .member-row {
    min-width: 580px !important;
  }

  .audit-table-head,
  .audit-row {
    min-width: 680px !important;
  }

  /* Movement & Doc Forms */
  .movement-form {
    grid-template-columns: 1fr !important;
  }
  .docs-form {
    grid-template-columns: 1fr !important;
  }
  .handover-fields {
    grid-template-columns: 1fr !important;
  }

  /* Toolbar wrapping */
  .case-toolbar,
  .reports-toolbar,
  .audit-toolbar {
    flex-wrap: wrap !important;
    gap: 12px !important;
  }
  .case-toolbar .case-search,
  .case-toolbar select {
    flex: 1 1 200px !important;
  }

  .modal-shade {
    padding: 16px !important;
  }
  .invite-modal {
    padding: 24px !important;
    max-width: calc(100vw - 32px) !important;
  }
}

/* Small Mobile Screens (<= 560px) */
@media (max-width: 560px) {
  #mortusoft-sidebar {
    width: 54px !important;
    padding: 16px 4px 10px !important;
  }
  body.ms-workspace #dashboard,
  body.ms-workspace .workspace-page {
    margin-left: 54px !important;
    width: calc(100% - 54px) !important;
  }
  .ms-side-nav button {
    padding: 10px 4px !important;
  }
  .ms-side-nav button span {
    font-size: 16px !important;
  }

  .preview-head {
    padding-left: 14px !important;
    padding-right: 14px !important;
  }

  .preview-cards,
  .preview-actions,
  .storage-summary,
  .reports-summary,
  .billing-summary,
  .team-summary {
    grid-template-columns: 1fr !important;
  }

  .form-grid {
    grid-template-columns: 1fr !important;
  }

  .case-heading {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 12px !important;
  }

  .case-heading h1 {
    font-size: 26px !important;
  }

  .storage-assign-row {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .invoice-form-actions {
    flex-direction: column !important;
  }

  .admission-actions {
    flex-direction: column !important;
  }
  .admission-actions button {
    width: 100% !important;
  }
}
`;

// Append to preview/preview.css
fs.appendFileSync('preview/preview.css', '\n' + responsiveCss, 'utf8');
console.log('Appended responsive layer to preview/preview.css');

// Append to src/app/phase2.css
fs.appendFileSync('src/app/phase2.css', '\n' + responsiveCss, 'utf8');
console.log('Appended responsive layer to src/app/phase2.css');
