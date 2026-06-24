// src/app/api/auth/daftar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password, nama, instansi } = await req.json();

    if (!username || !password || !nama) {
      return NextResponse.json({ error: "Username, password, dan nama wajib diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nama,
        instansi,
        role: "TAMU",
      },
    });

    return NextResponse.json({ message: "Pendaftaran berhasil, silakan login" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mendaftar" }, { status: 500 });
  }
}
