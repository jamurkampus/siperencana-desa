// src/app/kegiatan/tambah/page.tsx
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { KegiatanForm } from "@/components/forms/KegiatanForm";

export default async function TambahKegiatanPage() {
  const tahunAnggaran = await prisma.tahunAnggaran.findMany({
    orderBy: { tahun: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Tambah Kegiatan Baru</h2>
        <p className="text-sm text-gray-500 mt-1">Isi formulir di bawah untuk menambahkan kegiatan perencanaan desa</p>
      </div>
      <KegiatanForm tahunAnggaran={tahunAnggaran} />
    </div>
  );
}
