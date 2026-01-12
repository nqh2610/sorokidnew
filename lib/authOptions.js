import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';
import {
  checkLoginProtection,
  recordFailedLogin,
  recordSuccessfulLogin,
  getResponseDelay,
  sleep
} from '@/lib/loginProtection';
import {
  cleanupRoleCache,
  getCachedUser,
  setCachedUser,
} from '@/lib/authCache';

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
        identifier: { label: 'Email hoặc Username', type: 'text' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error('Vui lòng nhập đầy đủ thông tin');
          }

          const identifier = credentials.identifier.toLowerCase().trim();
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

          // 🛡️ STEP 1: Kiểm tra login protection (rate limit + lock)
          const protection = checkLoginProtection(req, identifier);
          if (!protection.allowed) {
            throw new Error(protection.error);
          }

          // 🛡️ STEP 2: Query user - Tìm theo email hoặc username
          const user = await prisma.user.findFirst({
            where: isEmail 
              ? { email: identifier }
              : { username: identifier },
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
            recordFailedLogin(protection.ip, identifier);
            throw new Error('Email/Tên đăng nhập hoặc mật khẩu không đúng');
          }

          // 🛡️ STEP 3: So sánh password (tốn CPU nhất)
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            // Ghi nhận login thất bại
            const result = recordFailedLogin(protection.ip, identifier);
            // Delay response
            await sleep(getResponseDelay(protection.failedAttempts + 1));
            
            // Trả message tùy thuộc có bị lock không
            if (result.locked) {
              throw new Error(result.message);
            }
            throw new Error(`Email hoặc mật khẩu không đúng. Còn ${result.remainingAttempts} lần thử`);
          }

          // 🎉 Login thành công - Reset counter
          recordSuccessfulLogin(protection.ip, identifier);

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
          // 🔧 KHÔNG tạo user ngay - chỉ kiểm tra xem đã tồn tại chưa
          // User sẽ được tạo khi hoàn tất form complete-profile
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, isProfileComplete: true }
          });
          
          // Nếu user chưa tồn tại, vẫn cho phép đăng nhập
          // Thông tin sẽ được lưu tạm trong JWT token
          // User sẽ được tạo khi hoàn tất complete-profile
          
          // Đánh dấu vào user object để JWT callback biết
          if (!existingUser) {
            user.isNewGoogleUser = true;
            user.isProfileComplete = false;
          } else {
            user.id = existingUser.id;
            user.isProfileComplete = existingUser.isProfileComplete;
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, user, trigger }) {
      // Xử lý user mới từ Google (chưa có trong DB)
      if (user) {
        token.id = user.id;
        token.username = user.username;
        
        // Đánh dấu nếu là Google user mới chưa có trong DB
        if (user.isNewGoogleUser) {
          token.isNewGoogleUser = true;
          token.isProfileComplete = false;
          token.googleName = user.name;
          token.googleImage = user.image;
          return token; // Trả về ngay, không query DB
        }
        
        // Nếu user đã có trong DB
        if (user.isProfileComplete !== undefined) {
          token.isProfileComplete = user.isProfileComplete;
        }
      }
      
      // Nếu là Google user mới, không cần query DB
      if (token.isNewGoogleUser) {
        token.role = token.email === 'nqh2610@gmail.com' ? 'admin' : 'student';
        return token;
      }
      
      // 🔧 TỐI ƯU: Chỉ query DB khi cần thiết
      // - Lần đầu login (user mới)
      // - Khi trigger là 'update' (user cập nhật session)
      // - Khi cache miss
      const shouldRefresh = !token.role || trigger === 'update';
      
      // 🔧 Lazy cleanup - chỉ chạy 1/10 requests để giảm overhead
      if (Math.random() < 0.1) {
        cleanupRoleCache();
      }
      
      // 🔧 TỐI ƯU: Cache user role để giảm DB queries
      const cacheKey = token.email;
      const cached = getCachedUser(cacheKey);
      
      if (cached && !shouldRefresh) {
        // Sử dụng cached data - KHÔNG query DB
        token.role = cached.role;
        token.id = cached.id;
        token.username = cached.username;
        token.name = cached.name;
        token.isProfileComplete = cached.isProfileComplete;
        // Xóa flag nếu user đã tồn tại trong DB
        delete token.isNewGoogleUser;
      } else if (shouldRefresh || !cached) {
        // Chỉ fetch từ database khi thực sự cần
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { role: true, id: true, username: true, name: true, isProfileComplete: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
            token.username = dbUser.username;
            token.name = dbUser.name;
            token.isProfileComplete = dbUser.isProfileComplete;
            // Xóa flag nếu user đã tồn tại trong DB
            delete token.isNewGoogleUser;
            // Cache kết quả - TTL 5 phút
            setCachedUser(cacheKey, {
              role: dbUser.role,
              id: dbUser.id,
              username: dbUser.username,
              name: dbUser.name,
              isProfileComplete: dbUser.isProfileComplete,
            });
          } else {
            // User chưa tồn tại trong DB (Google user mới)
            token.isNewGoogleUser = true;
            token.isProfileComplete = false;
          }
        } catch (e) {
          console.error('JWT callback DB error:', e);
          // Fallback to cached if available
          if (cached) {
            token.role = cached.role;
            token.id = cached.id;
          }
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
        session.user.name = token.name || session.user.name; // Lấy từ DB, fallback Google
        session.user.role = token.role || 'student';
        session.user.isProfileComplete = token.isProfileComplete !== false; // default true
        
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
