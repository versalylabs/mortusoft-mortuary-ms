# Mortusoft MVP readiness roadmap

This roadmap compares the project overview with the current local preview. It separates workflow demonstrations from the controls and infrastructure needed for a real facility pilot. The local preview is not approved for real case or family data.

## Current baseline

The preview demonstrates local sign-in and facility setup, team accounts and invitations, case admission and search, storage assignment, movement history, case documents, invoices and manually recorded payments, release clearance, consent-gated family message drafts, and basic operational reports.

These workflows use a single-process Node server and local JSON/file storage. Message drafts are not delivered, payments are not processed, and there is no production database, managed document store, automated backup, or production identity service. The existing role checks are coarse and single-facility; the audit events are not presented in a review/export interface. The dashboard and reports cover only a subset of the overview metrics.

## MVP gaps against the overview

| Area | Current state | MVP completion needed |
| --- | --- | --- |
| Case identity | Numbered records; opaque QR label, authenticated case lookup and print audit entry implemented in Phase 12 | Validate printer sizing and scan distance with the pilot; add structured unknown-person identifiers and updates |
| Storage | Rooms, slots, assignment, occupancy | Reserved/maintenance states, room-level metrics, and safe point-of-work lookup |
| Custody | Movement reason, staff, time, origin/destination | Reviewable, exportable audit history and supporting authorization evidence where required |
| Documents | Local PDF/PNG/JPEG attachments | Managed private storage, access policy, retention, backup and restore |
| Billing | Invoices and manually entered payments | Receipts and operationally approved adjustments; real payment integration is a separate, later scope |
| Release | Checklist, blockers, recipient and terminal released state | Facility-specific policy validation, complete audit review, and pilot sign-off of release rules |
| Access | Local accounts, invitations and broad roles | Explicit permission matrix, facility/tenant isolation, secure recovery and production session controls |
| Notifications | Consent record and local draft log | Provider-backed delivery, delivery outcomes, retries, opt-out handling and message governance |
| Dashboard | Active cases, monthly admissions/releases, storage utilization and basic period reports | Today's admissions/releases, available capacity, pending actions, outstanding balances, recent cases, room occupancy and validated reporting definitions |
| Operations | Local development preview | Monitoring, incident response, data retention, restore drills, and reviewed privacy/security requirements |

Preservation/embalming, inventory, family portal, funeral services, transport, multi-branch operation, and advanced analytics are expansion scope in the overview; they are not prerequisites for the first narrow MVP pilot unless a pilot facility requires them.

## Recommended build order and exit criteria

### Phase 11 â€” MVP gap definition (this phase)

- Record the current baseline and gaps against the overview.
- Keep production deployment out of scope until the pilot and security gates below are met.
- Select one pilot facility workflow and agree what counts as a successful case lifecycle.

**Complete when:** product owner and pilot facility confirm the MVP feature list, role matrix, release checklist, and reporting definitions.

### Phase 12 â€” Case identification and QR labels (local preview implemented)

- Generate a printable QR/barcode label from the case's opaque identifier.
- Scan/search resolves to a case only after authentication and facility authorization.
- QR contents expose no name, contact, medical, legal, or other sensitive data.
- Reprint and replacement are auditable; labels work at the pilot's actual printer and scan distance.

**Implemented locally:** QR SVG uses an opaque random case identifier, direct-link lookup passes through sign-in, and print actions add case history and audit entries. Physical printer and phone-scanner validation remains open.

### Phase 13 â€” MVP operations and audit review (local preview implemented)

- Added an authenticated audit viewer with date, action, and free-text filters plus filtered CSV export. Audit records are appended by workflow actions and the UI exposes no edit/delete path.
- Centralized server-side permissions for facility/team administration, case writes and closure, billing, release, family communications, and audit access. The audit view displays the current role matrix.
- Added a guarded closure transition for released cases; the release handover remains preserved and closure requires an attributed reason.
- Facility isolation and tamper-resistant audit storage remain production gates: the current local JSON file is not a security boundary and is editable by a local machine operator.
- Structured unidentified-person details and identification update workflow remain open for pilot definition.

### Phase 14 â€” Production data and document foundation (Neon integration scaffolded)

- Ported the facility, case, storage, movement, document, invoice, release, communications, and audit schema to `neon/migrations`, using Neon Auth user claims for RLS policies.
- Added a Neon configuration declaring Managed Better Auth and a private `case-documents` Object Storage bucket.
- Added Neon SDK client/auth wiring and an S3-compatible private document storage adapter with short-lived signed downloads.
- Neon project provisioning, migration application, full connected workflow verification, backup/restore, retention, and live policy review remain open. The local JSON preview and its sample data are not migrated.
### Phase 15 â€” Integrations and dashboard acceptance

- Implemented the connected workspace shell with persistent sidebar navigation and right-side pages; the local preview follows the same layout.
- Ported the Postgres migrations to Neon Data API/Postgres with facility role policies, atomic case movement, seeded release checks, enforced release prerequisites, invoice numbering, and duplicate-payment protections.
- Moved production auth/data SDK wiring to Neon Managed Better Auth and Neon Data API; private document uploads and temporary download links use Neon Object Storage.
- Overview metrics are intended to come from facility-scoped records; billing totals are computed from invoice lines and payments.
- Remaining before Phase 15 acceptance: provision Neon, apply migrations, validate API-route auth and tenant/role behavior using synthetic accounts, finish invitations, validate report definitions/date boundaries, and select communications/payment providers.
- Connect SMS/email only after provider selection, consent rules, opt-out behavior, delivery tracking, and retry policy are agreed.
- Treat M-Pesa as a separate payment-provider integration with reconciliation and idempotency requirements.
### Phase 16 â€” Pilot verification and deployment

- Complete role-based workflow review, accessibility/mobile checks, security review, backup/restore drill, and end-to-end acceptance with synthetic or approved test data.
- Resolve all high-priority findings and document support, incident, and recovery procedures.
- Deploy the production Next.js application and services to the chosen hosting setup, then verify domain, HTTPS, monitoring, and rollback.
- Start with a limited pilot and explicit data migration/consent plan.

## Go-live gate

Do not enter real personal, family, financial, medical, or medico-legal records until production identity, tenant isolation, managed storage, encryption, backups/restore, access review, incident ownership, and facility/privacy/legal review are complete. Vercel hosting alone does not provide those application controls, and the current custom local preview server is not the production deployment target.

## Recommended next implementation

Continue **Phase 15 â€” Integrations and dashboard acceptance** next. Provision Neon, apply its migrations, complete new-member invitations, validate tenant/role behavior and report definitions with synthetic accounts, and make provider decisions for communications and payment processing. Configure backup/restore before pilot data. Proceed to Phase 16 only after acceptance and provider decisions are complete.
