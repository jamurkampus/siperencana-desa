// src/app/api/kegiatan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const bidang = searchParams.get("bidang");
    const tahun = searchParams.get("tahun");
    const q = searchParams.get("q");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (bidang) where.bidang = bidang;
    if (tahun) {
      where.tahunAnggaran = { tahun: parseInt(tahun) };
    }
    if (q) {
      where.OR = [
        { namaKegiatan: { contains: q, mode: "insensitive" } },
        { lokasi: { contains: q, mode: "insensitive" } },
      ];
    }

    const kegiatan = await prisma.kegiatan.findMany({
      where,
      include: {
        tahunAnggaran: { select: { tahun: true } },
        desa: { select: { namaDesa: true } },
        jadwal: true,
        dokumen: { select: { id: true, jenis: true, status: true } },
        _count: { select: { panitia: true, rab: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: kegiatan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data kegiatan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      namaKegiatan, bidang, lokasi, volume, satuan,
      tahunAnggaranId, sumberDana, pelaksana, sasaran,
      manfaat, latarBelakang, tujuan, uraianKegiatan,
      anggaran, jadwal, panitia, rab,
    } = body;

    // Get desa (single desa mode)
    const desa = await prisma.desa.findFirst();
    if (!desa) {
      return NextResponse.json({ error: "Data desa belum dikonfigurasi" }, { status: 400 });
    }

    // Generate kode kegiatan
    const tahun = await prisma.tahunAnggaran.findUnique({ where: { id: tahunAnggaranId } });
    const count = await prisma.kegiatan.count({ where: { tahunAnggaranId } });
    const kodeKegiatan = `${tahun?.tahun}.${getBidangKode(bidang)}.${String(count + 1).padStart(3, "0")}`;

    const kegiatan = await prisma.kegiatan.create({
      data: {
        kodeKegiatan,
        namaKegiatan,
        bidang,
        lokasi,
        volume: parseFloat(volume),
        satuan,
        tahunAnggaranId,
        sumberDana,
        pelaksana,
        sasaran,
        manfaat,
        latarBelakang,
        tujuan,
        uraianKegiatan,
        anggaran: parseFloat(anggaran),
        desaId: desa.id,
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

    return NextResponse.json({ data: kegiatan }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan kegiatan" }, { status: 500 });
  }
}

function getBidangKode(bidang: string): string {
  const map: Record<string, string> = {
    PENYELENGGARAAN_PEMERINTAHAN: "01",
    PEMBANGUNAN_DESA: "02",
    PEMBERDAYAAN_MASYARAKAT: "03",
    PEMBINAAN_KEMASYARAKATAN: "04",
    PENANGGULANGAN_BENCANA: "05",
    KEADAAN_DARURAT: "06",
    MENDESAK: "07",
  };
  return map[bidang] ?? "00";
}
