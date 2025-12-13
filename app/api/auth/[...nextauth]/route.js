import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
// 🔧 SỬ DỤNG PRISMA SINGLETON thay vì tạo mới
import prisma from '@/lib/prisma';

// 🔧 Cache user role trong memory với giới hạn kích thước
const userRoleCache = new Map();
const ROLE_CACHE_TTL = 300000; // 5 minutes
const MAX_CACHE_SIZE = 10000; // Giới hạn 10k entries để tránh memory leak

// 🔧 Cleanup routine chạy mỗi 5 phút
setInterval(() => {
  const now = Date.now();
  let deletedCount = 0;
  for (const [key, value] of userRoleCache.entries()) {
    if (now >= value.expiresAt) {
      userRoleCache.delete(key);
      deletedCount++;
    }
  }
  // Nếu vẫn quá size, xóa entries cũ nhất
  if (userRoleCache.size > MAX_CACHE_SIZE) {
    const entriesToDelete = userRoleCache.size - MAX_CACHE_SIZE;
    const keys = Array.from(userRoleCache.keys()).slice(0, entriesToDelete);
    keys.forEach(k => userRoleCache.delete(k));
  }
}, 300000); // 5 phút

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
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Vui lòng nhập đầy đủ thông tin');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error('Email không tồn tại');
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Mật khẩu không đúng');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
          };
        } catch (error) {
          console.error('Auth error:', error);
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
