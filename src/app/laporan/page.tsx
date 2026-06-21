// src/app/laporan/page.tsx
import { prisma } from "@/lib/prisma";
import { formatRupiah, labelBidang, labelSumberDana, labelStatus, colorStatus } from "@/lib/utils";
import Link from "next/link";

export default async function LaporanPage() {
  const [kegiatan, perBidang, perSumber, perStatus, totalAgg] = await Promise.all([
    prisma.kegiatan.findMany({
      include: { tahunAnggaran: { select: { tahun: true } } },
      orderBy: { bidang: "asc" },
    }),
    prisma.kegiatan.groupBy({
      by: ["bidang"],
      _count: { id: true },
      _sum: { anggaran: true },
    }),
    prisma.kegiatan.groupBy({
      by: ["sumberDana"],
      _count: { id: true },
      _sum: { anggaran: true },
    }),
    prisma.kegiatan.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { anggaran: true },
    }),
    prisma.kegiatan.aggregate({ _sum: { anggaran: true }, _count: true }),
  ]);

  const total = Number(totalAgg._sum.anggaran ?? 0);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Kegiatan", value: totalAgg._count, sub: "kegiatan" },
          { label: "Total Anggaran", value: formatRupiah(total), sub: "seluruh kegiatan" },
          { label: "Bidang Aktif", value: perBidang.length, sub: "bidang" },
          { label: "Sumber Dana", value: perSumber.length, sub: "sumber" },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Bidang */}
        <div className="card">
          <h3 className="section-title">Rekapitulasi Per Bidang</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-th">Bidang</th>
                  <th className="table-th text-right">Jml</th>
                  <th className="table-th text-right">Anggaran</th>
                  <th className="table-th text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {perBidang.map((b) => (
                  <tr key={b.bidang} className="hover:bg-gray-50">
                    <td className="table-td text-xs">{labelBidang[b.bidang as keyof typeof labelBidang] ?? b.bidang}</td>
                    <td className="table-td text-right">{b._count.id}</td>
                    <td className="table-td text-right font-medium">{formatRupiah(Number(b._sum.anggaran ?? 0))}</td>
                    <td className="table-td text-right text-gray-400">
                      {total > 0 ? ((Number(b._sum.anggaran ?? 0) / total) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per Status */}
        <div className="card">
          <h3 className="section-title">Rekapitulasi Per Status</h3>
          <div className="space-y-3">
            {perStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`badge ${colorStatus[s.status as keyof typeof colorStatus] ?? "bg-gray-100"}`}>
                    {labelStatus[s.status as keyof typeof labelStatus] ?? s.status}
                  </span>
                  <span className="text-sm text-gray-500">{s._count.id} kegiatan</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {formatRupiah(Number(s._sum.anggaran ?? 0))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per Sumber Dana */}
      <div className="card">
        <h3 className="section-title">Rekapitulasi Per Sumber Dana</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-th">Sumber Dana</th>
                <th className="table-th text-right">Jumlah Kegiatan</th>
                <th className="table-th text-right">Total Anggaran</th>
                <th className="table-th text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {perSumber.map((s) => (
                <tr key={s.sumberDana} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{labelSumberDana[s.sumberDana as keyof typeof labelSumberDana] ?? s.sumberDana}</td>
                  <td className="table-td text-right">{s._count.id}</td>
                  <td className="table-td text-right font-semibold text-primary-700">{formatRupiah(Number(s._sum.anggaran ?? 0))}</td>
                  <td className="table-td text-right text-gray-400">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${total > 0 ? (Number(s._sum.anggaran ?? 0) / total) * 100 : 0}%` }}
                        />
                      </div>
                      <span>{total > 0 ? ((Number(s._sum.anggaran ?? 0) / total) * 100).toFixed(1) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All kegiatan table */}
      <div className="card">
        <h3 className="section-title">Daftar Lengkap Kegiatan</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-th">Kode</th>
                <th className="table-th">Nama Kegiatan</th>
                <th className="table-th">Bidang</th>
                <th className="table-th">TA</th>
                <th className="table-th text-right">Anggaran</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {kegiatan.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono text-xs text-gray-400">{k.kodeKegiatan ?? "-"}</td>
                  <td className="table-td">
                    <Link href={`/kegiatan/${k.id}`} className="font-medium text-primary-700 hover:underline">
                      {k.namaKegiatan}
                    </Link>
                  </td>
                  <td className="table-td text-xs text-gray-500">{(labelBidang[k.bidang as keyof typeof labelBidang] ?? k.bidang).split(" ").slice(0, 2).join(" ")}</td>
                  <td className="table-td">{k.tahunAnggaran.tahun}</td>
                  <td className="table-td text-right font-semibold">{formatRupiah(Number(k.anggaran))}</td>
                  <td className="table-td">
                    <span className={`badge ${colorStatus[k.status as keyof typeof colorStatus]}`}>
                      {labelStatus[k.status as keyof typeof labelStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
