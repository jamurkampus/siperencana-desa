// src/app/kegiatan/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatRupiah, labelBidang, labelSumberDana, colorStatus, labelStatus } from "@/lib/utils";
import { PlusCircle, FileText, MapPin, Wallet, Calendar } from "lucide-react";
import { KegiatanFilter } from "@/components/forms/KegiatanFilter";

export default async function KegiatanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; bidang?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  if (sp.bidang) where.bidang = sp.bidang;
  if (sp.q) {
    where.OR = [
      { namaKegiatan: { contains: sp.q, mode: "insensitive" } },
      { lokasi: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const kegiatan = await prisma.kegiatan.findMany({
    where,
    include: {
      tahunAnggaran: { select: { tahun: true } },
      jadwal: { select: { bulan: true } },
      dokumen: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalAnggaran = kegiatan.reduce((sum, k) => sum + Number(k.anggaran), 0);

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{kegiatan.length} kegiatan ditemukan · Total {formatRupiah(totalAnggaran)}</p>
        </div>
        <Link href="/kegiatan/tambah" className="btn-primary">
          <PlusCircle size={15} /> Tambah Kegiatan
        </Link>
      </div>

      {/* Filters */}
      <KegiatanFilter />

      {/* List */}
      {kegiatan.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={40} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-gray-600 font-medium">Belum ada kegiatan</h3>
          <p className="text-gray-400 text-sm mt-1">Mulai dengan menambahkan kegiatan pertama Anda</p>
          <Link href="/kegiatan/tambah" className="btn-primary mt-4 inline-flex">
            <PlusCircle size={14} /> Tambah Kegiatan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {kegiatan.map((k) => (
            <Link key={k.id} href={`/kegiatan/${k.id}`} className="card hover:shadow-md transition-shadow group cursor-pointer">
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  {k.kodeKegiatan && (
                    <span className="text-xs font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded mb-1.5 inline-block">
                      {k.kodeKegiatan}
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-primary-700 transition-colors">
                    {k.namaKegiatan}
                  </h3>
                </div>
                <span className={`badge shrink-0 ${colorStatus[k.status as keyof typeof colorStatus] ?? "bg-gray-100 text-gray-600"}`}>
                  {labelStatus[k.status as keyof typeof labelStatus] ?? k.status}
                </span>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{k.lokasi}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="shrink-0" />
                  <span>TA {k.tahunAnggaran.tahun}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Wallet size={12} className="shrink-0" />
                  <span className="font-medium text-gray-700">{formatRupiah(Number(k.anggaran))}</span>
                  <span className="text-gray-400">· {labelSumberDana[k.sumberDana as keyof typeof labelSumberDana] ?? k.sumberDana}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {labelBidang[k.bidang as keyof typeof labelBidang] ?? k.bidang}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FileText size={11} />
                  <span>{k.dokumen.length} dokumen</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
