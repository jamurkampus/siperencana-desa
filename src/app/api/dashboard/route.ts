// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalKegiatan,
      kegiatanBerjalan,
      kegiatanSelesai,
      kegiatanDraft,
      kegiatanDiajukan,
      kegiatanDisetujui,
      aggAnggaran,
      perBidangRaw,
      perSumberRaw,
      recentKegiatan,
      desa,
      tahunAktif,
    ] = await Promise.all([
      prisma.kegiatan.count(),
      prisma.kegiatan.count({ where: { status: "BERJALAN" } }),
      prisma.kegiatan.count({ where: { status: "SELESAI" } }),
      prisma.kegiatan.count({ where: { status: "DRAFT" } }),
      prisma.kegiatan.count({ where: { status: "DIAJUKAN" } }),
      prisma.kegiatan.count({ where: { status: "DISETUJUI" } }),
      prisma.kegiatan.aggregate({ _sum: { anggaran: true } }),
      prisma.kegiatan.groupBy({
        by: ["bidang"],
        _count: { id: true },
        _sum: { anggaran: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.kegiatan.groupBy({
        by: ["sumberDana"],
        _count: { id: true },
        _sum: { anggaran: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.kegiatan.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          tahunAnggaran: { select: { tahun: true } },
        },
      }),
      prisma.desa.findFirst(),
      prisma.tahunAnggaran.findFirst({ where: { isAktif: true } }),
    ]);

    return NextResponse.json({
      data: {
        totalKegiatan,
        totalAnggaran: Number(aggAnggaran._sum.anggaran ?? 0),
        kegiatanBerjalan,
        kegiatanSelesai,
        kegiatanDraft,
        kegiatanDiajukan,
        kegiatanDisetujui,
        perBidang: perBidangRaw.map((b) => ({
          bidang: b.bidang,
          count: b._count.id,
          anggaran: Number(b._sum.anggaran ?? 0),
        })),
        perSumber: perSumberRaw.map((s) => ({
          sumber: s.sumberDana,
          count: s._count.id,
          anggaran: Number(s._sum.anggaran ?? 0),
        })),
        recentKegiatan,
        desa,
        tahunAktif,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
