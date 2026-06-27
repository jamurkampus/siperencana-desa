// src/app/api/auth/seed-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    const validToken = process.env.SEED_ADMIN_TOKEN;

    if (!token || token !== validToken) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    if (existing) {
      return NextResponse.json({ message: "Admin sudah ada" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);

    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, username, password, nama, instansi, role, "isAktif", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'ADMIN', true, NOW(), NOW())`,
      "admin", hashedPassword, "Lamri, S.P.", "Desa Susuk Dalam"
    );

    return NextResponse.json({ message: "Admin berhasil dibuat. Username: admin, Password: admin123" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
