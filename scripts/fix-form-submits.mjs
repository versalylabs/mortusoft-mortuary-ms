import fs from 'node:fs';

let js = fs.readFileSync('preview/app.js', 'utf8');

// 1. Fix admission-form
const oldAdmission = `byId("admission-form").addEventListener("submit", async event => {
  event.preventDefault(); byId("admission-message").hidden = true;
  const form = new FormData(event.currentTarget);
  const payload = { personName: form.get("personName"), identificationStatus: form.get("identificationStatus"), sex: form.get("sex"), estimatedAge: form.get("estimatedAge"), admissionAt: form.get("admissionAt"), source: form.get("source"), nextOfKin: { name: form.get("kinName"), relationship: form.get("kinRelationship"), phone: form.get("kinPhone") }, notes: form.get("notes") };
  try {
    const result = await request("/api/cases", { method: "POST", body: JSON.stringify(payload) });
    event.currentTarget.reset(); refreshDashboard(); await renderCaseDetail(result.case.id);
  } catch (error) { message("admission-message", error.message); }
});`;

const newAdmission = `byId("admission-form").addEventListener("submit", async event => {
  event.preventDefault(); byId("admission-message").hidden = true;
  const formEl = event.currentTarget;
  const form = new FormData(formEl);
  const payload = { personName: form.get("personName"), identificationStatus: form.get("identificationStatus"), sex: form.get("sex"), estimatedAge: form.get("estimatedAge"), admissionAt: form.get("admissionAt"), source: form.get("source"), nextOfKin: { name: form.get("kinName"), relationship: form.get("kinRelationship"), phone: form.get("kinPhone") }, notes: form.get("notes") };
  try {
    const result = await request("/api/cases", { method: "POST", body: JSON.stringify(payload) });
    formEl.reset();
    if (window.closeAllCustomSelects) window.closeAllCustomSelects();
    refreshDashboard();
    await renderCaseDetail(result.case.id);
  } catch (error) { message("admission-message", error.message); }
});`;

if (js.includes(oldAdmission)) {
  js = js.replace(oldAdmission, newAdmission);
  console.log('Fixed admission-form');
} else {
  console.log('Old admission code not found directly');
}

// 2. Fix case-close-form
const oldClose = `byId("case-close-form").addEventListener("submit", async event => { event.preventDefault(); if (!confirm("Close this released case? The release record will remain available.")) return; try { await request(\`/api/cases/\${encodeURIComponent(item.id)}/close\`, { method: "POST", body: JSON.stringify({ reason: new FormData(event.currentTarget).get("reason") }) }); refreshDashboard(); await renderCaseDetail(item.id); } catch (error) { message("case-close-message", error.message); } });`;
const newClose = `byId("case-close-form").addEventListener("submit", async event => {
  event.preventDefault();
  const formEl = event.currentTarget;
  const reason = new FormData(formEl).get("reason");
  if (!confirm("Close this released case? The release record will remain available.")) return;
  try {
    await request(\`/api/cases/\${encodeURIComponent(item.id)}/close\`, { method: "POST", body: JSON.stringify({ reason }) });
    refreshDashboard();
    await renderCaseDetail(item.id);
  } catch (error) { message("case-close-message", error.message); }
});`;
if (js.includes(oldClose)) {
  js = js.replace(oldClose, newClose);
  console.log('Fixed case-close-form');
}

// 3. Fix release-handover-form
const oldHandover = `byId("release-handover-form").addEventListener("submit", async event => { event.preventDefault(); if (!confirm("Authorize final handover and mark this case Released? This cannot be reversed in the local preview.")) return; const form = new FormData(event.currentTarget); try { await request(\`/api/cases/\${encodeURIComponent(item.id)}/release\`, { method: "POST", body: JSON.stringify({ recipientName: form.get("recipientName"), relationship: form.get("relationship"), phone: form.get("phone") }) }); refreshDashboard(); await renderCaseDetail(item.id); } catch (error) { message("release-handover-message", error.message); } });`;
const newHandover = `byId("release-handover-form").addEventListener("submit", async event => {
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
});`;
if (js.includes(oldHandover)) {
  js = js.replace(oldHandover, newHandover);
  console.log('Fixed release-handover-form');
}

// 4. Fix local-message-form
const oldMsg = `byId("local-message-form").addEventListener("submit", async event => { event.preventDefault(); try { await request(\`/api/cases/\${encodeURIComponent(item.id)}/communications/messages\`, { method: "POST", body: JSON.stringify({ template: new FormData(event.currentTarget).get("template") }) }); await renderCaseDetail(item.id); } catch (error) { message("local-message-message", error.message); } });`;
const newMsg = `byId("local-message-form").addEventListener("submit", async event => {
  event.preventDefault();
  const formEl = event.currentTarget;
  const template = new FormData(formEl).get("template");
  try {
    await request(\`/api/cases/\${encodeURIComponent(item.id)}/communications/messages\`, { method: "POST", body: JSON.stringify({ template }) });
    await renderCaseDetail(item.id);
  } catch (error) { message("local-message-message", error.message); }
});`;
if (js.includes(oldMsg)) {
  js = js.replace(oldMsg, newMsg);
  console.log('Fixed local-message-form');
}

// 5. Fix storage-add-form
const oldStorage = `byId("storage-add-form").addEventListener("submit", async event => {
  event.preventDefault(); byId("storage-message").hidden = true;
  try { await request("/api/storage/rooms", { method: "POST", body: JSON.stringify({ name: byId("room-name").value, capacity: Number(byId("room-capacity").value) }) }); event.currentTarget.reset(); byId("storage-add-form").hidden = true; byId("room-capacity").value = 12; await renderStorage(); }
  catch (error) { message("storage-message", error.message); }
});`;
const newStorage = `byId("storage-add-form").addEventListener("submit", async event => {
  event.preventDefault(); byId("storage-message").hidden = true;
  const formEl = event.currentTarget;
  const name = byId("room-name").value.trim();
  const capacity = Number(byId("room-capacity").value);
  try {
    await request("/api/storage/rooms", { method: "POST", body: JSON.stringify({ name, capacity }) });
    formEl.reset();
    byId("storage-add-form").hidden = true;
    byId("room-capacity").value = 12;
    await renderStorage();
  }
  catch (error) { message("storage-message", error.message); }
});`;
if (js.includes(oldStorage)) {
  js = js.replace(oldStorage, newStorage);
  console.log('Fixed storage-add-form');
}

fs.writeFileSync('preview/app.js', js, 'utf8');
console.log('Updated preview/app.js successfully');
