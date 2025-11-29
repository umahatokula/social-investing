import crypto from 'crypto';

const DEFAULT_SECRET = 'dev-secret-change-me';
const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(secret?: string) {
  const effective = secret || process.env.TOKEN_SECRET || DEFAULT_SECRET;
  return crypto.createHash('sha256').update(effective).digest();
}

export function encrypt(value: string, secret?: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(secret);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(payload: string, secret?: string): string {
  const buffer = Buffer.from(payload, 'base64');
  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const text = buffer.subarray(IV_LENGTH + TAG_LENGTH);
  const key = getKey(secret);
  const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  return decrypted.toString('utf8');
}
