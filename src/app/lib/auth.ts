import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import type { NextAuthConfig } from 'next-auth';
import { User } from '@prisma/client';

// Add this at the top of the file
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('Environment:', process.env.NODE_ENV);

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
    }
  }
}

const prisma = new PrismaClient();

export const { handlers: { GET, POST }, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { username }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Make sure to return all required fields
        return {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Explicitly set all required fields
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Explicitly set all required fields
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
} satisfies NextAuthConfig);