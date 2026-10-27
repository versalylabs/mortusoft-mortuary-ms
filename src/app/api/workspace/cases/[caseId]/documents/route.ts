import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/neon-data/workspace-context";
import { createCaseDocumentUrl, deleteCaseDocument, putCaseDocument } from "@/lib/neon/object-storage";

type Context = { params: Promise<{ caseId: string }> };
const bucket = "case-documents";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const extensions: Record<string, string> = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg" };

export async function GET(_request: NextRequest, { params }: Context) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  const { caseId } = await params;
  if (!membership || !uuid.test(caseId)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  const { data, error: queryError } = await neonDb.from("case_documents")
    .select("id,original_name,category,mime_type,byte_size,uploaded_at,uploaded_by,object_path")
    .eq("facility_id", membership.facility_id).eq("case_id", caseId).order("uploaded_at", { ascending: false });
  if (queryError) return NextResponse.json({ error: "Case documents could not be loaded." }, { status: 403 });
  const documents = await Promise.all((data ?? []).map(async document => {
    const signedUrl = await createCaseDocumentUrl(document.object_path, 120).catch(() => null);
    return { ...document, object_path: undefined, signedUrl };
  }));
  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest, { params }: Context) {
  const { neonDb, user, membership, error } = await getWorkspaceContext();
  if (error) return NextResponse.json({ error }, { status: user ? 503 : 401 });
  const { caseId } = await params;
  if (!membership || !uuid.test(caseId)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  const form = await request.formData();
  const file = form.get("file"); const category = String(form.get("category") ?? "Supporting document").trim();
  if (!(file instanceof File) || !extensions[file.type] || file.size < 1 || file.size > 5 * 1024 * 1024 || category.length < 2 || category.length > 80) {
    return NextResponse.json({ error: "Choose a PDF, PNG, or JPEG file under 5 MB and a document category." }, { status: 400 });
  }
  const { data: caseRow, error: caseError } = await neonDb.from("cases").select("id")
    .eq("facility_id", membership.facility_id).eq("id", caseId).maybeSingle();
  if (caseError || !caseRow) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validMagic = file.type === "application/pdf" ? new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-"
    : file.type === "image/png" ? bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (!validMagic) return NextResponse.json({ error: "The file contents do not match the selected file type." }, { status: 400 });

  const objectPath = `${membership.facility_id}/${caseId}/${randomUUID()}.${extensions[file.type]}`;
  try {
    await putCaseDocument(objectPath, bytes, file.type);
  } catch {
    return NextResponse.json({ error: "Upload failed. Check Neon Object Storage credentials and bucket configuration." }, { status: 503 });
  }
  const { data, error: metadataError } = await neonDb.from("case_documents").insert({
    facility_id: membership.facility_id, case_id: caseId, object_path: objectPath,
    original_name: file.name.slice(0, 240), category, mime_type: file.type, byte_size: file.size, uploaded_by: user!.id,
  }).select("id,original_name,category,mime_type,byte_size,uploaded_at").single();
  if (metadataError) {
    await deleteCaseDocument(objectPath).catch(() => undefined);
    return NextResponse.json({ error: "Document metadata could not be saved. Confirm your facility role." }, { status: 403 });
  }
  return NextResponse.json({ document: data }, { status: 201 });
}

