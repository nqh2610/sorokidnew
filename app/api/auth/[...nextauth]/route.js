import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
// 🔧 SỬ DỤNG PRISMA SINGLETON thay vì tạo mới
import prisma from '@/lib/prisma';
// 🛡️ LOGIN PROTECTION - Chống brute-force
import {
  checkLoginProtection,
  recordFailedLogin,
  recordSuccessfulLogin,
  getResponseDelay,
  sleep
} from '@/lib/loginProtection';

// 🔧 Cache user role trong memory với giới hạn kích thước
const userRoleCache = new Map();
const ROLE_CACHE_TTL = 300000; // 5 minutes
const MAX_CACHE_SIZE = 10000; // Giới hạn 10k entries để tránh memory leak

// 🔧 Lazy cleanup - KHÔNG dùng setInterval để tránh spawn process
function cleanupRoleCache() {
  if (userRoleCache.size < MAX_CACHE_SIZE / 2) return; // Chỉ cleanup khi cần
  
  const now = Date.now();
  let cleaned = 0;
  for (const [key, value] of userRoleCache.entries()) {
    if (now >= value.expiresAt) {
      userRoleCache.delete(key);
      cleaned++;
    }
    if (cleaned >= 500) break; // Dừng sớm
  }
}

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Vui lòng nhập đầy đủ thông tin');
          }

          const email = credentials.email.toLowerCase().trim();

          // 🛡️ STEP 1: Kiểm tra login protection (rate limit + lock)
          const protection = checkLoginProtection(req, email);
          if (!protection.allowed) {
            throw new Error(protection.error);
          }

          // 🛡️ STEP 2: Query user - CHỈ LẤY CÁC FIELD CẦN THIẾT
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              username: true,
              avatar: true
            }
          });

          if (!user) {
            // Delay để chống timing attack
            await sleep(getResponseDelay(protection.failedAttempts));
            recordFailedLogin(protection.ip, email);
            throw new Error('Email hoặc mật khẩu không đúng');
          }

          // 🛡️ STEP 3: So sánh password (tốn CPU nhất)
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            // Ghi nhận login thất bại
            const result = recordFailedLogin(protection.ip, email);
            // Delay response
            await sleep(getResponseDelay(protection.failedAttempts + 1));
            
            // Trả message tùy thuộc có bị lock không
            if (result.locked) {
              throw new Error(result.message);
            }
            throw new Error(`Email hoặc mật khẩu không đúng. Còn ${result.remainingAttempts} lần thử`);
          }

          // 🎉 Login thành công - Reset counter
          recordSuccessfulLogin(protection.ip, email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
          };
        } catch (error) {
          console.error('Auth error:', error.message);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google') {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                username: user.email.split('@')[0],
                name: user.name,
                avatar: user.image,
                password: '',
                role: user.email === 'nqh2610@gmail.com' ? 'admin' : 'student',
              },
            });
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      
      // 🔧 Lazy cleanup (thay vì setInterval)
      cleanupRoleCache();
      
      // 🔧 TỐI ƯU: Cache user role để giảm DB queries
      const cacheKey = token.email;
      const cached = userRoleCache.get(cacheKey);
      
      if (cached && Date.now() < cached.expiresAt) {
        // Sử dụng cached data
        token.role = cached.role;
        token.id = cached.id;
        token.username = cached.username;
      } else {
        // Fetch từ database và cache
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { role: true, id: true, username: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
            token.username = dbUser.username;
            // Cache kết quả
            userRoleCache.set(cacheKey, {
              role: dbUser.role,
              id: dbUser.id,
              username: dbUser.username,
              expiresAt: Date.now() + ROLE_CACHE_TTL
            });
          }
        } catch (e) {
          console.error('JWT callback DB error:', e);
          // Không throw error - giữ token cũ nếu có
        }
      }
      
      // Admin email override
      if (token.email === 'nqh2610@gmail.com') {
        token.role = 'admin';
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role || 'student';
        
        // Admin email override
        if (session.user.email === 'nqh2610@gmail.com') {
          session.user.role = 'admin';
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
