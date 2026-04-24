// Auth.js configuration for AgentPing-
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

exprt const authOptions: NextAuthConfig = {
  providers: [],
  callbacks: {

    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions)