import fs from 'node:fs';
import path from 'node:path';

const dataFile = 'data/mortusoft-local.json';
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Retain only user, sessions, facility
const cleanStore = {
  users: data.users || [],
  invitations: [],
  facility: data.facility || {
    id: "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    name: "Nairobi Memorial Mortuary",
    type: "Private mortuary",
    county: "Nairobi",
    email: "khalwaleted@gmail.com",
    phone: "+254 700 000 000",
    timezone: "Africa/Nairobi",
    prefix: "MRT",
    createdAt: new Date().toISOString()
  },
  sessions: data.sessions || [],
  cases: [],
  storageRooms: [],
  movements: [],
  documents: [],
  invoices: [],
  payments: [],
  messages: [],
  audit: []
};

// Reset facility prefix to MRT
if (cleanStore.facility) {
  cleanStore.facility.name = "Nairobi Memorial";
  cleanStore.facility.prefix = "MRT";
  cleanStore.facility.phone = "+254 700 000 000";
}

fs.writeFileSync(dataFile, JSON.stringify(cleanStore, null, 2), 'utf8');
console.log('Reset data/mortusoft-local.json successfully');

// Clean data/documents folder
const docDir = 'data/documents';
if (fs.existsSync(docDir)) {
  fs.readdirSync(docDir).forEach(f => {
    try {
      fs.unlinkSync(path.join(docDir, f));
      console.log('Deleted document:', f);
    } catch {}
  });
}
console.log('Documents directory emptied');
