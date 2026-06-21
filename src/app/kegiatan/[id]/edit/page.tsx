// src/app/kegiatan/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { KegiatanForm } from "@/components/forms/KegiatanForm";

export default async function EditKegiatanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [kegiatan, tahunAnggaran] = await Promise.all([
    prisma.kegiatan.findUnique({
      where: { id },
      include: {
        jadwal: true,
        panitia: true,
        rab: { orderBy: { urutan: "asc" } },
      },
    }),
    prisma.tahunAnggaran.findMany({ orderBy: { tahun: "desc" } }),
  ]);

  if (!kegiatan) notFound();

  const defaultValues = {
    namaKegiatan: kegiatan.namaKegiatan,
    bidang: kegiatan.bidang,
    lokasi: kegiatan.lokasi,
    volume: kegiatan.volume,
    satuan: kegiatan.satuan,
    tahunAnggaranId: kegiatan.tahunAnggaranId,
    sumberDana: kegiatan.sumberDana,
    pelaksana: kegiatan.pelaksana,
    sasaran: kegiatan.sasaran,
    manfaat: kegiatan.manfaat,
    latarBelakang: kegiatan.latarBelakang ?? "",
    tujuan: kegiatan.tujuan ?? "",
    uraianKegiatan: kegiatan.uraianKegiatan ?? "",
    anggaran: Number(kegiatan.anggaran),
    jadwal: kegiatan.jadwal.map((j) => ({ bulan: j.bulan, keterangan: j.keterangan ?? "" })),
    panitia: kegiatan.panitia.map((p) => ({ nama: p.nama, jabatan: p.jabatan, nip: p.nip ?? "" })),
    rab: kegiatan.rab.map((r) => ({
      uraian: r.uraian,
      satuan: r.satuan,
      volume: r.volume,
      hargaSatuan: Number(r.hargaSatuan),
      keterangan: r.keterangan ?? "",
    })),
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Edit Kegiatan</h2>
        <p className="text-sm text-gray-500 mt-1">{kegiatan.namaKegiatan}</p>
      </div>
      <KegiatanForm
        tahunAnggaran={tahunAnggaran}
        defaultValues={defaultValues}
        kegiatanId={id}
      />
    </div>
  );
}
