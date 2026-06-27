// src/app/api/auth/tamu/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { nama, instansi, keperluan, lat, lng, device } = await req.json();

    if (!nama || !keperluan) {
      return NextResponse.json({ error: "Nama dan keperluan wajib diisi" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "Unknown";
    const timestamp = Date.now();
    const username = `tamu_${timestamp}`;
    const password = `tamu_${timestamp}_pass`;
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, username, password, nama, instansi, role, "isAktif", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'TAMU', true, NOW(), NOW())`,
      username, hashedPassword, nama, instansi ?? null
    );

    const user = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "User" WHERE username = $1 LIMIT 1`,
      username
    );

    if (user.length > 0) {
      const lokasiStr = lat && lng ? `Lokasi: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)} | ` : "Lokasi: Tidak diaktifkan | ";
      await prisma.$executeRawUnsafe(
        `INSERT INTO "BukuTamu" (id, "userId", keperluan, "waktuMasuk", keterangan)
         VALUES (gen_random_uuid()::text, $1, $2, NOW(), $3)`,
        user[0].id,
        keperluan,
        `${lokasiStr}Device: ${device} | IP: ${ip}`
      );
    }

    return NextResponse.json({ username, password, message: "Berhasil" });
  } catch (error) {
    console.error("Tamu error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
