import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

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
      
      // Fetch role from database
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true, id: true, username: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
          token.username = dbUser.username;
        }
      } catch (e) {}
      
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
