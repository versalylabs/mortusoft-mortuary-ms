import fs from 'node:fs';

// 1. Update preview/app.js
let appJs = fs.readFileSync('preview/app.js', 'utf8');

// Update row creation in renderCases to add title, aria-label, and direct click listener
const oldRowCreation = `      const row = document.createElement("button"); row.type = "button"; row.className = "case-row"; row.dataset.caseId = item.id;
      const date = new Date(item.admissionAt);
      row.innerHTML = \`<span class="case-person"><b>\${esc(item.caseNumber)}</b><small>\${esc(item.personName)}</small></span><span class="case-date">\${date.toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" })}<small>\${date.toLocaleTimeString("en-KE", { hour:"2-digit", minute:"2-digit" })}</small></span><span class="case-id-status \${item.identificationStatus === "Unidentified" ? "case-id-unknown" : ""}"><i></i>\${esc(item.identificationStatus)}</span><span class="case-status-pill case-status-\${item.status.toLowerCase()}">\${esc(item.status)}</span><span class="case-chevron">→</span>\`;
      root.appendChild(row);`;

const newRowCreation = `      const row = document.createElement("button"); row.type = "button"; row.className = "case-row"; row.dataset.caseId = item.id;
      const date = new Date(item.admissionAt);
      row.innerHTML = \`<span class="case-person"><b>\${esc(item.caseNumber)}</b><small>\${esc(item.personName)}</small></span><span class="case-date">\${date.toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" })}<small>\${date.toLocaleTimeString("en-KE", { hour:"2-digit", minute:"2-digit" })}</small></span><span class="case-id-status \${item.identificationStatus === "Unidentified" ? "case-id-unknown" : ""}"><i></i>\${esc(item.identificationStatus)}</span><span class="case-status-pill case-status-\${item.status.toLowerCase()}">\${esc(item.status)}</span><span class="case-chevron" title="Open case record" aria-label="Open case record">→</span>\`;
      row.addEventListener("click", () => renderCaseDetail(item.id));
      root.appendChild(row);`;

if (!appJs.includes(oldRowCreation)) {
  console.error("Could not find oldRowCreation in app.js");
  process.exit(1);
}
appJs = appJs.replace(oldRowCreation, newRowCreation);

// Now replace renderCaseDetail function
const startIdx = appJs.indexOf('async function renderCaseDetail(id) {');
const endMarker = 'async function renderStorage() {';
const endIdx = appJs.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find renderCaseDetail bounds in app.js");
  process.exit(1);
}

const newRenderCaseDetail = `async function renderCaseDetail(id) {
  try {
    show("case-detail");
    const root = byId("case-detail-content");
    root.innerHTML = \`<div class="case-detail-loading" style="padding: 48px 24px; text-align: center; color: var(--palette-steel); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600;"><span style="display:inline-block;">Loading case record...</span></div>\`;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const { case: item } = await request(\`/api/cases/\${encodeURIComponent(id)}\`);
    const date = new Date(item.admissionAt);
    root.innerHTML = \`<div class="case-heading"><div><p class="form-eyebrow">CASE RECORD · \${esc(item.caseNumber)}</p><h1>\${esc(item.personName)}<span>.</span></h1><p>Admitted \${date.toLocaleString("en-KE", { dateStyle:"long", timeStyle:"short" })}</p></div><span class="case-status-pill case-status-\${item.status.toLowerCase()}">\${esc(item.status)}</span></div><div class="detail-grid"><section class="detail-card"><p class="form-eyebrow">PERSON PROFILE</p><dl><div><dt>Identification</dt><dd>\${esc(item.identificationStatus)}</dd></div><div><dt>Sex / gender</dt><dd>\${esc(item.sex)}</dd></div><div><dt>Estimated age</dt><dd>\${esc(item.estimatedAge || "Not recorded")}</dd></div><div><dt>Referral source</dt><dd>\${esc(item.source || "Not recorded")}</dd></div><div><dt>Next of kin</dt><dd>\${esc(item.nextOfKin?.name || "Not recorded")}\${item.nextOfKin?.relationship ? \` · \${esc(item.nextOfKin.relationship)}\` : ""}</dd></div><div><dt>Contact phone</dt><dd>\${esc(item.nextOfKin?.phone || "Not recorded")}</dd></div><div><dt>Admission note</dt><dd class="detail-notes">\${esc(item.notes || "No note recorded")}</dd></div></dl></section><section class="detail-card"><p class="form-eyebrow">CASE HISTORY</p><div class="history-list">\${(item.history || []).map(entry => \`<div class="history-entry"><i></i><span><b>\${esc(entry.action)}</b><small>\${new Date(entry.at).toLocaleString("en-KE")} · \${esc(entry.detail)}</small></span></div>\`).join("")}</div><div class="setup-hint">Storage assignments are recorded here. QR labels, broader movement tracking and release workflows are planned for later phases.</div></section></div>\`;
    root.dataset.caseId = item.id;

    if (item.status === "Released" && ["Facility administrator", "Super administrator", "Mortuary manager"].includes(current?.role)) {
      root.insertAdjacentHTML("beforeend", \`<section class="detail-card case-close-card"><p class="form-eyebrow">PHASE 13 · CASE LIFECYCLE</p><h2>Close completed case</h2><p class="setup-hint">The release record remains preserved. Closing marks the operational file complete.</p><form id="case-close-form"><label>Closure note<textarea name="reason" minlength="4" maxlength="300" rows="2" required placeholder="Confirm the post-release record is complete"></textarea></label><p id="case-close-message" class="form-notice" hidden></p><button class="team-invite" type="submit">Close case</button></form></section>\`);
      const closeForm = byId("case-close-form");
      if (closeForm) {
        closeForm.addEventListener("submit", async event => {
          event.preventDefault();
          const formEl = event.currentTarget;
          const reason = new FormData(formEl).get("reason");
          if (!confirm("Close this released case? The release record will remain available.")) return;
          try {
            await request(\`/api/cases/\${encodeURIComponent(item.id)}/close\`, { method: "POST", body: JSON.stringify({ reason }) });
            refreshDashboard();
            await renderCaseDetail(item.id);
          } catch (error) { message("case-close-message", error.message); }
        });
      }
    }

    const canPrintLabel = current?.role !== "Auditor / read-only";
    const caseHeading = root.querySelector(".case-heading");
    if (caseHeading) {
      caseHeading.insertAdjacentHTML("beforeend", \`<button id="open-case-label" class="team-invite" \${canPrintLabel ? "" : "hidden"}>Print QR label</button>\`);
      caseHeading.insertAdjacentHTML("afterend", \`<div class="case-label-wrap"><section id="case-label-print-area" class="case-label-print"><div class="case-label-copy"><span class="form-eyebrow">\${esc(facility?.name || "MORTUSOFT")}</span><b>CASE IDENTIFICATION</b><strong>\${esc(item.caseNumber)}</strong><small>Scan with Mortusoft to open this case after staff sign-in.</small></div><img src="/api/cases/\${encodeURIComponent(item.id)}/qr.svg" alt="Secure case lookup QR code"></section><div class="case-label-actions"><span>QR contains an opaque case link only; sign-in is required to view the record.</span><button id="case-label-print-button" class="subtle-button" \${canPrintLabel ? "" : "hidden"}>Print label</button></div><p id="case-label-message" class="form-notice" hidden></p></div>\`);
      byId("open-case-label")?.addEventListener("click", () => byId("case-label-print-area")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      byId("case-label-print-button")?.addEventListener("click", async () => { try { await request(\`/api/cases/\${encodeURIComponent(item.id)}/label-print\`, { method: "POST", body: "{}" }); window.print(); } catch (error) { message("case-label-message", error.message); } });
    }

    // Storage card
    root.querySelector(".detail-grid").insertAdjacentHTML("afterbegin", \`<section class="detail-card storage-assignment"><p class="form-eyebrow">CURRENT STORAGE</p><div class="current-location">⌂ <b>\${esc(item.currentLocation || "Not assigned")}</b></div><div class="storage-assign-row"><select id="case-storage-select" aria-label="Available storage slots"><option value="">Choose an available slot</option></select><button id="case-storage-assign" class="auth-submit">\${item.currentLocation ? "Move case" : "Assign storage"} <span>→</span></button></div><p id="case-storage-message" class="form-notice" hidden></p></section>\`);
    let storageState = { rooms: [] };
    try {
      storageState = await request("/api/storage");
      const select = byId("case-storage-select");
      if (select && storageState.rooms) {
        storageState.rooms.forEach(room => room.slots.filter(slot => slot.status === "Available" || slot.id === item.storageSlotId).forEach(slot => {
          const option = document.createElement("option"); option.value = slot.id; option.textContent = \`\${room.name} · Slot \${slot.label}\${slot.id === item.storageSlotId ? " (current)" : ""}\`; option.selected = slot.id === item.storageSlotId; select.appendChild(option);
        }));
      }
      byId("case-storage-assign")?.addEventListener("click", async () => {
        const sel = byId("case-storage-select");
        if (!sel || !sel.value) { message("case-storage-message", "Configure a room and choose an available slot first."); return; }
        try { const updated = await request(\`/api/cases/\${encodeURIComponent(item.id)}/storage\`, { method: "POST", body: JSON.stringify({ slotId: sel.value }) }); await renderCaseDetail(updated.case.id); }
        catch (error) { message("case-storage-message", error.message); }
      });
    } catch (e) { console.error("Storage load error:", e); }

    // Movements card
    root.insertAdjacentHTML("beforeend", \`<section class="detail-card custody-card"><div class="custody-heading"><div><p class="form-eyebrow">PHASE 5 · CHAIN OF CUSTODY</p><h2>Movement log</h2><small>Record each handoff with its destination and reason.</small></div><span class="custody-shield">↗</span></div><form id="movement-form" class="movement-form"><label>Destination<select id="movement-destination" required><option value="">Select a destination</option><option>Cold room</option><option>Embalming room</option><option>Examination room</option><option>Preparation room</option><option>Family viewing room</option><option>Transfer area</option><option>Other</option></select></label><label id="movement-other-wrap" hidden>Destination details<input id="movement-other" maxlength="160" placeholder="Enter destination"></label><label id="movement-slot-wrap" hidden>Cold-room slot<select id="movement-slot"><option value="">Choose an available slot</option></select></label><label class="movement-reason-label">Reason for movement<textarea id="movement-reason" maxlength="500" rows="2" required placeholder="e.g. Preparation requested by family"></textarea></label><p id="movement-message" class="form-notice" hidden></p><button type="submit" class="auth-submit">Record movement <span>→</span></button></form><div class="movement-timeline"><p class="form-eyebrow">MOVEMENT HISTORY</p><div id="movement-rows"></div></div></section>\`);
    const movementSlotWrap = byId("movement-slot-wrap");
    byId("movement-destination")?.addEventListener("change", event => {
      const coldRoom = event.target.value === "Cold room";
      byId("movement-other-wrap").hidden = event.target.value !== "Other";
      if (movementSlotWrap) movementSlotWrap.hidden = !coldRoom;
      byId("movement-other").required = event.target.value === "Other";
      byId("movement-slot").required = coldRoom;
    });
    const movementSlot = byId("movement-slot");
    if (movementSlot && storageState.rooms) {
      storageState.rooms.forEach(room => room.slots.filter(slot => slot.status === "Available" || slot.id === item.storageSlotId).forEach(slot => {
        const option = document.createElement("option"); option.value = slot.id; option.textContent = \`\${room.name} · Slot \${slot.label}\${slot.id === item.storageSlotId ? " (current)" : ""}\`; movementSlot.appendChild(option);
      }));
    }
    try {
      const { movements } = await request(\`/api/cases/\${encodeURIComponent(item.id)}/movements\`);
      const movementRows = byId("movement-rows");
      if (movementRows) {
        if (!movements || !movements.length) movementRows.innerHTML = '<p class="movement-empty">No movements recorded yet.</p>';
        else movementRows.innerHTML = [...movements].reverse().map(entry => \`<article class="movement-entry"><span class="movement-marker">↗</span><div><div class="movement-route"><b>\${esc(entry.from)}</b><span>→</span><b>\${esc(entry.to)}</b></div><p>\${esc(entry.reason)}</p><small>\${new Date(entry.movedAt).toLocaleString("en-KE")} · \${esc(entry.movedBy.name)} · \${esc(entry.movedBy.role)}</small></div></article>\`).join("");
      }
    } catch (e) { console.error("Movements load error:", e); }
    byId("movement-form")?.addEventListener("submit", async event => {
      event.preventDefault(); byId("movement-message").hidden = true;
      const destination = byId("movement-destination").value;
      try {
        const updated = await request(\`/api/cases/\${encodeURIComponent(item.id)}/movements\`, { method: "POST", body: JSON.stringify({ destination, destinationDetails: byId("movement-other").value, slotId: destination === "Cold room" ? movementSlot.value : "", reason: byId("movement-reason").value }) });
        await renderCaseDetail(updated.case.id);
      } catch (error) { message("movement-message", error.message); }
    });

    // Documents card
    root.insertAdjacentHTML("beforeend", \`<section class="detail-card docs-card"><div class="docs-heading"><div><p class="form-eyebrow">PHASE 6 · CASE DOCUMENTATION</p><h2>Documents & attachments</h2><small>Store supporting files alongside this case record.</small></div><span class="docs-icon">▤</span></div><form id="case-doc-form" class="docs-form"><label>Document category<select id="doc-category" required><option value="">Choose category</option><option>Admission form</option><option>Identity document</option><option>Authority / police</option><option>Family authorization</option><option>Medical / postmortem</option><option>Release form</option><option>Other</option></select></label><label>File<input id="doc-file" type="file" accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg" required><small>PDF, PNG, or JPEG · up to 5 MB</small></label><p id="doc-message" class="form-notice" hidden></p><button type="submit" class="auth-submit">Attach document <span>→</span></button></form><div class="docs-list"><p class="form-eyebrow">ATTACHED TO THIS CASE</p><div id="case-doc-rows"></div></div></section>\`);
    let documents = [];
    try {
      const docRes = await request(\`/api/cases/\${encodeURIComponent(item.id)}/documents\`);
      documents = docRes.documents || [];
      const docRows = byId("case-doc-rows");
      if (docRows) {
        if (!documents.length) docRows.innerHTML = '<p class="movement-empty">No documents attached yet.</p>';
        else docRows.innerHTML = documents.map(doc => \`<article class="doc-entry"><span class="doc-file-icon">\${doc.mimeType === "application/pdf" ? "PDF" : "IMG"}</span><span class="doc-info"><b>\${esc(doc.name)}</b><small>\${esc(doc.category)} · \${(doc.size / 1024).toFixed(0)} KB · \${new Date(doc.uploadedAt).toLocaleDateString("en-KE")}</small></span><a href="/api/documents/\${encodeURIComponent(doc.id)}" target="_blank" rel="noreferrer">View <span>↗</span></a></article>\`).join("");
      }
    } catch (e) { console.error("Docs load error:", e); }
    byId("case-doc-form")?.addEventListener("submit", async event => {
      event.preventDefault(); byId("doc-message").hidden = true;
      const file = byId("doc-file").files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { message("doc-message", "Choose a file smaller than 5 MB."); return; }
      try {
        const buffer = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (let index = 0; index < buffer.length; index += 0x8000) binary += String.fromCharCode(...buffer.subarray(index, index + 0x8000));
        await request(\`/api/cases/\${encodeURIComponent(item.id)}/documents\`, { method: "POST", body: JSON.stringify({ name: file.name, category: byId("doc-category").value, mimeType: file.type, data: btoa(binary) }) });
        await renderCaseDetail(item.id);
      } catch (error) { message("doc-message", error.message); }
    });

    // Billing card
    const canBill = ["Facility administrator", "Super administrator", "Mortuary manager", "Finance officer"].includes(current?.role);
    root.insertAdjacentHTML("beforeend", \`<section class="detail-card billing-card"><div class="billing-heading"><div><p class="form-eyebrow">PHASE 7 · BILLING & PAYMENTS</p><h2>Billing overview</h2><small>Create service invoices and record payments received.</small></div><button id="invoice-add-toggle" class="team-invite" \${canBill ? "" : "hidden"}>＋ Create invoice</button></div><div class="billing-summary"><article><small>Total billed</small><b id="billing-billed">KSh 0</b></article><article><small>Paid</small><b id="billing-paid">KSh 0</b></article><article><small>Outstanding</small><b id="billing-balance">KSh 0</b></article></div><form id="new-invoice-form" class="invoice-form" hidden><div class="invoice-form-heading"><b>New service invoice</b><small>Enter each service and its amount in whole Kenyan shillings.</small></div><div id="invoice-lines"></div><button type="button" id="invoice-line-add" class="add-line-button">＋ Add a service line</button><p id="invoice-message" class="form-notice" hidden></p><div class="invoice-form-actions"><button type="button" id="invoice-cancel" class="subtle-button">Cancel</button><button type="submit" class="auth-submit">Save invoice <span>→</span></button></div></form><p id="billing-empty" class="movement-empty">No invoices for this case yet.</p><div id="invoice-list"></div><div class="billing-note"><b>LOCAL PAYMENT REGISTER</b> Payments are recorded manually. No M-Pesa, bank, or card transaction is initiated by this preview.</div></section>\`);
    try {
      const billing = await request(\`/api/cases/\${encodeURIComponent(item.id)}/billing\`);
      if (byId("billing-billed")) byId("billing-billed").textContent = kes(billing.summary?.billed || 0);
      if (byId("billing-paid")) byId("billing-paid").textContent = kes(billing.summary?.paid || 0);
      if (byId("billing-balance")) byId("billing-balance").textContent = kes(billing.summary?.balance || 0);
      if (byId("billing-empty")) byId("billing-empty").hidden = billing.invoices && billing.invoices.length > 0;
      const invoiceList = byId("invoice-list");
      if (invoiceList && billing.invoices) {
        invoiceList.innerHTML = billing.invoices.map(invoice => \`<article class="invoice-card"><div class="invoice-card-head"><span><b>\${esc(invoice.invoiceNumber)}</b><small>Issued \${new Date(invoice.createdAt).toLocaleDateString("en-KE")} · \${esc(invoice.createdBy.name)}</small></span><span class="invoice-status invoice-\${invoice.status.toLowerCase().replaceAll(" ", "-")}">\${esc(invoice.status)}</span></div><div class="invoice-items">\${invoice.lines.map(line => \`<div><span>\${esc(line.description)}</span><b>\${kes(line.amount)}</b></div>\`).join("")}</div><div class="invoice-totals"><div><span>Invoice total</span><b>\${kes(invoice.total)}</b></div><div><span>Paid</span><b>\${kes(invoice.paid)}</b></div><div><span>Balance due</span><b>\${kes(invoice.balance)}</b></div></div>\${invoice.payments.length ? \`<div class="payment-history"><small>PAYMENT HISTORY</small>\${invoice.payments.map(payment => \`<div><span>\${esc(payment.method)}\${payment.reference ? \` · \${esc(payment.reference)}\` : ""}<small>\${new Date(payment.paidAt).toLocaleDateString("en-KE")} · \${esc(payment.recordedBy.name)}</small></span><b>\${kes(payment.amount)}</b></div>\`).join("")}</div>\` : ""}\${canBill && invoice.balance > 0 ? \`<details class="payment-details"><summary>Record a payment</summary><form class="payment-form" data-invoice-id="\${esc(invoice.id)}"><label>Amount (KSh)<input name="amount" type="number" min="1" max="\${invoice.balance}" step="1" required></label><label>Method<select name="method"><option>Cash</option><option>M-Pesa</option><option>Bank transfer</option><option>Card</option><option>Other</option></select></label><label>Reference<input name="reference" maxlength="120" placeholder="Required for M-Pesa / bank"></label><p class="form-notice" hidden></p><button class="auth-submit" type="submit">Record payment <span>→</span></button></form></details>\` : ""}</article>\`).join("");
      }
      byId("invoice-add-toggle")?.addEventListener("click", () => { byId("new-invoice-form").hidden = false; if (!byId("invoice-lines").children.length) addInvoiceLine(); });
      byId("invoice-cancel")?.addEventListener("click", () => { byId("new-invoice-form").reset(); byId("new-invoice-form").hidden = true; byId("invoice-lines").replaceChildren(); });
      byId("invoice-line-add")?.addEventListener("click", addInvoiceLine);
      byId("new-invoice-form")?.addEventListener("submit", async event => {
        event.preventDefault(); byId("invoice-message").hidden = true;
        const lines = [...byId("invoice-lines").querySelectorAll(".invoice-line-row")].map(row => ({ description: row.querySelector("[name=description]").value.trim(), amount: Number(row.querySelector("[name=amount]").value) })).filter(line => line.description && line.amount);
        try { await request(\`/api/cases/\${encodeURIComponent(item.id)}/billing\`, { method: "POST", body: JSON.stringify({ lines }) }); await renderCaseDetail(item.id); }
        catch (error) { message("invoice-message", error.message); }
      });
      if (invoiceList) {
        invoiceList.querySelectorAll(".payment-form").forEach(form => {
          const method = form.querySelector('[name="method"]'); const reference = form.querySelector('[name="reference"]');
          method?.addEventListener("change", () => { reference.required = ["M-Pesa", "Bank transfer"].includes(method.value); });
          form.addEventListener("submit", async event => {
            event.preventDefault(); const notice = form.querySelector(".form-notice"); if (notice) notice.hidden = true;
            try { await request(\`/api/invoices/\${encodeURIComponent(form.dataset.invoiceId)}/payments\`, { method: "POST", body: JSON.stringify({ amount: Number(form.querySelector('[name="amount"]').value), method: method.value, reference: reference.value }) }); await renderCaseDetail(item.id); }
            catch (error) { if (notice) { notice.textContent = error.message; notice.hidden = false; } }
          });
        });
      }
    } catch (e) { console.error("Billing load error:", e); }

    // Release clearance card
    try {
      const clearance = await request(\`/api/cases/\${encodeURIComponent(item.id)}/release-clearance\`);
      const canAuthorizeRelease = ["Facility administrator", "Super administrator", "Mortuary manager"].includes(current?.role);
      const releaseFormAttached = documents.some(document => document.category === "Release form");
      const releasePanel = document.createElement("section"); releasePanel.className = "detail-card release-card";
      if (item.release) {
        releasePanel.innerHTML = \`<div class="release-heading"><div><p class="form-eyebrow">PHASE 8 · RELEASE CLEARANCE</p><h2>Case released</h2><small>Handover recorded and storage released.</small></div><span class="release-state-badge">RELEASED</span></div><div class="release-summary"><div><small>Recipient</small><b>\${esc(item.release.recipientName)}</b></div><div><small>Relationship</small><b>\${esc(item.release.relationship)}</b></div><div><small>Contact</small><b>\${esc(item.release.phone)}</b></div><div><small>Released</small><b>\${new Date(item.release.releasedAt).toLocaleString("en-KE")}</b></div><div><small>Authorized by</small><b>\${esc(item.release.authorizedBy.name)}</b></div></div>\`;
      } else {
        const checksMarkup = (clearance.checks || []).map(check => \`<div class="release-check-row"><span class="release-check-indicator \${check.state === "Complete" ? "check-complete" : check.state === "Not applicable" ? "check-na" : ""} ">\${check.state === "Complete" ? "✓" : check.state === "Not applicable" ? "–" : "·"}</span><span class="release-check-copy"><b>\${esc(check.label)}</b><small>\${check.canWaive ? "Record a reason when marking not applicable." : "Required before handover."}</small></span><select data-release-key="\${esc(check.key)}" \${canAuthorizeRelease && item.status === "Active" ? "" : "disabled"}><option \${check.state === "Pending" ? "selected" : ""}>Pending</option><option \${check.state === "Complete" ? "selected" : ""}>Complete</option>\${check.canWaive ? \`<option \${check.state === "Not applicable" ? "selected" : ""}>Not applicable</option>\` : ""}</select><input class="release-reason" data-release-reason="\${esc(check.key)}" value="\${esc(check.reason || "")}" maxlength="300" placeholder="Reason for N/A" \${check.state === "Not applicable" && canAuthorizeRelease ? "" : "hidden"}></div>\`).join("");
        releasePanel.innerHTML = \`<div class="release-heading"><div><p class="form-eyebrow">PHASE 8 · RELEASE CLEARANCE</p><h2>Release readiness</h2><small>Confirm applicable requirements under facility policy.</small></div><span class="release-state-badge release-pending">\${clearance.blockers?.length ? \`\${clearance.blockers.length} BLOCKERS\` : "READY TO REVIEW"}</span></div><div class="release-guardrail"><b>RELEASE GATE</b><span>A release form must be attached. Authority and finance requirements follow facility policy.</span></div><form id="release-checklist-form"><div class="release-check-list">\${checksMarkup}</div><div class="release-doc-proof \${releaseFormAttached ? "proof-complete" : "proof-missing"}"><span>\${releaseFormAttached ? "✓" : "!"}</span><div><b>\${releaseFormAttached ? "Release form attached" : "Release form required"}</b><small>Attach a document categorized as Release form.</small></div></div><p id="release-check-message" class="form-notice" hidden></p>\${canAuthorizeRelease && item.status === "Active" ? '<div class="release-check-actions"><span>Checklist changes are recorded in case history.</span><button type="submit" class="subtle-button">Save checklist</button></div>' : ""}</form><div class="release-blockers" \${clearance.blockers?.length ? "" : "hidden"}><b>RELEASE BLOCKED</b><ul>\${(clearance.blockers || []).map(blocker => \`<li>\${esc(blocker)}</li>\`).join("")}</ul></div>\${canAuthorizeRelease && item.status === "Active" ? '<form id="release-handover-form" class="handover-form"><p class="form-eyebrow">FINAL HANDOVER</p><div class="handover-fields"><label>Recipient full name<input name="recipientName" minlength="2" maxlength="120" required></label><label>Relationship<input name="relationship" minlength="2" maxlength="80" required></label><label>Contact phone<input name="phone" type="tel" maxlength="40" required></label></div><label class="handover-confirm"><input type="checkbox" required><span>I confirm the recipient is verified and this case is cleared for handover.</span></label><p id="release-handover-message" class="form-notice" hidden></p><button type="submit" class="release-finalize" ' + (clearance.blockers?.length ? "disabled" : "") + '>Authorize release & record handover →</button></form>' : ""}\`;
      }
      root.appendChild(releasePanel);
      if (!item.release && canAuthorizeRelease && item.status === "Active") {
        releasePanel.querySelectorAll("[data-release-key]").forEach(select => select.addEventListener("change", () => { const reason = releasePanel.querySelector(\`[data-release-reason="\${select.dataset.releaseKey}"]\`); if (reason) { reason.hidden = select.value !== "Not applicable"; reason.required = select.value === "Not applicable"; } }));
        const checkForm = byId("release-checklist-form");
        if (checkForm) {
          checkForm.addEventListener("submit", async event => { event.preventDefault(); const checks = {}; releasePanel.querySelectorAll("[data-release-key]").forEach(select => { checks[select.dataset.releaseKey] = { state: select.value, reason: releasePanel.querySelector(\`[data-release-reason="\${select.dataset.releaseKey}"]\`)?.value || "" }; }); try { await request(\`/api/cases/\${encodeURIComponent(item.id)}/release-clearance\`, { method: "PUT", body: JSON.stringify({ checks }) }); await renderCaseDetail(item.id); } catch (error) { message("release-check-message", error.message); } });
        }
        const handoverForm = byId("release-handover-form");
        if (handoverForm) {
          handoverForm.addEventListener("submit", async event => {
            event.preventDefault();
            const formEl = event.currentTarget;
            const form = new FormData(formEl);
            const recipientName = form.get("recipientName");
            const relationship = form.get("relationship");
            const phone = form.get("phone");
            if (!confirm("Authorize final handover and mark this case Released? This cannot be reversed in the local preview.")) return;
            try {
              await request(\`/api/cases/\${encodeURIComponent(item.id)}/release\`, { method: "POST", body: JSON.stringify({ recipientName, relationship, phone }) });
              refreshDashboard();
              await renderCaseDetail(item.id);
            } catch (error) { message("release-handover-message", error.message); }
          });
        }
      }
    } catch (e) { console.error("Clearance load error:", e); }

    // Family communication card
    try {
      const comms = await request(\`/api/cases/\${encodeURIComponent(item.id)}/communications\`);
      const contact = comms.contact || {};
      const canCommunicate = ["Facility administrator", "Super administrator", "Mortuary manager", "Reception / front desk", "Funeral coordinator"].includes(current?.role);
      const consentGranted = contact.consentStatus === "Granted" && contact.consentChannel === contact.preferredChannel;
      const communicationPanel = document.createElement("section"); communicationPanel.className = "detail-card communications-card";
      communicationPanel.innerHTML = \`<div class="communications-heading"><div><p class="form-eyebrow">PHASE 9 · FAMILY COMMUNICATION</p><h2>Family contact & updates</h2><small>Record contact preferences and prepare a case update.</small></div><span class="communication-icon">✉</span></div><div class="communication-guardrail"><b>LOCAL MESSAGE LOG ONLY</b><span>Messages stay in this preview and are not sent. Matching channel consent is required before preparation.</span></div><form id="contact-preferences-form" class="contact-preferences-form"><label>Family contact<input name="name" value="\${esc(contact.name || "")}" maxlength="120" required \${canCommunicate ? "" : "disabled"}></label><label>Relationship<input name="relationship" value="\${esc(contact.relationship || "")}" maxlength="80" \${canCommunicate ? "" : "disabled"}></label><label>Phone<input name="phone" type="tel" value="\${esc(contact.phone || "")}" maxlength="40" \${canCommunicate ? "" : "disabled"}></label><label>Email<input name="email" type="email" value="\${esc(contact.email || "")}" maxlength="254" \${canCommunicate ? "" : "disabled"}></label><label>Preferred channel<select name="preferredChannel" \${canCommunicate ? "" : "disabled"}><option \${contact.preferredChannel === "SMS" ? "selected" : ""}>SMS</option><option \${contact.preferredChannel === "Email" ? "selected" : ""}>Email</option></select></label><label>Consent status<select name="consentStatus" \${canCommunicate ? "" : "disabled"}><option \${contact.consentStatus === "Not recorded" ? "selected" : ""}>Not recorded</option><option \${contact.consentStatus === "Granted" ? "selected" : ""}>Granted</option><option \${contact.consentStatus === "Declined" ? "selected" : ""}>Declined</option></select></label><label>Consent method<select name="consentMethod" \${canCommunicate ? "" : "disabled"}><option value="">Choose method</option><option>In person</option><option>Phone</option><option>Written authorization</option><option>Other</option></select></label><label>Consent note<input name="consentNote" value="\${esc(contact.consentNote || "")}" maxlength="300" placeholder="Optional context" \${canCommunicate ? "" : "disabled"}></label><div class="consent-recorded">\${contact.consentAt ? \`Consent \${esc((contact.consentStatus || "").toLowerCase())} for \${esc(contact.consentChannel || "")} · \${new Date(contact.consentAt).toLocaleString("en-KE")} · \${esc(contact.consentBy || "")}\` : "Consent has not been recorded."}</div><p id="contact-preferences-message" class="form-notice" hidden></p>\${canCommunicate ? '<button type="submit" class="subtle-button">Save contact & consent</button>' : ""}</form><div class="message-prep"><div><b>Prepare a family update</b><small>Uses the case reference and facility contact details only.</small></div><form id="local-message-form"><label>Message template<select name="template"><option>Facility update</option><option>Document follow-up</option><option>Appointment coordination</option></select></label><p id="local-message-message" class="form-notice" hidden></p><button type="submit" class="auth-submit" \${canCommunicate && consentGranted && (contact.preferredChannel === "SMS" ? contact.phone : contact.email) ? "" : "disabled"}>Add to local message log <span>→</span></button></form>\${!consentGranted ? '<small class="consent-required">A matching channel consent record is required.</small>' : ""}</div><div class="message-log"><p class="form-eyebrow">PREPARED MESSAGES</p><div id="family-message-rows"></div></div>\`;
      root.appendChild(communicationPanel);
      const contactForm = byId("contact-preferences-form");
      if (contactForm && contact.consentMethod) {
        const methodEl = contactForm.elements.namedItem("consentMethod");
        if (methodEl) methodEl.value = contact.consentMethod;
      }
      if (canCommunicate && contactForm) {
        contactForm.addEventListener("submit", async event => { event.preventDefault(); const values = Object.fromEntries(new FormData(contactForm)); try { await request(\`/api/cases/\${encodeURIComponent(item.id)}/communications/contact\`, { method: "PUT", body: JSON.stringify(values) }); await renderCaseDetail(item.id); } catch (error) { message("contact-preferences-message", error.message); } });
      }
      byId("local-message-form")?.addEventListener("submit", async event => {
        event.preventDefault();
        const formEl = event.currentTarget;
        const template = new FormData(formEl).get("template");
        try {
          await request(\`/api/cases/\${encodeURIComponent(item.id)}/communications/messages\`, { method: "POST", body: JSON.stringify({ template }) });
          await renderCaseDetail(item.id);
        } catch (error) { message("local-message-message", error.message); }
      });
      const familyMsgRows = byId("family-message-rows");
      if (familyMsgRows) {
        familyMsgRows.innerHTML = comms.messages && comms.messages.length ? comms.messages.map(entry => \`<article class="family-message-entry"><div class="family-message-meta"><b>\${esc(entry.template)}</b><span>\${esc(entry.channel)} · \${esc(entry.recipientAddress)}</span><small>\${new Date(entry.queuedAt).toLocaleString("en-KE")} · \${esc(entry.queuedBy.name)}</small></div><p>\${esc(entry.body)}</p><span class="family-message-status">\${esc(entry.status)}</span></article>\`).join("") : '<p class="movement-empty">No family messages prepared for this case.</p>';
      }
    } catch (e) { console.error("Communications load error:", e); }

  } catch (error) {
    message("case-list-notice", error.message);
    show("cases");
  }
}

`;

appJs = appJs.slice(0, startIdx) + newRenderCaseDetail + appJs.slice(endIdx);
fs.writeFileSync('preview/app.js', appJs, 'utf8');
console.log("Updated preview/app.js successfully!");

// 2. Update preview/preview.css for .case-chevron and .case-row
let previewCss = fs.readFileSync('preview/preview.css', 'utf8');

const oldChevronCss = `.case-chevron {
  color: #A4B5C4;
  font-size: 18px;
  transition: transform 0.15s ease;
}

.case-row:hover .case-chevron {
  transform: translateX(4px);
  color: var(--palette-navy);
}`;

const newChevronCss = `.case-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #4B6382;
  background: rgba(75, 99, 130, 0.08);
  border: 1px solid rgba(75, 99, 130, 0.16);
  font-size: 16px;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  flex-shrink: 0;
}

.case-row:hover .case-chevron {
  transform: translateX(3px);
  background: #4B6382;
  border-color: #4B6382;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(75, 99, 130, 0.25);
}`;

if (previewCss.includes(oldChevronCss)) {
  previewCss = previewCss.replace(oldChevronCss, newChevronCss);
  fs.writeFileSync('preview/preview.css', previewCss, 'utf8');
  console.log("Updated preview/preview.css successfully!");
} else {
  console.log("Notice: oldChevronCss not found verbatim in preview.css, checking variations...");
  // Let's replace whatever .case-chevron was
  previewCss = previewCss.replace(/\.case-chevron\s*\{[^}]*\}\s*\.case-row:hover\s+\.case-chevron\s*\{[^}]*\}/s, newChevronCss);
  fs.writeFileSync('preview/preview.css', previewCss, 'utf8');
  console.log("Updated preview/preview.css regex successfully!");
}
