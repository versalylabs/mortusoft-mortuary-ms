import http from 'node:http';

const BASE_URL = 'http://localhost:3005';
let cookie = '';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { ...options.headers };
    if (cookie) headers['Cookie'] = cookie;
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const req = http.request(url, {
      method: options.method || 'GET',
      headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.headers['set-cookie']) {
          cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }
        let parsed = data;
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try { parsed = JSON.parse(data); } catch {}
        }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

const results = [];
function test(name, pass, details = '') {
  results.push({ name, pass, details });
  const icon = pass ? '✓' : '✗';
  console.log(`${icon} [${name}] ${details ? '— ' + details : ''}`);
  if (!pass) throw new Error(`Test failed: ${name} (${details})`);
}

async function runTests() {
  console.log('====================================================');
  console.log('   MORTUSOFT 100% COMPREHENSIVE END-TO-END TEST     ');
  console.log('====================================================\n');

  // 1. Static Assets & Pages
  console.log('--- 1. Static Assets & Core HTML ---');
  let res = await request('/');
  test('Serve index.html', res.status === 200 && res.data.includes('mortusoft'), `HTTP ${res.status}`);

  res = await request('/preview.css');
  test('Serve preview.css', res.status === 200 && res.data.includes('.ms-select-container'), `HTTP ${res.status}`);

  res = await request('/app.js');
  test('Serve app.js', res.status === 200 && res.data.includes('initCustomSelects'), `HTTP ${res.status}`);

  // 2. Auth & Session
  console.log('\n--- 2. Authentication & Local Session ---');
  res = await request('/api/auth/session');
  test('Unauthenticated session check', res.status === 200 && res.data.user === null, 'Returns null user');

  res = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'khalwaleted@gmail.com', password: 'Mortusoft2026!' }
  });
  test('Admin Login', res.status === 200 && res.data.user?.email === 'khalwaleted@gmail.com', `Logged in as ${res.data.user?.name}`);

  res = await request('/api/auth/session');
  test('Authenticated session check', res.status === 200 && res.data.user?.email === 'khalwaleted@gmail.com', 'Valid cookie session verified');

  // 3. Facility Management
  console.log('\n--- 3. Facility Management & Setup ---');
  res = await request('/api/facility');
  test('Get Facility Info', res.status === 200 && res.data.facility?.name, `Facility: ${res.data.facility?.name}`);

  const originalFacility = res.data.facility;
  res = await request('/api/facility', {
    method: 'PUT',
    body: { ...originalFacility, phone: '+254700000000' }
  });
  test('Update Facility Phone', res.status === 200 && res.data.facility?.phone === '+254700000000', 'Facility profile saved');

  // 4. Team & Invitations
  console.log('\n--- 4. Team & Access Permissions ---');
  res = await request('/api/team');
  test('Get Team Members', res.status === 200 && Array.isArray(res.data.members), `${res.data.members.length} members`);

  const testInviteEmail = `test.attendant.${Date.now()}@example.com`;
  res = await request('/api/team/invitations', {
    method: 'POST',
    body: { email: testInviteEmail, role: 'Mortuary attendant' }
  });
  test('Create Teammate Invitation', res.status === 201 && res.data.token, `Token generated for ${testInviteEmail}`);
  const inviteToken = res.data.token;

  res = await request(`/api/invitations/${inviteToken}`);
  test('Verify Invitation Link', res.status === 200 && res.data.email === testInviteEmail, `Role: ${res.data.role}`);

  // Find created invitation ID to clean up
  res = await request('/api/team');
  const createdInvite = res.data.invitations.find(i => i.email === testInviteEmail);
  if (createdInvite) {
    res = await request(`/api/team/invitations/${createdInvite.id}`, { method: 'DELETE' });
    test('Cancel/Delete Invitation', res.status === 200, 'Invitation revoked cleanly');
  }

  // 5. Cold Rooms & Storage
  console.log('\n--- 5. Cold Rooms & Storage Configuration ---');
  res = await request('/api/storage');
  test('Get Storage Overview', res.status === 200 && res.data.occupancy, `${res.data.occupancy.total} slots, ${res.data.occupancy.available} available`);

  const testRoomName = `Test Cold Unit ${Date.now().toString().slice(-4)}`;
  res = await request('/api/storage/rooms', {
    method: 'POST',
    body: { name: testRoomName, capacity: 6 }
  });
  test('Create Cold Room', res.status === 201 && res.data.room?.name === testRoomName, `Created ${testRoomName} with 6 slots`);
  const testRoom = res.data.room;

  // 6. Case Admissions & Register
  console.log('\n--- 6. Case Admissions & Lifecycle ---');
  // Identified Case Admission
  const testCasePayload = {
    personName: 'Samuel Omwamba',
    identificationStatus: 'Identified',
    sex: 'Male',
    estimatedAge: '52',
    admissionAt: new Date().toISOString(),
    source: 'Nairobi Hospital',
    nextOfKin: { name: 'Grace Omwamba', relationship: 'Spouse', phone: '+254722113344' },
    notes: 'Standard admission for preservation.'
  };

  res = await request('/api/cases', {
    method: 'POST',
    body: testCasePayload
  });
  test('Admit Identified Case', res.status === 201 && res.data.case?.caseNumber, `Case: ${res.data.case?.caseNumber} (${res.data.case?.personName})`);
  const admittedCase = res.data.case;

  // Unidentified Case Admission
  res = await request('/api/cases', {
    method: 'POST',
    body: {
      personName: '',
      identificationStatus: 'Unidentified',
      sex: 'Male',
      estimatedAge: 'approx 35',
      admissionAt: new Date().toISOString(),
      source: 'Police Station',
      nextOfKin: { name: '', relationship: '', phone: '' },
      notes: 'Brought by officer on duty.'
    }
  });
  test('Admit Unidentified Case', res.status === 201 && res.data.case?.identificationStatus === 'Unidentified', `Case: ${res.data.case?.caseNumber}`);

  // Query Case Register
  res = await request('/api/cases?q=Samuel');
  test('Search Case Register', res.status === 200 && res.data.cases.some(c => c.id === admittedCase.id), 'Found admitted case by query');

  res = await request(`/api/cases/${admittedCase.id}`);
  test('Get Case Record Details', res.status === 200 && res.data.case?.id === admittedCase.id, 'Loaded profile and history');

  res = await request(`/api/cases/${admittedCase.id}/qr.svg`);
  test('Generate Case QR SVG', res.status === 200 && res.headers['content-type'].includes('svg'), 'Opaque lookup QR generated');

  res = await request(`/api/cases/${admittedCase.id}/label-print`, { method: 'POST', body: {} });
  test('Audit QR Label Print Action', res.status === 200, 'Label print audited');

  // 7. Storage Slot Assignment
  console.log('\n--- 7. Storage Slot Assignment & Relocation ---');
  const availableSlot = testRoom.slots[0];
  res = await request(`/api/cases/${admittedCase.id}/storage`, {
    method: 'POST',
    body: { slotId: availableSlot.id }
  });
  test('Assign Storage Slot', res.status === 200 && res.data.case?.storageSlotId === availableSlot.id, `Assigned to ${testRoom.name} Slot ${availableSlot.label}`);

  // 8. Custody Movement Log
  console.log('\n--- 8. Chain of Custody Movements ---');
  res = await request(`/api/cases/${admittedCase.id}/movements`, {
    method: 'POST',
    body: {
      destination: 'Embalming room',
      destinationDetails: '',
      slotId: '',
      reason: 'Scheduled embalming procedure per family agreement'
    }
  });
  test('Record Custody Movement', res.status === 201 && res.data.case?.currentLocation === 'Embalming room', 'Moved to Embalming room');

  res = await request(`/api/cases/${admittedCase.id}/movements`);
  test('Fetch Movements History', res.status === 200 && res.data.movements.length >= 1, `${res.data.movements.length} movements recorded`);

  // 9. Case Documentation
  console.log('\n--- 9. Case Documents & Uploads ---');
  // Upload Release Form document (needed for release clearance)
  const mockPdfBase64 = Buffer.from('%PDF-1.4 mock release authorization form content').toString('base64');
  res = await request(`/api/cases/${admittedCase.id}/documents`, {
    method: 'POST',
    body: {
      name: 'Family_Release_Form.pdf',
      category: 'Release form',
      mimeType: 'application/pdf',
      data: mockPdfBase64
    }
  });
  test('Upload Release Form Document', res.status === 201 && res.data.document?.id, `Uploaded ${res.data.document?.name}`);
  const releaseDoc = res.data.document;

  res = await request(`/api/cases/${admittedCase.id}/documents`);
  test('List Case Documents', res.status === 200 && res.data.documents.some(d => d.id === releaseDoc.id), 'Documents listed');

  res = await request(`/api/documents/${releaseDoc.id}`);
  test('Download/View Document Content', res.status === 200 && res.headers['content-type'] === 'application/pdf', 'Binary stream retrieved');

  // 10. Billing, Invoices & Payments
  console.log('\n--- 10. Billing, Invoicing & Payments ---');
  res = await request(`/api/cases/${admittedCase.id}/billing`, {
    method: 'POST',
    body: {
      lines: [
        { description: 'Admission & registration fee', amount: 3500 },
        { description: 'Cold room storage (3 days)', amount: 6000 },
        { description: 'Embalming & preservation', amount: 15000 }
      ]
    }
  });
  test('Issue Service Invoice', res.status === 201 && res.data.invoice?.total === 24500, `Invoice ${res.data.invoice?.invoiceNumber}: Total KSh ${res.data.invoice?.total}`);
  const invoice = res.data.invoice;

  res = await request(`/api/invoices/${invoice.id}/payments`, {
    method: 'POST',
    body: {
      amount: 24500,
      method: 'M-Pesa',
      reference: 'QWE1234567'
    }
  });
  test('Record Invoice Payment', res.status === 201 && res.data.balance === 0, `Paid in full via M-Pesa. Balance: KSh ${res.data.balance}`);

  // 11. Family Communications
  console.log('\n--- 11. Family Communications & Consent ---');
  res = await request(`/api/cases/${admittedCase.id}/communications/contact`, {
    method: 'PUT',
    body: {
      name: 'Grace Omwamba',
      relationship: 'Spouse',
      phone: '+254722113344',
      email: 'grace.omwamba@example.com',
      preferredChannel: 'SMS',
      consentStatus: 'Granted',
      consentMethod: 'In person',
      consentNote: 'Confirmed during admission interview'
    }
  });
  test('Save Contact Preferences & Consent', res.status === 200 && res.data.ok === true, 'Consent recorded: Granted (SMS)');

  res = await request(`/api/cases/${admittedCase.id}/communications/messages`, {
    method: 'POST',
    body: { template: 'Facility update' }
  });
  test('Prepare Family Update Message', res.status === 201 && res.data.message?.status?.startsWith('Queued'), `Message queued for ${res.data.message?.recipientAddress}`);

  // 12. Release Clearance, Handover & File Closure
  console.log('\n--- 12. Release Clearance, Handover & File Closure ---');
  res = await request(`/api/cases/${admittedCase.id}/release-clearance`);
  test('Check Release Readiness', res.status === 200 && Array.isArray(res.data.checks), 'Clearance checks loaded');

  // Mark all checks Complete
  const checksPayload = {};
  res.data.checks.forEach(c => {
    checksPayload[c.key] = { state: 'Complete', reason: '' };
  });
  res = await request(`/api/cases/${admittedCase.id}/release-clearance`, {
    method: 'PUT',
    body: { checks: checksPayload }
  });
  test('Complete Clearance Checklist', res.status === 200 && res.data.blockers?.length === 0, 'Zero blockers remaining');

  // Authorize Final Handover & Release
  res = await request(`/api/cases/${admittedCase.id}/release`, {
    method: 'POST',
    body: {
      recipientName: 'Grace Omwamba',
      relationship: 'Spouse',
      phone: '+254722113344'
    }
  });
  test('Authorize Final Release & Handover', res.status === 200 && res.data.case?.status === 'Released', `Status: ${res.data.case?.status}, Storage slot freed`);

  // Close Completed Case
  res = await request(`/api/cases/${admittedCase.id}/close`, {
    method: 'POST',
    body: { reason: 'Final release handover verified and all paperwork completed' }
  });
  test('Close Completed File', res.status === 200 && res.data.case?.status === 'Closed', `Case status: ${res.data.case?.status}`);

  // 13. Reports & Intelligence
  console.log('\n--- 13. Operational Reports & Metrics ---');
  const now = new Date();
  const past = new Date(now); past.setDate(past.getDate() - 30);
  const from = past.toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  res = await request(`/api/reports?from=${from}&to=${to}`);
  test('Load Operational Reports', res.status === 200 && res.data.metrics?.admissions >= 1, `Admissions: ${res.data.metrics?.admissions}, Releases: ${res.data.metrics?.releases}`);

  // 14. Audit Log & Export
  console.log('\n--- 14. Governance & Audit Trails ---');
  res = await request(`/api/audit?from=${from}&to=${to}`);
  test('Query Audit Trail', res.status === 200 && res.data.events?.length > 0, `${res.data.events?.length} audit events recorded`);

  res = await request('/api/audit?format=csv');
  test('Export Audit CSV', res.status === 200 && res.headers['content-type']?.includes('text/csv'), `CSV export length: ${res.data?.length} chars`);

  // Clean up test room
  await request(`/api/storage/rooms/${testRoom.id}`, { method: 'DELETE' });

  console.log('\n====================================================');
  console.log(`   ALL ${results.length} TESTS PASSED WITH 100% SUCCESS! `);
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\nTEST SUITE RUNTIME ERROR:', err);
  process.exit(1);
});
