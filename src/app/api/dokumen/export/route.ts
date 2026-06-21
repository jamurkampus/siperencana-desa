// src/app/api/dokumen/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  formatRupiah, terbilangRupiah, formatTanggal,
  getBulanNama, labelBidang, labelSumberDana,
} from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { kegiatanId, format, jenis } = await req.json();

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

    if (format === "xlsx") {
      return exportXlsx(kegiatan, jenis);
    }

    // For PDF and DOCX, return structured data for client-side generation
    return NextResponse.json({
      data: {
        kegiatan: {
          ...kegiatan,
          anggaran: kegiatan.anggaran.toString(),
          rab: kegiatan.rab.map((r) => ({
            ...r,
            hargaSatuan: r.hargaSatuan.toString(),
            total: r.total.toString(),
          })),
        },
        format,
        jenis,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal export dokumen" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportXlsx(kegiatan: any, jenis: string) {
  // Dynamic import ExcelJS
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "SiPerenDesa";

  if (jenis === "RAB") {
    const ws = wb.addWorksheet("RAB");

    // Header
    ws.mergeCells("A1:H1");
    ws.getCell("A1").value = "RENCANA ANGGARAN BIAYA (RAB)";
    ws.getCell("A1").font = { bold: true, size: 14 };
    ws.getCell("A1").alignment = { horizontal: "center" };

    ws.mergeCells("A2:H2");
    ws.getCell("A2").value = kegiatan.namaKegiatan.toUpperCase();
    ws.getCell("A2").font = { bold: true, size: 12 };
    ws.getCell("A2").alignment = { horizontal: "center" };

    ws.mergeCells("A3:H3");
    ws.getCell("A3").value = `Desa ${kegiatan.desa.namaDesa}, Kecamatan ${kegiatan.desa.kecamatan}, ${kegiatan.desa.kabupaten}`;
    ws.getCell("A3").alignment = { horizontal: "center" };

    ws.addRow([]);

    // Info kegiatan
    const infoRows = [
      ["Kode Kegiatan", ":", kegiatan.kodeKegiatan ?? "-"],
      ["Bidang", ":", labelBidang[kegiatan.bidang] ?? kegiatan.bidang],
      ["Lokasi", ":", kegiatan.lokasi],
      ["Volume", ":", `${kegiatan.volume} ${kegiatan.satuan}`],
      ["Sumber Dana", ":", labelSumberDana[kegiatan.sumberDana] ?? kegiatan.sumberDana],
      ["Tahun Anggaran", ":", kegiatan.tahunAnggaran.tahun.toString()],
    ];
    infoRows.forEach(([k, sep, v]) => {
      const row = ws.addRow([k, sep, v]);
      row.getCell(1).font = { bold: true };
    });

    ws.addRow([]);

    // Table header
    const headerRow = ws.addRow(["No", "Uraian", "Satuan", "Volume", "Harga Satuan (Rp)", "Jumlah (Rp)", "Keterangan"]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0275C5" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" },
      };
    });

    // Data rows
    let totalAnggaran = 0;
    kegiatan.rab.forEach((item: { uraian: string; satuan: string; volume: number; hargaSatuan: string; total: string; keterangan: string | null }, i: number) => {
      const total = parseFloat(item.total);
      totalAnggaran += total;
      const row = ws.addRow([
        i + 1, item.uraian, item.satuan,
        item.volume,
        parseFloat(item.hargaSatuan),
        total,
        item.keterangan ?? "",
      ]);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" }, bottom: { style: "thin" },
          left: { style: "thin" }, right: { style: "thin" },
        };
      });
      row.getCell(5).numFmt = '#,##0';
      row.getCell(6).numFmt = '#,##0';
    });

    // Total row
    const totalRow = ws.addRow(["", "JUMLAH TOTAL", "", "", "", totalAnggaran, ""]);
    totalRow.eachCell((cell, i) => {
      if (i > 0) cell.font = { bold: true };
      cell.border = { top: { style: "thin" }, bottom: { style: "double" }, left: { style: "thin" }, right: { style: "thin" } };
    });
    totalRow.getCell(6).numFmt = '#,##0';

    // Terbilang
    ws.addRow([]);
    ws.addRow(["Terbilang:", "", `(${terbilangRupiah(totalAnggaran)})`]);

    // Column widths
    ws.getColumn(1).width = 5;
    ws.getColumn(2).width = 40;
    ws.getColumn(3).width = 12;
    ws.getColumn(4).width = 10;
    ws.getColumn(5).width = 20;
    ws.getColumn(6).width = 20;
    ws.getColumn(7).width = 20;

  } else {
    // Summary sheet
    const ws = wb.addWorksheet("Kegiatan");
    ws.addRow(["DATA KEGIATAN"]);
    ws.addRow(["Nama Kegiatan", kegiatan.namaKegiatan]);
    ws.addRow(["Kode", kegiatan.kodeKegiatan ?? "-"]);
    ws.addRow(["Bidang", labelBidang[kegiatan.bidang] ?? kegiatan.bidang]);
    ws.addRow(["Lokasi", kegiatan.lokasi]);
    ws.addRow(["Volume", `${kegiatan.volume} ${kegiatan.satuan}`]);
    ws.addRow(["Sumber Dana", labelSumberDana[kegiatan.sumberDana] ?? kegiatan.sumberDana]);
    ws.addRow(["Pelaksana", kegiatan.pelaksana]);
    ws.addRow(["Anggaran", formatRupiah(parseFloat(kegiatan.anggaran))]);
    ws.addRow(["Status", kegiatan.status]);
    ws.addRow(["Tahun", kegiatan.tahunAnggaran.tahun]);
    ws.getColumn(1).width = 20;
    ws.getColumn(2).width = 50;
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="RAB_${kegiatan.namaKegiatan.slice(0, 30)}.xlsx"`,
    },
  });
}

// Suppress unused import warning
const _unused = { formatTanggal, getBulanNama };
void _unused;
