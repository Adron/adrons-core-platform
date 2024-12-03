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
          console.log('Missing credentials');
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        console.log('Attempting to find user:', username);

        const user = await prisma.user.findUnique({
          where: { username }
        });

        if (!user) {
          console.log('User not found');
          return null;
        }

        console.log('Found user, comparing passwords');
        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          console.log('Invalid password');
          return null;
        }

        console.log('Password valid, returning user');
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