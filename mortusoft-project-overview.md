# Mortusoft — Project Overview

## 1. Product Overview

**Mortusoft** is a digital operating system for mortuaries, funeral homes, hospital mortuaries, and related deathcare organizations.

The platform is designed to manage the complete lifecycle of a case:

> **Admission → Identification → Storage → Preservation → Documentation → Family/Client Services → Billing → Release → Case Closure**

Mortusoft should replace fragmented paper records, spreadsheets, manual registers, disconnected billing systems, and informal communication with one secure, auditable platform.

The initial market focus is Kenya, with the architecture designed to support expansion into other African markets.

---

## 2. Product Vision

### Vision

> **Make every mortuary and funeral-home operation traceable, organized, secure, and easy to manage.**

### Product Positioning

Mortusoft should not be positioned simply as "mortuary software."

It should be positioned as:

> **The operating system for modern mortuaries and funeral homes.**

This creates room for the platform to expand from basic mortuary management into funeral arrangements, transport, payments, family communication, inventory, analytics, and multi-branch management.

---

## 3. Problem

Many mortuary and funeral-home workflows can involve:

- Paper admission registers
- Manual body identification records
- Physical storage/chamber registers
- Paper movement records
- Manual invoices and receipts
- Phone-based family communication
- Separate accounting systems
- Difficult-to-track documents
- Limited visibility into storage capacity
- Weak audit trails
- Manual release authorization
- Poor management reporting

These processes increase the risk of delays, missing information, billing errors, unauthorized movement, poor customer communication, and limited management visibility.

Mortusoft addresses these problems through a single workflow-driven system.

---

## 4. Target Customers

### Primary Customers

- Private mortuaries
- Funeral homes
- Hospital mortuaries
- County/public mortuaries
- Faith-based funeral homes
- Large funeral companies
- Multi-branch funeral organizations

### Secondary Customers

- Funeral transport companies
- Embalming/preservation service providers
- Organizations providing funeral benefits
- Insurance-related funeral service operations
- Forensic/medico-legal facilities where appropriate

---

## 5. Core Product Modules

### 5.1 Case & Body Management

The central module of Mortusoft.

Features:

- New case admission
- Unique case/admission number
- Deceased-person profile
- Next-of-kin information
- Source/referring facility
- Admission date/time
- Identification status
- Case status
- Notes and attachments
- QR/barcode identification
- Complete case history

---

### 5.2 Storage & Cold-Room Management

Provide a visual representation of available storage.

Features:

- Cold-room/chamber setup
- Storage capacity
- Occupancy status
- Chamber assignment
- Body movement
- Temporary/reserved spaces
- Maintenance status
- Occupancy dashboard
- QR scanning for quick lookup

Example:

```text
COLD ROOM A

[01] OCCUPIED   [02] OCCUPIED   [03] AVAILABLE   [04] OCCUPIED
[05] OCCUPIED   [06] OCCUPIED   [07] AVAILABLE   [08] OCCUPIED
[09] OCCUPIED   [10] RESERVED    [11] OCCUPIED    [12] OCCUPIED
```

---

### 5.3 Chain of Custody & Movement Tracking

Every significant movement should create an immutable audit event.

Example:

```text
Admission
    ↓
Identification
    ↓
Cold Room A / Chamber 12
    ↓
Embalming Room
    ↓
Cold Room A / Chamber 12
    ↓
Released to Authorized Recipient
```

Each event should capture:

- User/staff member
- Date/time
- Previous location
- New location
- Reason
- Supporting documents
- Authorization/signature where required

---

### 5.4 Identification & Unknown Bodies

Support both identified and unidentified cases.

For unidentified cases:

- Temporary case number
- Photograph
- Estimated age
- Sex
- Physical identifiers
- Clothing/property details
- Location found
- Police/authority reference
- Fingerprint information where applicable
- Examination status
- Identification updates

---

### 5.5 Preservation & Embalming

Track preservation activities associated with a case.

Features:

- Preservation date/time
- Technician
- Procedure notes
- Materials/chemicals used
- Inventory consumption
- Dressing status
- Grooming/preparation status
- Follow-up requirements
- Related documents

---

### 5.6 Documentation

Central document repository for each case.

Potential documents include:

- Admission documentation
- Identification documents
- Authorization forms
- Release forms
- Burial-related documentation
- Police/authority documents
- Postmortem documentation
- Invoices
- Receipts
- Other case attachments

Documents should be permission-controlled and linked directly to the relevant case.

---

### 5.7 Billing & Payments

Mortusoft should provide configurable billing for services.

Example:

```text
Storage                 KSh 5,000
Embalming              KSh 15,000
Preparation             KSh 8,000
Transport              KSh 12,000
---------------------------------
TOTAL                  KSh 40,000

Paid                   KSh 20,000
BALANCE                KSh 20,000
```

Capabilities:

- Service catalog
- Invoices
- Receipts
- Payments
- Discounts
- Outstanding balances
- Payment history
- Refunds/adjustments
- Cash and electronic payment recording
- M-Pesa integration
- Financial reporting

---

### 5.8 Release Clearance

A controlled workflow should determine whether a case can be released.

Example checklist:

- Identity verified
- Required documents complete
- Required authorization received
- Postmortem/authority requirements completed where applicable
- Financial requirements satisfied according to facility policy
- Recipient verified
- Release documentation completed
- Final authorization recorded

Possible outcomes:

**CLEARED FOR RELEASE**

or

**RELEASE BLOCKED**

with a clear reason.

---

### 5.9 Family & Client Portal

Provide families or authorized clients with a secure way to interact with the funeral home.

Potential capabilities:

- Case status
- Appointment information
- Required documents
- Invoices
- Payment status
- Payment links
- Notifications
- Service requests
- Secure messaging
- Release/collection information

Access must be carefully restricted because case information is highly sensitive.

---

### 5.10 Funeral Services

Mortusoft can expand beyond the mortuary into funeral-service coordination.

Potential features:

- Funeral arrangements
- Coffin/casket orders
- Service packages
- Ceremony details
- Burial information
- Venue details
- Transport scheduling
- Service-provider coordination

---

### 5.11 Hearse & Transport Management

Manage funeral vehicles and transport requests.

Features:

- Vehicle registry
- Driver registry
- Trip scheduling
- Pickup/drop-off locations
- Case association
- Dispatch status
- Mileage/fuel records
- Vehicle maintenance
- Trip history

---

### 5.12 Inventory

Track mortuary and funeral-home supplies.

Examples:

- Body bags
- PPE
- Embalming supplies
- Chemicals
- Identification tags
- Cleaning supplies
- Clothing
- Coffins/caskets
- Other consumables

Features:

- Stock levels
- Stock movements
- Purchases
- Usage
- Adjustments
- Reorder levels
- Supplier information
- Inventory reports

---

### 5.13 Staff & Access Management

Support role-based access.

Suggested roles:

- Super Administrator
- Facility Administrator
- Mortuary Manager
- Mortuary Attendant
- Embalming/Preservation Staff
- Reception/Front Desk
- Finance Officer
- Funeral Coordinator
- Driver
- Auditor/Read-only User

Permissions should be granular and based on facility, branch, module, and action.

---

### 5.14 Reports & Analytics

Management dashboard should provide operational and financial visibility.

Example metrics:

- Current occupancy
- Available capacity
- Admissions
- Releases
- Average length of stay
- Pending cases
- Outstanding balances
- Revenue
- Service revenue
- Inventory levels
- Transport activity
- Staff activity
- Release delays

---

## 6. MVP Scope

The first version should focus on the operational core rather than attempting to build the entire deathcare ecosystem immediately.

### MVP Modules

1. Case admission
2. Deceased-person profiles
3. Next-of-kin management
4. Unique case numbers
5. QR/barcode identification
6. Cold-room/chamber management
7. Body movement history
8. Document management
9. Basic billing
10. Payments
11. Release clearance
12. User roles and permissions
13. Audit logs
14. SMS notifications
15. Management dashboard

### Phase 2

- M-Pesa integration
- Family portal
- WhatsApp communication
- Inventory
- Preservation/embalming
- Hearse management
- Funeral-service workflows
- Advanced reporting

### Phase 3

- Multi-branch management
- Advanced analytics
- Mobile applications
- GPS/transport tracking
- Accounting integrations
- Insurance/funeral-benefit integrations
- API ecosystem

---

## 7. Key Differentiators

Mortusoft should compete on workflow quality rather than simply feature count.

### 7.1 QR-Based Case Tracking

Every case receives a unique identifier that can be scanned throughout the facility.

### 7.2 Complete Audit Trail

Every important action is recorded.

### 7.3 Visual Storage Management

Managers can see occupancy and availability immediately.

### 7.4 Release Control

The platform prevents incomplete cases from being released according to configured facility policies.

### 7.5 Local Payments

Support Kenyan payment workflows, particularly M-Pesa.

### 7.6 Family Experience

Give families controlled access to relevant information without exposing internal operational data.

### 7.7 Multi-Branch Ready

Allow organizations to manage multiple facilities from one account.

### 7.8 Simple User Experience

The product should be usable by staff who are not highly technical.

---

## 8. Suggested High-Level Architecture

Mortusoft should be designed as a multi-tenant SaaS platform.

```text
                    MORTUSOFT
                        │
              ┌─────────┴─────────┐
              │                   │
          Web Admin           Mobile/Tablet
              │                   │
              └─────────┬─────────┘
                        │
                    API Layer
                        │
       ┌────────────────┼────────────────┐
       │                │                │
   Case Engine       Billing         Workflow
       │                │                │
   Storage          Payments        Notifications
       │                │                │
       └────────────────┼────────────────┘
                        │
                    Database
                        │
             ┌──────────┼──────────┐
             │          │          │
          Files       Audit      Analytics
```

The architecture should support:

- Multi-tenancy
- Role-based access control
- Secure APIs
- Audit logging
- File/document storage
- Background jobs
- Notifications
- Payment integrations
- Reporting
- Backups
- Monitoring

---

## 9. Security & Privacy

Mortusoft will handle sensitive personal, family, financial, and potentially medico-legal information.

Security should therefore be a first-class product requirement.

Recommended controls:

- Strong authentication
- Role-based permissions
- Tenant isolation
- Encryption in transit
- Encryption at rest
- Secure document storage
- Detailed audit logs
- Session management
- Backup and disaster recovery
- Data retention policies
- Controlled exports
- Minimal data exposure
- Administrative activity monitoring

The product should be designed to comply with applicable Kenyan data-protection, health, funeral, public-sector, and other relevant requirements before deployment in regulated environments.

---

## 10. Integrations

Potential integrations include:

### Payments

- M-Pesa
- Bank/payment providers
- Payment gateways

### Communications

- SMS providers
- WhatsApp Business
- Email

### Operations

- QR/barcode scanners
- Printers
- Receipt printers
- Optional biometric devices where legally and operationally appropriate

### Future Integrations

- Accounting software
- Insurance systems
- Hospital information systems
- Government/authority systems where APIs and permissions are available

---

## 11. Business Model

Mortusoft should use a SaaS model.

### Possible Pricing Structure

#### Starter

For small funeral homes/mortuary facilities.

- Core case management
- Storage management
- Basic billing
- Basic reports
- Limited users

#### Professional

For established facilities.

- Full case management
- Billing
- Payments
- Inventory
- Notifications
- Advanced reports
- More users
- Family portal

#### Enterprise

For large organizations and multi-branch operators.

- Multi-branch
- Advanced permissions
- API access
- Custom integrations
- Dedicated support
- Advanced analytics
- Custom workflows

Additional revenue opportunities:

- SMS usage
- Payment processing/integration fees where applicable
- Premium storage
- Custom integrations
- Data migration
- Training
- Implementation services
- Enterprise support

---

## 12. Primary User Journey

### Case Admission

```text
Staff logs in
    ↓
Create new case
    ↓
Enter deceased details
    ↓
Enter next-of-kin
    ↓
Upload required documents
    ↓
Generate unique case number
    ↓
Generate QR code
    ↓
Assign storage location
    ↓
Case becomes ACTIVE
```

### Body Movement

```text
Scan case QR
    ↓
Select "Move Body"
    ↓
Select destination
    ↓
Enter reason
    ↓
Confirm
    ↓
Audit event created
    ↓
Current location updated
```

### Release

```text
Open case
    ↓
Run release checklist
    ↓
Verify documents
    ↓
Verify authorization
    ↓
Verify recipient
    ↓
Verify configured financial requirements
    ↓
Authorize release
    ↓
Record recipient
    ↓
Case marked RELEASED
    ↓
Storage slot becomes AVAILABLE
```

---

## 13. Dashboard Concept

### Facility Overview

```text
MORTUSOFT
────────────────────────────────────────

ACTIVE CASES             63
AVAILABLE STORAGE        17
TODAY'S ADMISSIONS        8
TODAY'S RELEASES          6

PENDING ACTIONS           11
OUTSTANDING BALANCES      KSh 720,000

────────────────────────────────────────

STORAGE
Cold Room A       82%
Cold Room B       71%
Cold Room C       54%

────────────────────────────────────────

RECENT CASES

MRT-00452   Active       Chamber A12
MRT-00453   Pending      Chamber A14
MRT-00454   Released    Closed
MRT-00455   Active       Chamber B03
```

---

## 14. Success Metrics

Mortusoft should measure both product usage and customer outcomes.

### Operational

- Reduction in admission processing time
- Reduction in release processing time
- Reduction in missing documentation
- Reduction in unidentified/untracked movements
- Storage utilization visibility
- Percentage of cases with complete digital records

### Financial

- Monthly recurring revenue
- Average revenue per facility
- Payment collection rate
- Outstanding balance reduction
- Customer retention

### Product

- Daily active staff
- Cases processed digitally
- QR scans
- Documents uploaded
- Release workflows completed
- Notification delivery rate

---

## 15. Roadmap

### Phase 0 — Discovery

- Interview mortuary/funeral-home operators
- Map current workflows
- Identify regulatory requirements
- Define terminology
- Validate MVP
- Identify pilot facilities

### Phase 1 — MVP

Build:

- Authentication
- Facility setup
- Users/roles
- Case management
- Storage management
- QR codes
- Movement tracking
- Documents
- Billing
- Release workflow
- Audit logs
- Dashboard

### Phase 2 — Operational Expansion

Add:

- M-Pesa
- SMS
- Inventory
- Preservation
- Family portal
- WhatsApp
- Transport
- Advanced reports

### Phase 3 — Scale

Add:

- Multi-branch
- Mobile apps
- API platform
- Accounting integrations
- Advanced analytics
- Enterprise controls

---

## 16. Product Principles

Mortusoft should follow these principles:

### 1. Every case has one source of truth.

The digital case record should contain the authoritative operational history.

### 2. Every movement is traceable.

Staff should never need to rely on memory or paper notes to determine where a case went.

### 3. Sensitive information is protected by default.

Users should only see the information required for their role.

### 4. The system should work for non-technical staff.

Speed and simplicity matter.

### 5. Mobile/tablet workflows are important.

Staff should be able to perform operational tasks at the point of work.

### 6. Local workflows come first.

Kenyan payments, communication channels, terminology, and operational realities should influence the initial product.

### 7. Automation should remove repetitive work.

Notifications, invoices, reports, alerts, and status updates should be automated wherever appropriate.

---

## 17. Long-Term Vision

Mortusoft can evolve from a mortuary management application into a broader **deathcare operating platform**.

```text
                    MORTUSOFT
                        │
       ┌────────────────┼─────────────────┐
       │                │                 │
   MORTUARY         FUNERAL            FAMILY
   OPERATIONS       SERVICES           PORTAL
       │                │                 │
       ├─ Cases         ├─ Planning       ├─ Status
       ├─ Storage       ├─ Transport      ├─ Payments
       ├─ Preservation  ├─ Coffins        ├─ Documents
       ├─ Documents     ├─ Burial         └─ Communication
       └─ Release       └─ Scheduling
                        │
                  ┌─────┴─────┐
                  │           │
               PAYMENTS    ANALYTICS
```

The long-term goal is to make Mortusoft the digital infrastructure that connects the operational, financial, logistical, and customer-facing sides of modern deathcare organizations.

---

## 18. Recommended First Pilot

The ideal first pilot should be a real mortuary or funeral-home facility with:

- Meaningful daily case volume
- Multiple storage locations
- Existing billing processes
- Several staff roles
- A willingness to replace or supplement paper workflows
- A clear operational decision-maker
- Reliable internet access
- A willingness to provide structured product feedback

The pilot should focus on proving one thing:

> **Can Mortusoft make a mortuary's daily operation more organized, traceable, and efficient than its current process?**

If the answer is yes, the product can then expand into payments, family communication, funeral services, transport, analytics, and multi-branch management.

---

## 19. One-Sentence Product Definition

> **Mortusoft is a secure, workflow-driven operating system that helps mortuaries and funeral homes manage cases, storage, documentation, billing, movement, release, and family services from one platform.**
