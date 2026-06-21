"use client";
// src/components/dokumen/DokumenGenerator.tsx
import { useState } from "react";
import {
  FileText, Download, Loader2, CheckCircle, FilePlus,
  FileSpreadsheet, FileCheck, Printer
} from "lucide-react";
import { formatTanggalPendek } from "@/lib/utils";

const jenisDokumen = [
  { value: "PROPOSAL", label: "Proposal Kegiatan", icon: "📄", desc: "Dokumen usulan lengkap kegiatan" },
  { value: "RAB", label: "RAB", icon: "💰", desc: "Rencana Anggaran Biaya detail" },
  { value: "KAK", label: "Kerangka Acuan Kerja", icon: "📋", desc: "KAK / TOR pelaksanaan" },
  { value: "SK_PANITIA", label: "SK Panitia", icon: "👥", desc: "Surat Keputusan Pembentukan Panitia" },
  { value: "SURAT_TUGAS", label: "Surat Tugas", icon: "📨", desc: "Surat penugasan pelaksana" },
  { value: "BERITA_ACARA", label: "Berita Acara", icon: "📝", desc: "Berita Acara pelaksanaan kegiatan" },
  { value: "LAPORAN_PELAKSANAAN", label: "Laporan Pelaksanaan", icon: "📊", desc: "Laporan akhir kegiatan" },
];

interface Dokumen {
  id: string;
  jenis: string;
  nomor: string | null;
  status: string;
  createdAt?: Date;
}

interface Props {
  kegiatanId: string;
  existingDokumen: Dokumen[];
}

export function DokumenGenerator({ kegiatanId, existingDokumen }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [dokumen, setDokumen] = useState<Dokumen[]>(existingDokumen);
  const [exporting, setExporting] = useState<string | null>(null);

  async function generateDokumen(jenis: string) {
    setLoading(jenis);
    try {
      const nomor = generateNomor(jenis);
      const res = await fetch("/api/dokumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kegiatanId, jenis, nomor }),
      });
      const data = await res.json();
      if (res.ok) {
        setDokumen((prev) => [data.data, ...prev.filter((d) => d.jenis !== jenis)]);
      }
    } catch {
      alert("Gagal membuat dokumen");
    } finally {
      setLoading(null);
    }
  }

  async function exportDokumen(format: "pdf" | "docx" | "xlsx", jenis: string) {
    setExporting(`${jenis}-${format}`);
    try {
      if (format === "xlsx") {
        const res = await fetch("/api/dokumen/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kegiatanId, format, jenis }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${jenis}_${kegiatanId.slice(0, 8)}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // For PDF/DOCX: get data then generate client-side
        const res = await fetch("/api/dokumen/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kegiatanId, format, jenis }),
        });
        const { data } = await res.json();
        if (format === "pdf") {
          await generatePDF(data.kegiatan, jenis);
        } else {
          await generateDOCX(data.kegiatan, jenis);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Gagal export dokumen");
    } finally {
      setExporting(null);
    }
  }

  function generateNomor(jenis: string): string {
    const now = new Date();
    const map: Record<string, string> = {
      PROPOSAL: "PROP", RAB: "RAB", KAK: "KAK",
      SK_PANITIA: "SK", SURAT_TUGAS: "ST", BERITA_ACARA: "BA", LAPORAN_PELAKSANAAN: "LAP",
    };
    return `${map[jenis] ?? "DOK"}/DESA/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  }

  async function generatePDF(kegiatan: Record<string, unknown>, jenis: string) {
    const { default: jsPDF } = await import("jspdf");
    // @ts-ignore - jspdf-autotable extends jsPDF prototype at runtime
    await import("jspdf-autotable");
    const doc = new jsPDF();
    const kec = (kegiatan.desa as Record<string, string>)?.kecamatan ?? "";
    const kab = (kegiatan.desa as Record<string, string>)?.kabupaten ?? "";
    const kepDesa = (kegiatan.desa as Record<string, string>)?.kepalaDesaNama ?? "";

    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PEMERINTAH DESA " + String((kegiatan.desa as Record<string, string>)?.nama ?? "").toUpperCase(), 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Kecamatan ${kec}, ${kab}`, 105, 28, { align: "center" });
    doc.line(14, 33, 196, 33);
    doc.line(14, 35, 196, 35);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    const titleMap: Record<string, string> = {
      PROPOSAL: "PROPOSAL KEGIATAN", RAB: "RENCANA ANGGARAN BIAYA (RAB)",
      KAK: "KERANGKA ACUAN KERJA (KAK)", SK_PANITIA: "SURAT KEPUTUSAN PANITIA",
      SURAT_TUGAS: "SURAT TUGAS", BERITA_ACARA: "BERITA ACARA",
      LAPORAN_PELAKSANAAN: "LAPORAN PELAKSANAAN KEGIATAN",
    };
    doc.text(titleMap[jenis] ?? jenis, 105, 45, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(String(kegiatan.namaKegiatan ?? ""), 105, 55, { align: "center" });

    let y = 68;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Info table
    const infoRows = [
      ["Kode Kegiatan", String(kegiatan.kodeKegiatan ?? "-")],
      ["Bidang", String(kegiatan.bidang ?? "")],
      ["Lokasi", String(kegiatan.lokasi ?? "")],
      ["Volume", `${kegiatan.volume} ${kegiatan.satuan}`],
      ["Sumber Dana", String(kegiatan.sumberDana ?? "")],
      ["Tahun Anggaran", String(kegiatan.tahun ?? "")],
      ["Pelaksana", String(kegiatan.pelaksana ?? "")],
    ];

    infoRows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(": " + value, 65, y);
      y += 7;
    });

    if (jenis === "RAB" && Array.isArray(kegiatan.rab)) {
      y += 5;
      const rabRows = (kegiatan.rab as Array<{uraian: string; satuan: string; volume: number; hargaSatuan: string; total: string}>).map((r, i) => [
        i + 1, r.uraian, r.satuan,
        r.volume,
        Number(r.hargaSatuan).toLocaleString("id-ID"),
        Number(r.total).toLocaleString("id-ID"),
      ]);
      const totalRAB = (kegiatan.rab as Array<{total: string}>).reduce((s, r) => s + Number(r.total), 0);
      // @ts-ignore - jspdf-autotable extends jsPDF prototype at runtime
      doc.autoTable({
        startY: y,
        head: [["No", "Uraian", "Satuan", "Volume", "Harga Satuan", "Jumlah (Rp)"]],
        body: rabRows,
        foot: [["", "", "", "", "TOTAL", totalRAB.toLocaleString("id-ID")]],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [2, 117, 197] },
        footStyles: { fontStyle: "bold" },
      });
      // @ts-ignore - jspdf-autotable extends jsPDF prototype at runtime
      y = doc.lastAutoTable.finalY + 10;
    } else if (kegiatan.latarBelakang) {
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.text("I. LATAR BELAKANG", 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(String(kegiatan.latarBelakang ?? ""), 175);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 8;
    }

    // Signature
    const sigY = Math.max(y + 10, 240);
    doc.text(`${String((kegiatan.desa as Record<string, string>)?.nama ?? "")}, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 120, sigY);
    doc.text("Kepala Desa " + String((kegiatan.desa as Record<string, string>)?.nama ?? ""), 120, sigY + 8);
    doc.line(120, sigY + 30, 186, sigY + 30);
    doc.setFont("helvetica", "bold");
    doc.text(kepDesa, 120, sigY + 36);
    doc.setFont("helvetica", "normal");

    doc.save(`${titleMap[jenis] ?? jenis}_${String(kegiatan.namaKegiatan ?? "").slice(0, 20)}.pdf`);
  }

  async function generateDOCX(kegiatan: Record<string, unknown>, jenis: string) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, HeadingLevel } = await import("docx");
    const kepDesa = (kegiatan.desa as Record<string, string>)?.kepalaDesaNama ?? "";
    const namaDesa = (kegiatan.desa as Record<string, string>)?.nama ?? "";

    const titleMap: Record<string, string> = {
      PROPOSAL: "PROPOSAL KEGIATAN", RAB: "RENCANA ANGGARAN BIAYA (RAB)",
      KAK: "KERANGKA ACUAN KERJA (KAK)", SK_PANITIA: "SURAT KEPUTUSAN PANITIA",
    };

    const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
      new Paragraph({
        text: "PEMERINTAH DESA " + namaDesa.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: titleMap[jenis] ?? jenis,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(kegiatan.namaKegiatan ?? ""), bold: true })] }),
      new Paragraph({ text: "" }),
    ];

    const infoRows = [
      ["Kode Kegiatan", String(kegiatan.kodeKegiatan ?? "-")],
      ["Lokasi", String(kegiatan.lokasi ?? "")],
      ["Volume", `${kegiatan.volume} ${kegiatan.satuan}`],
      ["Pelaksana", String(kegiatan.pelaksana ?? "")],
      ["Sumber Dana", String(kegiatan.sumberDana ?? "")],
    ];

    const infoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: infoRows.map(([label, value]) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ text: ": " + value })] }),
          ],
        })
      ),
    });

    children.push(infoTable);
    children.push(new Paragraph({ text: "" }));

    if (kegiatan.latarBelakang) {
      children.push(new Paragraph({ text: "I. LATAR BELAKANG", heading: HeadingLevel.HEADING_3 }));
      children.push(new Paragraph({ text: String(kegiatan.latarBelakang) }));
    }
    if (kegiatan.tujuan) {
      children.push(new Paragraph({ text: "II. TUJUAN", heading: HeadingLevel.HEADING_3 }));
      children.push(new Paragraph({ text: String(kegiatan.tujuan) }));
    }

    // Signature
    children.push(new Paragraph({ text: "" }));
    children.push(new Paragraph({ text: `${namaDesa}, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, alignment: AlignmentType.RIGHT }));
    children.push(new Paragraph({ text: "Kepala Desa " + namaDesa, alignment: AlignmentType.RIGHT }));
    children.push(new Paragraph({ text: "" }));
    children.push(new Paragraph({ text: "" }));
    children.push(new Paragraph({ text: "" }));
    children.push(new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: kepDesa, bold: true })] }));

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titleMap[jenis] ?? jenis}_${String(kegiatan.namaKegiatan ?? "").slice(0, 20)}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <FileText size={18} className="text-primary-600" />
        <h3 className="section-title mb-0">Generator Dokumen</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {jenisDokumen.map((jenis) => {
          const existing = dokumen.find((d) => d.jenis === jenis.value);
          const isGenerating = loading === jenis.value;

          return (
            <div key={jenis.value} className={`border rounded-xl p-4 transition-all ${existing ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{jenis.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{jenis.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{jenis.desc}</p>
                  </div>
                </div>
                {existing && <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />}
              </div>

              {existing ? (
                <div>
                  <p className="text-xs text-gray-400 mb-2">
                    Dibuat · {existing.nomor ?? "-"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => exportDokumen("pdf", jenis.value)}
                      disabled={!!exporting}
                      className="flex items-center gap-1.5 text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
                    >
                      {exporting === `${jenis.value}-pdf` ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                      PDF
                    </button>
                    <button
                      onClick={() => exportDokumen("docx", jenis.value)}
                      disabled={!!exporting}
                      className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      {exporting === `${jenis.value}-docx` ? <Loader2 size={11} className="animate-spin" /> : <FileCheck size={11} />}
                      DOCX
                    </button>
                    {(jenis.value === "RAB" || jenis.value === "LAPORAN_PELAKSANAAN") && (
                      <button
                        onClick={() => exportDokumen("xlsx", jenis.value)}
                        disabled={!!exporting}
                        className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        {exporting === `${jenis.value}-xlsx` ? <Loader2 size={11} className="animate-spin" /> : <FileSpreadsheet size={11} />}
                        XLSX
                      </button>
                    )}
                    <button
                      onClick={() => generateDokumen(jenis.value)}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <Printer size={11} /> Buat Ulang
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => generateDokumen(jenis.value)}
                  disabled={isGenerating}
                  className="w-full btn-secondary justify-center text-xs py-2"
                >
                  {isGenerating ? (
                    <><Loader2 size={13} className="animate-spin" /> Membuat dokumen...</>
                  ) : (
                    <><FilePlus size={13} /> Buat Dokumen</>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
