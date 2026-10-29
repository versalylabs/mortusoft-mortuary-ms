"use client";

import { useState } from "react";
import AuthGate from "../components/AuthGate";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";

type InvoiceItem = {
  id: string;
  caseId: string;
  deceased: string;
  billedTo: string;
  phone: string;
  amount: number;
  paidAmount: number;
  date: string;
  status: "Paid" | "Partial" | "Pending";
  services: string[];
};

const defaultInvoices: InvoiceItem[] = [
  { id: "INV-2026-089", caseId: "MRT-00458", deceased: "Grace Wanjiku", billedTo: "James Wanjiku", phone: "+254 712 345 678", amount: 24500, paidAmount: 24500, date: "20 Oct 2026", status: "Paid", services: ["Cold storage (2 days)", "Preservation treatment", "Viewing preparation"] },
  { id: "INV-2026-088", caseId: "MRT-00457", deceased: "Peter Mwangi", billedTo: "Sarah Mwangi", phone: "+254 722 987 654", amount: 18000, paidAmount: 10000, date: "20 Oct 2026", status: "Partial", services: ["Cold storage (2 days)", "Intake registration"] },
  { id: "INV-2026-087", caseId: "MRT-00455", deceased: "Josephine Achieng", billedTo: "Oduor Achieng", phone: "+254 733 112 233", amount: 32000, paidAmount: 0, date: "19 Oct 2026", status: "Pending", services: ["Cold storage (3 days)", "Full embalming", "Chapel viewing"] },
  { id: "INV-2026-086", caseId: "MRT-00454", deceased: "Samuel Kiprop", billedTo: "Faith Kiprop", phone: "+254 720 445 566", amount: 15500, paidAmount: 15500, date: "18 Oct 2026", status: "Paid", services: ["Cold storage (1 day)", "Standard preservation"] },
  { id: "INV-2026-085", caseId: "MRT-00453", deceased: "Daniel Otieno", billedTo: "Mary Otieno", phone: "+254 711 778 899", amount: 28500, paidAmount: 28500, date: "17 Oct 2026", status: "Paid", services: ["Cold storage (3 days)", "Preparation suite", "Hearse transfer fee"] },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(defaultInvoices);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState<InvoiceItem | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [notice, setNotice] = useState("");

  // New Invoice Form fields
  const [formCase, setFormCase] = useState("MRT-00458");
  const [formBilledTo, setFormBilledTo] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAmount, setFormAmount] = useState("18000");

  const filtered = invoices.filter((item) => {
    const textMatch = `${item.id} ${item.caseId} ${item.deceased} ${item.billedTo}`.toLowerCase().includes(query.toLowerCase());
    const statusMatch = statusFilter === "All" || item.status === statusFilter;
    return textMatch && statusMatch;
  });

  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalPending = invoices.reduce((acc, i) => acc + (i.amount - i.paidAmount), 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv: InvoiceItem = {
      id: `INV-2026-0${90 + invoices.length - defaultInvoices.length}`,
      caseId: formCase,
      deceased: formCase === "MRT-00458" ? "Grace Wanjiku" : "Peter Mwangi",
      billedTo: formBilledTo.trim() || "Next of Kin",
      phone: formPhone || "+254 700 000 000",
      amount: Number(formAmount) || 15000,
      paidAmount: 0,
      date: "Today, Just now",
      status: "Pending",
      services: ["Cold storage", "Facility care service"]
    };

    setInvoices([newInv, ...invoices]);
    setShowModal(false);
    setNotice(`Invoice ${newInv.id} issued successfully.`);
    setFormBilledTo("");
    setFormPhone("");
  };

  const handleApplyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal) return;

    const added = Number(payAmount) || 0;
    const newPaid = Math.min(paymentModal.amount, paymentModal.paidAmount + added);
    const newStatus = newPaid >= paymentModal.amount ? "Paid" : "Partial";

    const updated = invoices.map((inv) => (inv.id === paymentModal.id ? { ...inv, paidAmount: newPaid, status: newStatus as InvoiceItem["status"] } : inv));

    setInvoices(updated);
    setNotice(`Payment of KSh ${added.toLocaleString()} recorded for ${paymentModal.id}.`);
    setPaymentModal(null);
    setPayAmount("");
  };

  return (
    <AuthGate>
      <AppShell active="Billing">
        <div className="page-heading">
          <div>
            <p className="eyebrow">FACILITY FINANCE <span>·</span> INVOICES & PAYMENTS</p>
            <h1>Billing & Cashflow<span>.</span></h1>
            <p className="heading-subtitle">Chamber daily storage billing, embalming invoices, and real-time payment reconciliation.</p>
          </div>
          <button className="primary-button" onClick={() => setShowModal(true)}>
            <Icon name="plus" size={17} /> Issue invoice
          </button>
        </div>

        {notice && (
          <div className="notice-strip" style={{ marginBottom: 16 }}>
            <span className="notice-icon"><Icon name="check" size={14} /></span>
            <span>{notice}</span>
            <button style={{ marginLeft: "auto", background: "none", border: 0, cursor: "pointer", color: "var(--palette-steel)" }} onClick={() => setNotice("")}>✕</button>
          </div>
        )}

        {/* Financial Metrics */}
        <section className="metrics-grid" style={{ marginBottom: 20 }}>
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Total Collected</span>
              <span className="metric-icon metric-icon-teal"><Icon name="receipt" size={17} /></span>
            </div>
            <div className="metric-value">KSh {(totalCollected).toLocaleString()}</div>
            <div className="metric-foot"><span className="trend trend-up">All settled invoices</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Outstanding Receivables</span>
              <span className="metric-icon metric-icon-amber"><Icon name="clock" size={17} /></span>
            </div>
            <div className="metric-value">KSh {(totalPending).toLocaleString()}</div>
            <div className="metric-foot"><span className="trend trend-up">Due on handover</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Active Invoices</span>
              <span className="metric-icon metric-icon-indigo"><Icon name="file" size={17} /></span>
            </div>
            <div className="metric-value">{invoices.length}</div>
            <div className="metric-foot"><span>Across current cycle</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Average Settlement</span>
              <span className="metric-icon metric-icon-blue"><Icon name="check" size={17} /></span>
            </div>
            <div className="metric-value" style={{ fontSize: 22 }}>2.4 Days</div>
            <div className="metric-foot"><span className="trend trend-up">Discharge clearance</span></div>
          </article>
        </section>

        {/* Invoices Table */}
        <section className="panel cases-panel">
          <div className="panel-heading cases-heading">
            <div>
              <div className="panel-title-row">
                <h2>Invoice Ledger</h2>
                <span className="count-pill">{filtered.length} invoices</span>
              </div>
              <p>Storage charges update automatically per calendar day until discharge clearance.</p>
            </div>
          </div>

          <div className="table-toolbar" style={{ flexWrap: "wrap", gap: 12 }}>
            <label className="search-box">
              <Icon name="search" size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search invoice #, case #, or recipient..."
                aria-label="Search invoices"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: 40,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "#ffffff",
                color: "var(--ink)",
                fontSize: 13,
                fontWeight: 600
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>INVOICE #</th>
                  <th>LINKED CASE</th>
                  <th>BILLED TO</th>
                  <th>AMOUNT</th>
                  <th>PAID</th>
                  <th>STATUS</th>
                  <th style={{ width: 110 }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ fontSize: 13.5, color: "var(--palette-steel)" }}>{item.id}</strong>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: 11.5 }}>{item.date}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: 13, color: "var(--ink)" }}>{item.deceased}</strong>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: 11.5 }}>{item.caseId}</small>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{item.billedTo}</span>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: 11.5 }}>{item.phone}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: 13.5, color: "var(--ink)" }}>KSh {item.amount.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: item.paidAmount >= item.amount ? "#2D7D46" : "#A68868", fontWeight: 700 }}>
                        KSh {item.paidAmount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`case-status status-${item.status === "Paid" ? "active" : item.status === "Pending" ? "pending" : "review"}`}>
                        <i /> {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status !== "Paid" ? (
                        <button
                          type="button"
                          onClick={() => setPaymentModal(item)}
                          style={{
                            background: "var(--palette-steel)",
                            color: "#ffffff",
                            border: 0,
                            borderRadius: 6,
                            padding: "6px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Record Pay
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "#2D7D46", fontWeight: 700 }}>
                          ✓ Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Record Payment Modal */}
        {paymentModal && (
          <div
            className="modal-shade"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(7, 23, 57, 0.5)",
              backdropFilter: "blur(3px)",
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setPaymentModal(null);
            }}
          >
            <div style={{ background: "#ffffff", borderRadius: 12, maxWidth: 460, width: "100%", padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <span className="count-pill">{paymentModal.id}</span>
                  <h3 style={{ margin: "4px 0 0", fontSize: 18, color: "var(--ink)" }}>Record Payment</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentModal(null)}
                  style={{ background: "#F5EFEB", border: 0, borderRadius: "50%", width: 30, height: 30, cursor: "pointer" }}
                >
                  <Icon name="close" size={15} />
                </button>
              </div>

              <div style={{ padding: 14, background: "#FAF8F5", borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
                <div><b>Deceased:</b> {paymentModal.deceased} ({paymentModal.caseId})</div>
                <div><b>Total Billed:</b> KSh {paymentModal.amount.toLocaleString()}</div>
                <div><b>Already Paid:</b> KSh {paymentModal.paidAmount.toLocaleString()}</div>
                <div><b>Balance Due:</b> KSh {(paymentModal.amount - paymentModal.paidAmount).toLocaleString()}</div>
              </div>

              <form onSubmit={handleApplyPayment} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700 }}>
                  Amount Received (KSh)
                  <input
                    type="number"
                    required
                    placeholder={`e.g. ${paymentModal.amount - paymentModal.paidAmount}`}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13.5 }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700 }}>
                  Payment Method
                  <select style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 10px", fontSize: 13 }}>
                    <option>M-Pesa Paybill</option>
                    <option>Direct Bank Transfer / RTGS</option>
                    <option>Cash Receipt</option>
                    <option>Corporate / Insurance Guarantee</option>
                  </select>
                </label>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button type="button" className="subtle-button" onClick={() => setPaymentModal(null)}>Cancel</button>
                  <button type="submit" className="primary-button">Confirm & Issue Receipt</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Issue Invoice Modal */}
        {showModal && (
          <div
            className="modal-shade"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(7, 23, 57, 0.5)",
              backdropFilter: "blur(3px)",
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <div style={{ background: "#ffffff", borderRadius: 12, maxWidth: 500, width: "100%", padding: 26, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <p className="eyebrow" style={{ margin: 0 }}>FINANCIAL BILLING</p>
                  <h3 style={{ margin: "4px 0 0", fontSize: 18, color: "var(--ink)" }}>Issue Facility Invoice</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: "#F5EFEB", border: 0, borderRadius: "50%", width: 30, height: 30, cursor: "pointer" }}
                >
                  <Icon name="close" size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700 }}>
                  Select Case Record
                  <select
                    value={formCase}
                    onChange={(e) => setFormCase(e.target.value)}
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 10px", fontSize: 13 }}
                  >
                    <option value="MRT-00458">MRT-00458 · Grace Wanjiku</option>
                    <option value="MRT-00457">MRT-00457 · Peter Mwangi</option>
                    <option value="MRT-00455">MRT-00455 · Josephine Achieng</option>
                    <option value="MRT-00454">MRT-00454 · Samuel Kiprop</option>
                  </select>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700 }}>
                    Billed To (Next of Kin)
                    <input
                      required
                      placeholder="e.g. John Wanjiku"
                      value={formBilledTo}
                      onChange={(e) => setFormBilledTo(e.target.value)}
                      style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13 }}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700 }}>
                    Contact Phone
                    <input
                      placeholder="+254 700 000 000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13 }}
                    />
                  </label>
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700 }}>
                  Total Invoice Amount (KSh)
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13.5 }}
                  />
                </label>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button type="button" className="subtle-button" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="primary-button">Generate Invoice</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </AuthGate>
  );
}
