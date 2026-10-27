import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/neon-data/workspace-context";

export async function GET() {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  if (!membership) return NextResponse.json({ error: "No facility is linked to this account." }, { status: 409 });
  const [invoiceResult, lineResult, paymentResult, caseResult] = await Promise.all([
    neonDb.from("invoices").select("id,invoice_number,case_id,currency,status,created_at").eq("facility_id", membership.facility_id).order("created_at", { ascending: false }).limit(200),
    neonDb.from("invoice_lines").select("id,invoice_id,description,amount_minor").eq("facility_id", membership.facility_id),
    neonDb.from("payments").select("id,invoice_id,amount_minor,method,reference,paid_at").eq("facility_id", membership.facility_id).order("paid_at", { ascending: false }),
    neonDb.from("cases").select("id,case_number,deceased_name").eq("facility_id", membership.facility_id),
  ]);
  if ([invoiceResult, lineResult, paymentResult, caseResult].some(result => result.error)) return NextResponse.json({ error: "Billing records could not be loaded. Check finance access and the Phase 14 migration." }, { status: 403 });
  const cases = new Map((caseResult.data ?? []).map(item => [item.id, item]));
  const invoices = (invoiceResult.data ?? []).map(invoice => {
    const lines = (lineResult.data ?? []).filter(line => line.invoice_id === invoice.id);
    const payments = (paymentResult.data ?? []).filter(payment => payment.invoice_id === invoice.id);
    const totalMinor = lines.reduce((sum, line) => sum + Number(line.amount_minor), 0);
    const paidMinor = payments.reduce((sum, payment) => sum + Number(payment.amount_minor), 0);
    return { ...invoice, case: cases.get(invoice.case_id) ?? null, lines, payments, totalMinor, paidMinor, dueMinor: Math.max(0, totalMinor - paidMinor) };
  });
  return NextResponse.json({ invoices });
}

export async function POST(request: NextRequest) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  if (!membership) return NextResponse.json({ error: "No facility is linked to this account." }, { status: 409 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = String(input?.action ?? "");
  if (action === "create") {
    const caseId = String(input?.caseId ?? ""); const description = String(input?.description ?? "").trim();
    const amount = Number(input?.amount);
    if (!caseId || description.length < 2 || !Number.isFinite(amount) || amount <= 0 || amount > 100000000) return NextResponse.json({ error: "Choose a case, service description, and valid positive KSh amount." }, { status: 400 });
    const { data, error: saveError } = await neonDb.rpc("create_invoice", { target_facility: membership.facility_id, target_case: caseId, line_description: description, line_amount_minor: Math.round(amount * 100) });
    if (saveError) return NextResponse.json({ error: saveError.code === "42501" ? "Only facility administrators, managers, and finance staff can issue invoices." : saveError.message }, { status: saveError.code === "42501" ? 403 : 400 });
    return NextResponse.json({ invoice: data }, { status: 201 });
  }
  if (action === "payment") {
    const invoiceId = String(input?.invoiceId ?? ""); const method = String(input?.method ?? "").trim();
    const reference = String(input?.reference ?? "").trim(); const amount = Number(input?.amount);
    if (!invoiceId || method.length < 2 || method.length > 40 || !Number.isFinite(amount) || amount <= 0 || amount > 100000000) return NextResponse.json({ error: "Choose an issued invoice, payment method, and valid KSh amount." }, { status: 400 });
    const { data, error: saveError } = await neonDb.rpc("record_invoice_payment", { target_facility: membership.facility_id, target_invoice: invoiceId, payment_amount_minor: Math.round(amount * 100), payment_method: method, payment_reference: reference || null });
    if (saveError) return NextResponse.json({ error: saveError.code === "23505" ? "That payment reference has already been recorded." : saveError.code === "42501" ? "Only facility administrators, managers, and finance staff can record payments." : saveError.message }, { status: saveError.code === "23505" ? 409 : saveError.code === "42501" ? 403 : 400 });
    return NextResponse.json({ payment: data }, { status: 201 });
  }
  return NextResponse.json({ error: "Choose an invoice or payment action." }, { status: 400 });
}

