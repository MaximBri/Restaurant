import { createHash, randomBytes } from 'node:crypto';

export function generateRefreshToken() {
  return randomBytes(48).toString('hex');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
