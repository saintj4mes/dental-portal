import "server-only";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | undefined;

function configuration() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET;
  if (!endpoint || !accessKeyId || !secretAccessKey || !region || !bucket) {
    throw new Error("S3 storage is not configured. Set AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and S3_BUCKET.");
  }
  return { endpoint, accessKeyId, secretAccessKey, region, bucket };
}

function storageClient(): S3Client {
  if (client) return client;
  const config = configuration();
  client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
  return client;
}

export async function putPatientFile(input: { key: string; mimeType: string; body: Uint8Array }) {
  const { bucket } = configuration();
  await storageClient().send(new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    Body: input.body,
    ContentType: input.mimeType,
  }));
}

export async function deleteStoredFile(key: string) {
  const { bucket } = configuration();
  await storageClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function createPatientFileUrl(input: { key: string; fileName: string; mimeType: string }): Promise<string> {
  const { bucket } = configuration();
  const safeName = input.fileName.replace(/[\r\n"\\]/g, "_").slice(0, 180);
  const disposition = input.mimeType.startsWith("image/") || input.mimeType === "application/pdf" || input.mimeType === "application/dicom" ? "inline" : "attachment";
  return getSignedUrl(storageClient(), new GetObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ResponseContentType: input.mimeType,
    ResponseContentDisposition: `${disposition}; filename="${safeName}"`,
  }), { expiresIn: 300 });
}
