import { compare, hash } from 'bcryptjs';

// Re-export authOptions từ NextAuth config
export { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * 🔧 BCRYPT CONFIGURATION FOR SHARED HOSTING
 * 
 * Salt Rounds vs Performance:
 * - 10 rounds: ~100ms (tốt cho shared hosting)
 * - 12 rounds: ~300ms (mặc định, an toàn)
 * - 14 rounds: ~1s (quá nặng cho shared hosting)
 * 
 * Shared hosting (3GB RAM, limited CPU): Dùng 10 rounds
 * VPS/Dedicated: Có thể dùng 12 rounds
 */
const BCRYPT_SALT_ROUNDS = 10; // Tối ưu cho shared hosting

export async function hashPassword(password) {
  return await hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

export function validateUsername(username) {
  return /[a-zA-Z0-9_]{3,20}$/.test(username);
}
