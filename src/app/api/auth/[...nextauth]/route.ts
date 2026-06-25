// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        keperluan: { label: "Keperluan", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user || !user.isAktif) return null;

        const passwordValid = await bcrypt.compare(credentials.password, user.password);
        if (!passwordValid) return null;

        if (user.role === "TAMU") {
          await prisma.bukuTamu.create({
            data: {
              userId: user.id,
              keperluan: credentials.keperluan || "Tidak disebutkan",
            },
          });
        }

        return {
          id: user.id,
          name: user.nama,
          email: user.username,
          role: user.role,
          instansi: user.instansi,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: string }).role;
        token.instansi = (user as unknown as { instansi: string }).instansi;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { role: string }).role = token.role as string;
        (session.user as unknown as { instansi: string }).instansi = token.instansi as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
