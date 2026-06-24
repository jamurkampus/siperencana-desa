// src/app/api/auth/seed-admin/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const existing = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    if (existing) {
      return NextResponse.json({ message: "Admin sudah ada" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);

    await prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        nama: "Lamri, S.P.",
        instansi: "Desa Susuk Dalam",
        role: "ADMIN",
      },
    });

    return NextResponse.json({ message: "Admin berhasil dibuat. Username: admin, Password: admin123" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal membuat admin" }, { status: 500 });
  }
}
