// Auth.js configuration for AgentPing-
import NextAuth from 'next-auth';

import type { NextAuthConfig } from 'next-auth';

export const authOptions: NextAuthConfig = {
  providers: [],
  callbacks: {
    authrized({ auth }) {
      return !!auth?.user;
    },
  },
  pages: {
    signIn: '/login',
  },
};

