import fs from 'node:fs';

let js = fs.readFileSync('preview/app.js', 'utf8');

// Replace admission form handler
const admissionTarget = `byId("admission-form").addEventListener("submit", async event => {
  event.preventDefault(); byId("admission-message").hidden = true;
  const form = new FormData(event.currentTarget);
  const payload = { personName: form.get("personName"), identificationStatus: form.get("identificationStatus"), sex: form.get("sex"), estimatedAge: form.get("estimatedAge"), admissionAt: form.get("admissionAt"), source: form.get("source"), nextOfKin: { name: form.get("kinName"), relationship: form.get("kinRelationship"), phone: form.get("kinPhone") }, notes: form.get("notes") };
  try {
    const result = await request("/api/cases", { method: "POST", body: JSON.stringify(payload) });
    event.currentTarget.reset(); refreshDashboard(); await renderCaseDetail(result.case.id);
  } catch (error) { message("admission-message", error.message); }
});`;

const admissionReplacement = `byId("admission-form").addEventListener("submit", async event => {
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

js = js.replace(admissionTarget, admissionReplacement);

// Replace storage add form handler
const storageTarget = `byId("storage-add-form").addEventListener("submit", async event => {
  event.preventDefault(); byId("storage-message").hidden = true;
  try { await request("/api/storage/rooms", { method: "POST", body: JSON.stringify({ name: byId("room-name").value, capacity: Number(byId("room-capacity").value) }) }); event.currentTarget.reset(); byId("storage-add-form").hidden = true; byId("room-capacity").value = 12; await renderStorage(); }
  catch (error) { message("storage-message", error.message); }
});`;

const storageReplacement = `byId("storage-add-form").addEventListener("submit", async event => {
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

js = js.replace(storageTarget, storageReplacement);

fs.writeFileSync('preview/app.js', js, 'utf8');
console.log('Successfully updated admission-form and storage-add-form in preview/app.js');
