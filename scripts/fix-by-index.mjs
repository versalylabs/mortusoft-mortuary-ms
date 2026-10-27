import fs from 'node:fs';

const js = fs.readFileSync('preview/app.js', 'utf8');
const lines = js.split(/\r?\n/);

// Replace lines 358-366 (indices 357 to 365)
const admissionIdx = lines.findIndex(l => l.includes('byId("admission-form").addEventListener("submit"'));
console.log('admissionIdx:', admissionIdx);
if (admissionIdx !== -1) {
  lines.splice(admissionIdx, 9,
`byId("admission-form").addEventListener("submit", async event => {
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
});`
  );
}

// Replace storage-add-form
const storageIdx = lines.findIndex(l => l.includes('byId("storage-add-form").addEventListener("submit"'));
console.log('storageIdx:', storageIdx);
if (storageIdx !== -1) {
  lines.splice(storageIdx, 5,
`byId("storage-add-form").addEventListener("submit", async event => {
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
});`
  );
}

fs.writeFileSync('preview/app.js', lines.join('\n'), 'utf8');
console.log('Updated app.js by index successfully');
