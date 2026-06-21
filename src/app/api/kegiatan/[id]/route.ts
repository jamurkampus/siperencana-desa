// src/app/api/kegiatan/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id },
      include: {
        tahunAnggaran: true,
        desa: true,
        jadwal: { orderBy: { bulan: "asc" } },
        panitia: { orderBy: { createdAt: "asc" } },
        rab: { orderBy: { urutan: "asc" } },
        dokumen: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!kegiatan) {
      return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: kegiatan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      namaKegiatan, bidang, lokasi, volume, satuan,
      sumberDana, pelaksana, sasaran, manfaat,
      latarBelakang, tujuan, uraianKegiatan, anggaran, status,
      jadwal, panitia, rab,
    } = body;

    // Delete and recreate relations
    await prisma.$transaction([
      prisma.jadwalKegiatan.deleteMany({ where: { kegiatanId: id } }),
      prisma.panitia.deleteMany({ where: { kegiatanId: id } }),
      prisma.rabItem.deleteMany({ where: { kegiatanId: id } }),
    ]);

    const kegiatan = await prisma.kegiatan.update({
      where: { id },
      data: {
        namaKegiatan,
        bidang,
        lokasi,
        volume: parseFloat(volume),
        satuan,
        sumberDana,
        pelaksana,
        sasaran,
        manfaat,
        latarBelakang,
        tujuan,
        uraianKegiatan,
        anggaran: parseFloat(anggaran),
        ...(status && { status }),
        jadwal: jadwal?.length > 0 ? { create: jadwal } : undefined,
        panitia: panitia?.length > 0 ? { create: panitia } : undefined,
        rab: rab?.length > 0 ? {
          create: rab.map((item: { uraian: string; satuan: string; volume: number; hargaSatuan: number; keterangan?: string }, i: number) => ({
            ...item,
            volume: parseFloat(item.volume as unknown as string),
            hargaSatuan: parseFloat(item.hargaSatuan as unknown as string),
            total: parseFloat(item.volume as unknown as string) * parseFloat(item.hargaSatuan as unknown as string),
            urutan: i + 1,
          })),
        } : undefined,
      },
      include: {
        tahunAnggaran: true,
        desa: true,
        jadwal: true,
        panitia: true,
        rab: true,
      },
    });

    return NextResponse.json({ data: kegiatan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memperbarui kegiatan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.kegiatan.delete({ where: { id } });
    return NextResponse.json({ message: "Kegiatan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menghapus kegiatan" }, { status: 500 });
  }
}
