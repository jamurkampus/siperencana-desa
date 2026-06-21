// src/app/api/dokumen/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { kegiatanId, jenis, nomor } = await req.json();

    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
      include: {
        desa: true,
        tahunAnggaran: true,
        jadwal: { orderBy: { bulan: "asc" } },
        panitia: true,
        rab: { orderBy: { urutan: "asc" } },
      },
    });

    if (!kegiatan) {
      return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
    }

    // Generate document content based on type
    const konten = generateKonten(jenis, kegiatan);
    const judul = getLabelJenis(jenis) + " - " + kegiatan.namaKegiatan;

    const dokumen = await prisma.dokumen.create({
      data: {
        kegiatanId,
        jenis,
        nomor,
        judul,
        konten,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ data: dokumen }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal membuat dokumen" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kegiatanId = searchParams.get("kegiatanId");

  const dokumen = await prisma.dokumen.findMany({
    where: kegiatanId ? { kegiatanId } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: dokumen });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateKonten(jenis: string, kegiatan: any) {
  const base = {
    namaKegiatan: kegiatan.namaKegiatan,
    kodeKegiatan: kegiatan.kodeKegiatan,
    lokasi: kegiatan.lokasi,
    volume: kegiatan.volume,
    satuan: kegiatan.satuan,
    sumberDana: kegiatan.sumberDana,
    pelaksana: kegiatan.pelaksana,
    sasaran: kegiatan.sasaran,
    manfaat: kegiatan.manfaat,
    latarBelakang: kegiatan.latarBelakang,
    tujuan: kegiatan.tujuan,
    uraianKegiatan: kegiatan.uraianKegiatan,
    anggaran: kegiatan.anggaran.toString(),
    tahun: kegiatan.tahunAnggaran.tahun,
    desa: {
      nama: kegiatan.desa.namaDesa,
      kecamatan: kegiatan.desa.kecamatan,
      kabupaten: kegiatan.desa.kabupaten,
      provinsi: kegiatan.desa.provinsi,
      kepalaDesaNama: kegiatan.desa.kepalaDesaNama,
      kaurPerencNama: kegiatan.desa.kaurPerencNama,
    },
    jadwal: kegiatan.jadwal,
    panitia: kegiatan.panitia,
    rab: kegiatan.rab.map((r: { uraian: string; satuan: string; volume: number; hargaSatuan: { toString: () => string }; total: { toString: () => string }; keterangan: string | null }) => ({
      ...r,
      hargaSatuan: r.hargaSatuan.toString(),
      total: r.total.toString(),
    })),
  };

  return base;
}

function getLabelJenis(jenis: string): string {
  const map: Record<string, string> = {
    PROPOSAL: "Proposal Kegiatan",
    RAB: "Rencana Anggaran Biaya",
    KAK: "Kerangka Acuan Kerja",
    SK_PANITIA: "SK Panitia",
    SURAT_TUGAS: "Surat Tugas",
    BERITA_ACARA: "Berita Acara",
    LAPORAN_PELAKSANAAN: "Laporan Pelaksanaan",
  };
  return map[jenis] ?? jenis;
}
