import crypto from 'node:crypto';

export interface UserSessionPayload {
  role: 'teacher' | 'student';
  id: string;
  name: string;
  classId?: string;
  grade?: number;
  email?: string;
  iat?: number;
  exp?: number;
}

const DEFAULT_SECRET = 'cloudplay_secure_session_secret_2025_gdpt2018';
const SECRET_KEY = process.env.SESSION_SECRET || process.env.JWT_SECRET || DEFAULT_SECRET;

/**
 * Base64URL encoder/decoder helper
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Tạo token phiên đăng nhập mã hóa HMAC SHA-256
 */
export function createSessionToken(
  payload: Omit<UserSessionPayload, 'iat' | 'exp'>,
  expiresInSeconds: number = 7 * 24 * 3600 // Mặc định 7 ngày
): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: UserSessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Xác thực và giải mã token phiên làm việc
 */
export function verifySessionToken(token: string): UserSessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  // Verify HMAC signature with timing-safe comparison
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature.length !== expectedSignature.length) {
    return null;
  }

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: UserSessionPayload = JSON.parse(payloadJson);

    // Kiểm tra hạn sử dụng (exp)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

