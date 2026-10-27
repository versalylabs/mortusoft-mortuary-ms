# Mortusoft

Mortusoft is being built phase by phase as a workflow tool for mortuary and funeral-home operations.

## Local preview

Run the dependency-free local server from the project folder:

```sh
node local-preview-server.mjs
```

Open `http://localhost:3000`. On first use, create the facility administrator account and facility profile. Later visits can sign in with that account. Facility details, accounts, sessions, and invitations are kept in `data/mortusoft-local.json`; the data folder is excluded from Git.

The server uses Node's built-in HTTP and crypto modules. Passwords are stored as salted scrypt hashes. Sign-in sessions use random, server-validated tokens in HttpOnly, SameSite cookies with a 12-hour lifetime. Five failed sign-in attempts trigger a 15-minute lockout for that email and client address. Invitation links expire after 48 hours; the server does not send email, so an administrator must share each link directly.

## Phase 3: Case management

The case register supports search by case number, deceased person's name, and next-of-kin details, plus status filtering. Admissions support identified and unidentified cases, admission date/time, referral source, profile details, next of kin, and an internal note. The server generates a facility-prefixed, year-scoped number for each case and records the admission as the first case-history event. Case data is persisted in the same ignored local JSON file.

Later local-preview phases add storage, movement, documents, billing, release, communications, reports, and QR case labels. These workflows remain development features rather than a production deployment.

## Phase 4: Storage and cold rooms

Facility administrators can configure cold rooms with individual numbered slots. The storage overview shows total capacity, occupied and available slots, and utilization. Staff can assign or move an active case to an available slot from its case record; each assignment is added to the case history and local audit log. A room can only be removed while it has no active case assignments.

## Phase 5: Chain of custody and movement tracking

An authorized, signed-in staff member can record a case movement to a cold-room slot or another facility area. Each event captures its origin, destination, reason, server timestamp, and staff identity and role. Events appear in chronological case history and are also written to the local audit log. The movement API only appends records; it has no update or delete operation.

## Phase 6: Case documentation and attachments

Each case can hold categorized PDF, PNG, or JPEG documents up to 5 MB each. Files are stored under the ignored local `data/documents` directory with restrictive file permissions; metadata and upload audit events are stored in the local data file. Viewing a document requires an authenticated facility session. Uploads are checked against file signatures, not only the file extension. This local preview does not encrypt stored files or provide managed backups, so keep real personal, medical, and legal documents out of it.

## Phase 7: Basic billing and payments

Finance officers, facility administrators, and mortuary managers can create case-linked invoices with service line items in whole KSh amounts, then record partial or full payments. The server calculates totals, paid amounts, balances, and invoice state, and prevents overpayment. M-Pesa and bank transfers are recorded manually with a transaction reference; this preview does not initiate payment transactions or connect to a payment provider.

## Phase 8: Release clearance

Facility administrators and mortuary managers can update a case release checklist covering identity, supporting documents, authority/postmortem requirements, family authorization, finance policy, recipient verification, release form, and final authorization. Authority, family, and finance items may be marked not applicable only with a reason. A completed document categorized as `Release form` is required. The server blocks release while any required check or form is missing, verifies recipient name/relationship/contact, records the authorizing staff member and timestamp, and marks the case Released. Phase 13 adds a separate close action after release; the original handover record stays preserved. Requirements must be reviewed against facility policy and applicable authority instructions; the checklist does not determine legal eligibility.

This local file-backed server is for development and workflow review. It is single-facility and single-process, has no automated backup, email delivery, TLS termination, or managed identity/database service. Do not use it for real case records or deploy it to Vercel as the production backend. Production needs a managed database, HTTPS, operational backups, and a production identity/session setup before sensitive information is entered.

## Phase 9: Notifications and family communication

Authorized facility and family-services staff can update the next-of-kin contact details, choose SMS or email, and record consent status, channel, method, timestamp, and staff member. Consent is not assumed; changing the preferred channel clears the prior grant so consent must be recorded again for that channel. The server blocks message preparation unless consent is granted for the currently selected channel and a matching destination is on file. Three case-reference templates create an auditable, case-linked local message log. Messages are not transmitted; no SMS gateway or email provider is connected.

## Phase 10: Operational reports and dashboard metrics

The dashboard summarizes current active cases, monthly admissions and releases, and storage utilization. Operational reports provide a selectable date range (up to 367 days), daily admissions, releases and movements, current case status, storage occupancy, invoice totals, payments recorded, outstanding balances, and invoice line-item totals. Reports are scoped to the single local facility and use the file-backed records; they are not a substitute for an audited accounting report.

See [MVP-READINESS-ROADMAP.md](MVP-READINESS-ROADMAP.md) for the gap assessment, pilot exit criteria, and recommended next build phases. This preview remains for workflow review and must not be used for real case records or deployed as the production backend.

## Phase 12: Case identification and QR labels

Authorized staff can open a case's printable identification label. Its QR contains a URL with only the case's opaque random identifier; it does not contain a name or other case details. Scanning the URL requires staff sign-in before the case API returns its record. Label print actions are recorded in case history and the local audit log. `MORTUSOFT_PUBLIC_URL` controls the URL printed into the QR; the local-preview default is `http://localhost:3000`, which must be replaced with the canonical application URL in a deployed environment. Printer sizing and physical scan workflows still need validation with the pilot facility.

## Phase 14: Production data and document foundation

The production foundation targets Neon Postgres, Neon Managed Better Auth, the Neon Data API, and a private Neon Object Storage bucket. The `neon/migrations` scripts use Neon Auth JWT claims for facility-scoped role policies while preserving audit triggers. `neon.ts` declares the private `case-documents` bucket. The Next.js application uses Neon configuration when `NEXT_PUBLIC_NEON_URL` is present; without provider credentials, the local demo remains available.

To provision the backend, create a Neon project, enable Managed Better Auth and the Data API, then set the values in `.env.example` in `.env.local`. Install/link the Neon CLI, link this folder to the intended project and branch, run `neon deploy` to provision Auth and the private bucket, and run `npm run db:migrate` to apply the numbered SQL files in order. The migration runner records checksums and applies each migration transactionally. Add the database URL, Auth URL, cookie secret, and Neon-generated S3 credentials as server-only Vercel variables; only `NEXT_PUBLIC_NEON_URL` is public. Keep database credentials and S3 keys out of browser code and Git.

The local JSON preview does not read or write Neon and no local JSON records are migrated. The Neon project still needs to be provisioned and the migration/access rules exercised with synthetic accounts before production data. Configure backups and complete a restore drill before a pilot.

## Phase 15: Integrations and dashboard acceptance

The production workspace uses the Neon Data API for PostgREST-compatible queries, Neon Managed Better Auth for sessions, and Neon Object Storage for private attachments. The follow-on migration `neon/migrations/20261021000200_phase15_workflows.sql` adds atomic movement and invoice operations, release prerequisites, and duplicate-payment protections.

The Neon project is not yet provisioned because this workspace has no Neon account credentials. App code, migrations, and infrastructure declaration are in place, but connected sign-in, workflow checks, and Vercel deployment still require project credentials and validation. The local preview at `http://localhost:3000` remains a separate local-data app. SMS/email delivery and M-Pesa processing are not connected; payments entered now are manual accounting records. Do not use real case records until the Phase 16 go-live gate, backup/restore, and required facility privacy review are complete.

## Phase 13: MVP operations and audit review

The audit view is available to facility administrators and read-only auditors. It supports date, action, and text filters and exports the filtered events as CSV. The server's permission map controls facility/team administration, case writes and closure, billing, release, communications, and audit access; writes are checked server-side. A released case can be closed with an attributed closure reason while preserving the release record. This preview appends audit events in a local JSON file, which a computer operator can still alter; this is not tamper-resistant or production-ready. Structured unidentified-person details and identification updates remain for pilot definition.
