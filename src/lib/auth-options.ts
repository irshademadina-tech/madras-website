import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;
        if (!verifyPassword(credentials.password, user.passwordHash)) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.uid = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "irshad-e-madina-dev-secret",
};

// Helper for API routes
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

export type Role = "PARENT" | "STUDENT" | "TEACHER" | "ADMIN";

export interface RoleSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: Role;
  };
}

export async function requireRole(roles: Role[]) {
  const session = (await getServerSession(authOptions)) as RoleSession | null;
  if (!session?.user?.id || !session.user.role) return null;
  if (!roles.includes(session.user.role)) return null;
  return session;
}
