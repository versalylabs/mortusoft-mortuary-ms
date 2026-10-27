import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = "case-documents";

function client() {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3 } = process.env;
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_ENDPOINT_URL_S3) {
    throw new Error("Neon Object Storage is not configured. Run neon deploy and set its generated AWS_* variables.");
  }
  return new S3Client({
    endpoint: AWS_ENDPOINT_URL_S3,
    region: process.env.AWS_REGION || "us-east-2",
    forcePathStyle: true,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
  });
}

export async function putCaseDocument(key: string, body: Uint8Array, contentType: string) {
  await client().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function deleteCaseDocument(key: string) {
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function createCaseDocumentUrl(key: string, expiresInSeconds = 120) {
  if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(pdf|png|jpg)$/.test(key)) {
    throw new Error("Document path is invalid.");
  }
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: Math.max(30, Math.min(300, expiresInSeconds)),
  });
}

