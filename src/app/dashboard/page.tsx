// src/app/dashboard/page.tsx
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatRupiah, labelBidang, labelSumberDana, colorStatus, labelStatus } from "@/lib/utils";
import Link from "next/link";
import {
  FileText, TrendingUp, CheckCircle, PlayCircle,
  PlusCircle, ArrowRight, AlertCircle, Users
} from "lucide-react";
import { getServerSession } from "next-auth";

async function getDashboardData() {
  const [
    totalKegiatan,
    kegiatanBerjalan,
    kegiatanSelesai,
    kegiatanDraft,
    aggAnggaran,
    perBidang,
    recentKegiatan,
    desa,
    tahunAktif,
    bukuTamu,
  ] = await Promise.all([
    prisma.kegiatan.count(),
    prisma.kegiatan.count({ where: { status: "BERJALAN" } }),
    prisma.kegiatan.count({ where: { status: "SELESAI" } }),
    prisma.kegiatan.count({ where: { status: "DRAFT" } }),
    prisma.kegiatan.aggregate({ _sum: { anggaran: true } }),
    prisma.kegiatan.groupBy({
      by: ["bidang"],
      _count: { id: true },
      _sum: { anggaran: true },
    }),
    prisma.kegiatan.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { tahunAnggaran: { select: { tahun: true } } },
    }),
    prisma.desa.findFirst(),
    prisma.tahunAnggaran.findFirst({ where: { isAktif: true } }),
    prisma.bukuTamu.findMany({
      take: 10,
      orderBy: { waktuMasuk: "desc" },
      include: { user: { select: { nama: true, instansi: true } } },
    }),
  ]);

  return {
    totalKegiatan, kegiatanBerjalan, kegiatanSelesai, kegiatanDraft,
    totalAnggaran: Number(aggAnggaran._sum.anggaran ?? 0),
    perBidang: perBidang.map((b) => ({
      bidang: b.bidang, count: b._count.id,
      anggaran: Number(b._sum.anggaran ?? 0),
    })),
    recentKegiatan, desa, tahunAktif, bukuTamu,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession();
  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === "ADMIN";
  const data = await getDashboardData();

  const statCards = [
    {
      label: "Total Kegiatan",
      value: data.totalKegiatan,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      change: `TA ${data.tahunAktif?.tahun ?? "-"}`,
    },
    {
      label: "Total Anggaran",
      value: formatRupiah(data.totalAnggaran),
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
      change: "Seluruh kegiatan",
    },
    {
      label: "Sedang Berjalan",
      value: data.kegiatanBerjalan,
      icon: PlayCircle,
      color: "bg-amber-50 text-amber-600",
      change: "Kegiatan aktif",
    },
    {
      label: "Selesai",
      value: data.kegiatanSelesai,
      icon: CheckCircle,
      color: "bg-purple-50 text-purple-600",
      change: "Kegiatan tuntas",
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-200 text-sm font-medium">Selamat datang,</p>
            <h2 className="text-2xl font-bold mt-1">{data.desa?.kaurPerencNama ?? "Kaur Perencanaan"}</h2>
            <p className="text-primary-200 text-sm mt-1">
              Kaur Perencanaan · Desa {data.desa?.namaDesa}, Kec. {data.desa?.kecamatan}
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-primary-300 text-xs">Tahun Anggaran Aktif</div>
            <div className="text-4xl font-bold text-white mt-1">{data.tahunAktif?.tahun ?? "-"}</div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-2 mt-5">
            <Link href="/kegiatan/tambah" className="bg-white text-primary-700 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-primary-50 transition-colors">
              <PlusCircle size={14} /> Tambah Kegiatan
            </Link>
            <Link href="/dokumen" className="bg-primary-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-primary-500 transition-colors border border-primary-500">
              <FileText size={14} /> Buat Dokumen
            </Link>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">{card.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent kegiatan */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Kegiatan Terbaru</h3>
            <Link href="/kegiatan" className="text-primary-600 text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>

          {data.recentKegiatan.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FileText size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Belum ada kegiatan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentKegiatan.map((k) => (
                <Link key={k.id} href={`/kegiatan/${k.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{k.namaKegiatan}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {labelBidang[k.bidang as keyof typeof labelBidang] ?? k.bidang} · TA {k.tahunAnggaran.tahun}
                    </p>
                  </div>
                  <span className={`badge ${colorStatus[k.status as keyof typeof colorStatus] ?? "bg-gray-100 text-gray-600"}`}>
                    {labelStatus[k.status as keyof typeof labelStatus] ?? k.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar kanan */}
        <div className="space-y-6">
          {/* Per Bidang */}
          <div className="card">
            <h3 className="section-title">Per Bidang</h3>
            {data.perBidang.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Belum ada data</p>
            ) : (
              <div className="space-y-3">
                {data.perBidang.map((b) => {
                  const pct = data.totalKegiatan > 0 ? (b.count / data.totalKegiatan) * 100 : 0;
                  return (
                    <div key={b.bidang}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium truncate pr-2">
                          {(labelBidang[b.bidang as keyof typeof labelBidang] ?? b.bidang).split(" ").slice(0, 2).join(" ")}
                        </span>
                        <span className="text-gray-400 shrink-0">{b.count}x</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isAdmin && data.kegiatanDraft > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-700">{data.kegiatanDraft} kegiatan masih draft</p>
                  <p className="text-xs text-amber-600 mt-0.5">Perlu ditinjau dan diajukan</p>
                </div>
              </div>
            )}
          </div>

          {/* Buku Tamu — hanya admin yang lihat */}
          {isAdmin && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-primary-600" />
                <h3 className="section-title mb-0">Buku Tamu</h3>
              </div>
              {data.bukuTamu.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada tamu</p>
              ) : (
                <div className="space-y-3">
                  {data.bukuTamu.map((t) => (
                    <div key={t.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                        {t.user.nama.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{t.user.nama}</p>
                        <p className="text-xs text-gray-400">{t.user.instansi ?? "-"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t.keperluan}</p>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {new Date(t.waktuMasuk).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
