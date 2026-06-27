import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "BukuTamu";`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "User";`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "RoleUser";`);
    
    await prisma.$executeRawUnsafe(`CREATE TYPE "RoleUser" AS ENUM ('ADMIN', 'TAMU');`);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "User" (
        "id" TEXT NOT NULL,
        "username" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "nama" TEXT NOT NULL,
        "instansi" TEXT,
        "role" "RoleUser" NOT NULL DEFAULT 'TAMU',
        "isAktif" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "User_username_key" UNIQUE ("username")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "BukuTamu" (
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

    return NextResponse.json({ message: "Tabel berhasil dibuat ulang dengan benar!" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
