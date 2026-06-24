// src/lib/auth.ts
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  const role = (session.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}

export async function getSession() {
  return await getServerSession();
}
