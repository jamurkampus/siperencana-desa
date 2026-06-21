// src/app/dokumen/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatTanggal } from "@/lib/utils";
import { FileText, ExternalLink } from "lucide-react";

const jenisDokumen: Record<string, { label: string; color: string }> = {
  PROPOSAL: { label: "Proposal", color: "bg-blue-100 text-blue-700" },
  RAB: { label: "RAB", color: "bg-emerald-100 text-emerald-700" },
  KAK: { label: "KAK", color: "bg-purple-100 text-purple-700" },
  SK_PANITIA: { label: "SK Panitia", color: "bg-amber-100 text-amber-700" },
  SURAT_TUGAS: { label: "Surat Tugas", color: "bg-orange-100 text-orange-700" },
  BERITA_ACARA: { label: "Berita Acara", color: "bg-pink-100 text-pink-700" },
  LAPORAN_PELAKSANAAN: { label: "Laporan", color: "bg-teal-100 text-teal-700" },
};

export default async function DokumenPage() {
  const dokumen = await prisma.dokumen.findMany({
    include: {
      kegiatan: { select: { id: true, namaKegiatan: true, kodeKegiatan: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{dokumen.length} dokumen tersimpan</p>
      </div>

      {dokumen.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={40} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-gray-600 font-medium">Belum ada dokumen</h3>
          <p className="text-gray-400 text-sm mt-1">Buka detail kegiatan dan generate dokumen dari sana</p>
          <Link href="/kegiatan" className="btn-primary mt-4 inline-flex">Lihat Kegiatan</Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Jenis</th>
                  <th className="table-th">Nomor</th>
                  <th className="table-th">Kegiatan</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Dibuat</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dokumen.map((d) => {
                  const meta = jenisDokumen[d.jenis] ?? { label: d.jenis, color: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-td">
                        <span className={`badge ${meta.color}`}>{meta.label}</span>
                      </td>
                      <td className="table-td font-mono text-xs text-gray-500">{d.nomor ?? "-"}</td>
                      <td className="table-td max-w-xs">
                        <p className="text-sm font-medium text-gray-700 truncate">{d.kegiatan.namaKegiatan}</p>
                        {d.kegiatan.kodeKegiatan && (
                          <p className="text-xs text-gray-400 mt-0.5">{d.kegiatan.kodeKegiatan}</p>
                        )}
                      </td>
                      <td className="table-td">
                        <span className={`badge ${d.status === "FINAL" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="table-td text-gray-400 text-xs">{formatTanggal(d.createdAt)}</td>
                      <td className="table-td">
                        <Link
                          href={`/kegiatan/${d.kegiatan.id}`}
                          className="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-xs"
                        >
                          <ExternalLink size={12} /> Buka
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
