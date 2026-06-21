// src/app/kegiatan/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  formatRupiah, formatTanggal, labelBidang, labelSumberDana,
  colorStatus, labelStatus, getBulanNama,
} from "@/lib/utils";
import {
  Edit3, FileText, MapPin, Calendar, Wallet,
  Users, ArrowLeft, Download, FileCheck, Package
} from "lucide-react";
import { DokumenGenerator } from "@/components/dokumen/DokumenGenerator";

export default async function KegiatanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id },
    include: {
      desa: true,
      tahunAnggaran: true,
      jadwal: { orderBy: { bulan: "asc" } },
      panitia: true,
      rab: { orderBy: { urutan: "asc" } },
      dokumen: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!kegiatan) notFound();

  const totalRAB = kegiatan.rab.reduce((s, r) => s + Number(r.total), 0);
  const namaBulan = kegiatan.jadwal.map((j) => getBulanNama(j.bulan)).join(", ");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/kegiatan" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg mt-0.5">
            <ArrowLeft size={18} />
          </Link>
          <div>
            {kegiatan.kodeKegiatan && (
              <span className="text-xs font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded mb-2 inline-block">
                {kegiatan.kodeKegiatan}
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-800">{kegiatan.namaKegiatan}</h2>
            <p className="text-sm text-gray-500 mt-1">
              TA {kegiatan.tahunAnggaran.tahun} · Desa {kegiatan.desa.namaDesa}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`badge text-sm ${colorStatus[kegiatan.status as keyof typeof colorStatus]}`}>
            {labelStatus[kegiatan.status as keyof typeof labelStatus]}
          </span>
          <Link href={`/kegiatan/${id}/edit`} className="btn-secondary hidden md:flex">
            <Edit3 size={14} /> Edit
          </Link>
        </div>
      </div>

      {/* Info cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: MapPin, label: "Lokasi", value: kegiatan.lokasi, color: "text-blue-600 bg-blue-50" },
          { icon: Package, label: "Volume", value: `${kegiatan.volume} ${kegiatan.satuan}`, color: "text-emerald-600 bg-emerald-50" },
          { icon: Wallet, label: "Anggaran", value: formatRupiah(Number(kegiatan.anggaran)), color: "text-amber-600 bg-amber-50" },
          { icon: Calendar, label: "Jadwal", value: namaBulan || "-", color: "text-purple-600 bg-purple-50" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} mb-2`}>
                <Icon size={15} />
              </div>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 leading-tight">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Detail info */}
      <div className="card">
        <h3 className="section-title">Informasi Kegiatan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {[
            { label: "Bidang", value: labelBidang[kegiatan.bidang as keyof typeof labelBidang] ?? kegiatan.bidang },
            { label: "Sumber Dana", value: labelSumberDana[kegiatan.sumberDana as keyof typeof labelSumberDana] ?? kegiatan.sumberDana },
            { label: "Pelaksana", value: kegiatan.pelaksana },
            { label: "Dibuat", value: formatTanggal(kegiatan.createdAt) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-gray-400 text-xs mb-0.5">{label}</p>
              <p className="text-gray-800 font-medium">{value}</p>
            </div>
          ))}
          <div className="md:col-span-2">
            <p className="text-gray-400 text-xs mb-0.5">Sasaran</p>
            <p className="text-gray-700">{kegiatan.sasaran}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-400 text-xs mb-0.5">Manfaat</p>
            <p className="text-gray-700">{kegiatan.manfaat}</p>
          </div>
          {kegiatan.latarBelakang && (
            <div className="md:col-span-2">
              <p className="text-gray-400 text-xs mb-0.5">Latar Belakang</p>
              <p className="text-gray-700 whitespace-pre-line">{kegiatan.latarBelakang}</p>
            </div>
          )}
          {kegiatan.tujuan && (
            <div className="md:col-span-2">
              <p className="text-gray-400 text-xs mb-0.5">Tujuan</p>
              <p className="text-gray-700 whitespace-pre-line">{kegiatan.tujuan}</p>
            </div>
          )}
        </div>
      </div>

      {/* RAB */}
      {kegiatan.rab.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Rencana Anggaran Biaya (RAB)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-th">No</th>
                  <th className="table-th">Uraian</th>
                  <th className="table-th">Satuan</th>
                  <th className="table-th text-right">Volume</th>
                  <th className="table-th text-right">Harga Satuan</th>
                  <th className="table-th text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {kegiatan.rab.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="table-td text-gray-400">{i + 1}</td>
                    <td className="table-td font-medium">{r.uraian}</td>
                    <td className="table-td text-gray-500">{r.satuan}</td>
                    <td className="table-td text-right">{r.volume}</td>
                    <td className="table-td text-right">{formatRupiah(Number(r.hargaSatuan))}</td>
                    <td className="table-td text-right font-semibold text-primary-700">{formatRupiah(Number(r.total))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-primary-50 font-bold">
                  <td colSpan={5} className="table-td text-right text-gray-700">TOTAL</td>
                  <td className="table-td text-right text-primary-700 text-base">{formatRupiah(totalRAB)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Panitia */}
      {kegiatan.panitia.length > 0 && (
        <div className="card">
          <h3 className="section-title">Susunan Panitia / TPK</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kegiatan.panitia.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                  {p.nama.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.nama}</p>
                  <p className="text-xs text-gray-500">{p.jabatan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dokumen Generator */}
      <DokumenGenerator kegiatanId={id} existingDokumen={kegiatan.dokumen} />
    </div>
  );
}
