import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { execute } from '../db/index.js';

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN;

let s3Client: S3Client | null = null;

function getR2Client(): S3Client | null {
  if (s3Client) return s3Client;

  if (r2AccountId && r2AccessKeyId && r2SecretAccessKey) {
    try {
      s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey
        }
      });
      return s3Client;
    } catch (err) {
      console.error('Gagal menginisialisasi Cloudflare R2 S3Client:', err);
    }
  }
  return null;
}

export async function processImageUpload(file: File): Promise<{
  url: string;
  filename: string;
  id: number;
  storage_type: 'cloudflare_r2';
}> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const originalName = file.name;
  
  const lastDotIndex = originalName.lastIndexOf('.');
  const ext = lastDotIndex !== -1 ? originalName.substring(lastDotIndex) : '.jpg';
  const rawName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
  
  const cleanName = rawName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
  const size = buffer.length;
  const mimeType = file.type || 'image/jpeg';

  const client = getR2Client();
  let publicUrl = '';
  const storageType: 'cloudflare_r2' = 'cloudflare_r2';

  if (!client || !r2BucketName) {
    throw new Error('Konfigurasi R2 tidak valid. Penyimpanan lokal dinonaktifkan di lingkungan Edge.');
  }

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: `uploads/${filename}`,
        Body: buffer,
        ContentType: mimeType
      })
    );

    if (r2PublicDomain) {
      const domain = r2PublicDomain.replace(/\/$/, '');
      publicUrl = domain.startsWith('http') ? `${domain}/uploads/${filename}` : `https://${domain}/uploads/${filename}`;
    } else {
      publicUrl = `https://${r2BucketName}.${r2AccountId}.r2.cloudflarestorage.com/uploads/${filename}`;
    }
  } catch (r2Err) {
    throw new Error(`Gagal upload ke R2 Cloudflare Bucket: ${r2Err}`);
  }

  const { lastInsertId } = await execute(
    `INSERT INTO media (filename, original_name, mime_type, size, url) 
     VALUES (?, ?, ?, ?, ?)`,
    [filename, file.name, mimeType, size, publicUrl]
  );

  return {
    url: publicUrl,
    filename,
    id: lastInsertId,
    storage_type: storageType
  };
}

export function getR2ConfigStatus() {
  const isR2Configured = !!(r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2BucketName);
  return {
    configured: isR2Configured,
    account_id: r2AccountId ? `${r2AccountId.substring(0, 4)}***` : undefined,
    bucket_name: r2BucketName || 'local-r2-emulator',
    public_domain: r2PublicDomain || 'local /uploads',
    provider: 'Cloudflare R2 Object Storage'
  };
}
