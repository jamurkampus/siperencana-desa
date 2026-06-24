// src/app/api/db-push/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Bikin tabel User dan BukuTamu kalau belum ada
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "nama" TEXT NOT NULL,
        "instansi" TEXT,
        "role" TEXT NOT NULL DEFAULT 'TAMU',
        "isAktif" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BukuTamu" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "keperluan" TEXT NOT NULL,
        "waktuMasuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "waktuKeluar" TIMESTAMP(3),
        "keterangan" TEXT,
        CONSTRAINT "BukuTamu_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "BukuTamu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);

    return NextResponse.json({ message: "Tabel berhasil dibuat!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
