"use client";
// src/components/forms/KegiatanForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Sparkles, Plus, Trash2, Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { FormKegiatanData } from "@/types";

const bidangOptions = [
  { value: "PENYELENGGARAAN_PEMERINTAHAN", label: "Penyelenggaraan Pemerintahan Desa" },
  { value: "PEMBANGUNAN_DESA", label: "Pembangunan Desa" },
  { value: "PEMBERDAYAAN_MASYARAKAT", label: "Pemberdayaan Masyarakat" },
  { value: "PEMBINAAN_KEMASYARAKATAN", label: "Pembinaan Kemasyarakatan" },
  { value: "PENANGGULANGAN_BENCANA", label: "Penanggulangan Bencana" },
  { value: "KEADAAN_DARURAT", label: "Keadaan Darurat" },
  { value: "MENDESAK", label: "Mendesak" },
];

const sumberDanaOptions = [
  { value: "DD", label: "Dana Desa (APBN)" },
  { value: "ADD", label: "Alokasi Dana Desa (ADD)" },
  { value: "PAD", label: "Pendapatan Asli Desa" },
  { value: "APBD_KAB", label: "APBD Kabupaten" },
  { value: "APBD_PROV", label: "APBD Provinsi" },
  { value: "BANTUAN_PROVINSI", label: "Bantuan Provinsi" },
  { value: "BANTUAN_KABUPATEN", label: "Bantuan Kabupaten" },
  { value: "LAINNYA", label: "Lainnya" },
];

const namaBulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

interface Props {
  tahunAnggaran: { id: string; tahun: number; isAktif: boolean }[];
  defaultValues?: Partial<FormKegiatanData>;
  kegiatanId?: string;
}

export function KegiatanForm({ tahunAnggaran, defaultValues, kegiatanId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    jadwal: true, panitia: false, rab: true,
  });

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormKegiatanData>({
    defaultValues: defaultValues ?? {
      jadwal: [],
      panitia: [{ nama: "", jabatan: "Ketua TPK" }],
      rab: [{ uraian: "", satuan: "", volume: 1, hargaSatuan: 0 }],
      tahunAnggaranId: tahunAnggaran.find((t) => t.isAktif)?.id ?? tahunAnggaran[0]?.id,
    },
  });

  const jadwalField = useFieldArray({ control, name: "jadwal" });
  const panitiaField = useFieldArray({ control, name: "panitia" });
  const rabField = useFieldArray({ control, name: "rab" });

  const watchRab = watch("rab");
  const totalRAB = watchRab?.reduce((s, r) => s + (Number(r.volume) * Number(r.hargaSatuan)), 0) ?? 0;

  const watchedFields = watch(["namaKegiatan", "bidang", "lokasi", "volume", "satuan", "pelaksana", "sasaran", "anggaran"]);

  async function callAI(tipe: string) {
    const [namaKegiatan, bidang, lokasi, volume, satuan, pelaksana, sasaran, anggaran] = watchedFields;
    if (!namaKegiatan) {
      alert("Isi nama kegiatan terlebih dahulu");
      return;
    }
    setAiLoading(tipe);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipe,
          konteks: { namaKegiatan, bidang, lokasi, volume, satuan, pelaksana, sasaran, anggaran: String(anggaran) },
        }),
      });
      const data = await res.json();
      if (data.result) {
        const fieldMap: Record<string, keyof FormKegiatanData> = {
          latar_belakang: "latarBelakang",
          tujuan: "tujuan",
          manfaat: "manfaat",
          uraian: "uraianKegiatan",
        };
        if (fieldMap[tipe]) {
          setValue(fieldMap[tipe], data.result);
        }
      }
    } catch {
      alert("Gagal menghubungi AI Assistant");
    } finally {
      setAiLoading(null);
    }
  }

  async function onSubmit(data: FormKegiatanData) {
    setSaving(true);
    try {
      const url = kegiatanId ? `/api/kegiatan/${kegiatanId}` : "/api/kegiatan";
      const method = kegiatanId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, anggaran: totalRAB || data.anggaran }),
      });
      const result = await res.json();
      if (res.ok) {
        router.push(`/kegiatan/${result.data.id}`);
      } else {
        alert(result.error ?? "Gagal menyimpan");
      }
    } finally {
      setSaving(false);
    }
  }

  function toggleSection(s: keyof typeof expandedSections) {
    setExpandedSections((p) => ({ ...p, [s]: !p[s] }));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Informasi Dasar ── */}
      <div className="card space-y-5">
        <h3 className="section-title border-b border-gray-100 pb-3">📋 Informasi Dasar Kegiatan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="label">Nama Kegiatan <span className="text-rose-500">*</span></label>
            <input
              {...register("namaKegiatan", { required: "Wajib diisi" })}
              className="input-field"
              placeholder="Contoh: Pembangunan Jalan Rabat Beton RT 01"
            />
            {errors.namaKegiatan && <p className="text-rose-500 text-xs mt-1">{errors.namaKegiatan.message}</p>}
          </div>

          <div>
            <label className="label">Bidang Kegiatan <span className="text-rose-500">*</span></label>
            <select {...register("bidang", { required: true })} className="input-field">
              <option value="">-- Pilih Bidang --</option>
              {bidangOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Tahun Anggaran <span className="text-rose-500">*</span></label>
            <select {...register("tahunAnggaranId", { required: true })} className="input-field">
              {tahunAnggaran.map((t) => (
                <option key={t.id} value={t.id}>{t.tahun} {t.isAktif ? "(Aktif)" : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Lokasi <span className="text-rose-500">*</span></label>
            <input {...register("lokasi", { required: true })} className="input-field" placeholder="Contoh: RT 01 Dusun Maju" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Volume <span className="text-rose-500">*</span></label>
              <input {...register("volume", { required: true })} type="number" step="any" className="input-field" placeholder="200" />
            </div>
            <div>
              <label className="label">Satuan <span className="text-rose-500">*</span></label>
              <input {...register("satuan", { required: true })} className="input-field" placeholder="Meter / Unit / Peserta" />
            </div>
          </div>

          <div>
            <label className="label">Sumber Dana <span className="text-rose-500">*</span></label>
            <select {...register("sumberDana", { required: true })} className="input-field">
              <option value="">-- Pilih Sumber Dana --</option>
              {sumberDanaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Pelaksana <span className="text-rose-500">*</span></label>
            <input {...register("pelaksana", { required: true })} className="input-field" placeholder="Contoh: TPK Desa / PKK Desa" />
          </div>

          <div className="md:col-span-2">
            <label className="label">Sasaran Kegiatan <span className="text-rose-500">*</span></label>
            <textarea {...register("sasaran", { required: true })} rows={2} className="input-field" placeholder="Siapa yang menjadi sasaran kegiatan ini?" />
          </div>

          <div className="md:col-span-2">
            <label className="label">Manfaat Kegiatan <span className="text-rose-500">*</span></label>
            <div className="relative">
              <textarea {...register("manfaat", { required: true })} rows={3} className="input-field pr-28" placeholder="Manfaat yang diharapkan dari kegiatan ini" />
              <button
                type="button"
                onClick={() => callAI("manfaat")}
                disabled={!!aiLoading}
                className="absolute right-2 top-2 bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-md flex items-center gap-1 hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                {aiLoading === "manfaat" ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                AI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI-Assisted Fields ── */}
      <div className="card space-y-5">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Sparkles size={16} className="text-purple-600" />
          <h3 className="section-title mb-0">Uraian Lengkap (Dibantu AI)</h3>
        </div>

        {[
          { field: "latarBelakang", label: "Latar Belakang", tipe: "latar_belakang", ph: "Kondisi dan permasalahan yang melatarbelakangi kegiatan ini..." },
          { field: "tujuan", label: "Tujuan Kegiatan", tipe: "tujuan", ph: "Tujuan spesifik yang ingin dicapai..." },
          { field: "uraianKegiatan", label: "Uraian Kegiatan", tipe: "uraian", ph: "Deskripsi lengkap pelaksanaan kegiatan..." },
        ].map(({ field, label, tipe, ph }) => (
          <div key={field}>
            <label className="label">{label}</label>
            <div className="relative">
              <textarea
                {...register(field as keyof FormKegiatanData)}
                rows={4}
                className="input-field pr-28"
                placeholder={ph}
              />
              <button
                type="button"
                onClick={() => callAI(tipe)}
                disabled={!!aiLoading}
                className="absolute right-2 top-2 bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-md flex items-center gap-1 hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                {aiLoading === tipe ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                {aiLoading === tipe ? "Membuat..." : "Buat AI"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── RAB ── */}
      <div className="card">
        <button type="button" onClick={() => toggleSection("rab")} className="flex items-center justify-between w-full mb-4">
          <h3 className="section-title mb-0">💰 Rencana Anggaran Biaya (RAB)</h3>
          {expandedSections.rab ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expandedSections.rab && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 rounded-lg">
                    <th className="table-th">Uraian</th>
                    <th className="table-th">Satuan</th>
                    <th className="table-th">Vol</th>
                    <th className="table-th">Harga Sat.</th>
                    <th className="table-th">Total</th>
                    <th className="table-th w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rabField.fields.map((field, i) => {
                    const vol = Number(watch(`rab.${i}.volume`) ?? 0);
                    const hs = Number(watch(`rab.${i}.hargaSatuan`) ?? 0);
                    const total = vol * hs;
                    return (
                      <tr key={field.id}>
                        <td className="table-td">
                          <input {...register(`rab.${i}.uraian`)} className="input-field py-1.5" placeholder="Nama bahan/jasa" />
                        </td>
                        <td className="table-td">
                          <input {...register(`rab.${i}.satuan`)} className="input-field py-1.5 w-20" placeholder="Unit" />
                        </td>
                        <td className="table-td">
                          <input {...register(`rab.${i}.volume`)} type="number" step="any" className="input-field py-1.5 w-20" />
                        </td>
                        <td className="table-td">
                          <input {...register(`rab.${i}.hargaSatuan`)} type="number" className="input-field py-1.5 w-32" />
                        </td>
                        <td className="table-td text-right font-medium text-gray-700 whitespace-nowrap">
                          {formatRupiah(total)}
                        </td>
                        <td className="table-td">
                          <button type="button" onClick={() => rabField.remove(i)} className="text-rose-400 hover:text-rose-600 p-1">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-primary-50">
                    <td colSpan={4} className="table-td font-semibold text-right text-gray-700">TOTAL ANGGARAN</td>
                    <td className="table-td font-bold text-primary-700 text-right">{formatRupiah(totalRAB)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button
              type="button"
              onClick={() => rabField.append({ uraian: "", satuan: "", volume: 1, hargaSatuan: 0 })}
              className="btn-secondary mt-3"
            >
              <Plus size={14} /> Tambah Baris RAB
            </button>
          </>
        )}
      </div>

      {/* ── Jadwal ── */}
      <div className="card">
        <button type="button" onClick={() => toggleSection("jadwal")} className="flex items-center justify-between w-full mb-4">
          <h3 className="section-title mb-0">📅 Jadwal Pelaksanaan</h3>
          {expandedSections.jadwal ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expandedSections.jadwal && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {namaBulan.map((bulan, idx) => {
                const isSelected = jadwalField.fields.some((f) => (f as { bulan?: number }).bulan === idx + 1);
                return (
                  <label key={bulan} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? "border-primary-400 bg-primary-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          jadwalField.append({ bulan: idx + 1, keterangan: "" });
                        } else {
                          const fi = jadwalField.fields.findIndex((f) => (f as { bulan?: number }).bulan === idx + 1);
                          if (fi !== -1) jadwalField.remove(fi);
                        }
                      }}
                      className="accent-primary-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{bulan}</span>
                  </label>
                );
              })}
            </div>
            {jadwalField.fields.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {jadwalField.fields.map((f) => (
                  <span key={f.id} className="bg-primary-100 text-primary-700 text-xs px-2.5 py-1 rounded-full">
                    {namaBulan[((f as { bulan?: number }).bulan ?? 1) - 1]}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Panitia ── */}
      <div className="card">
        <button type="button" onClick={() => toggleSection("panitia")} className="flex items-center justify-between w-full mb-4">
          <h3 className="section-title mb-0">👥 Susunan Panitia / TPK</h3>
          {expandedSections.panitia ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expandedSections.panitia && (
          <>
            <div className="space-y-3">
              {panitiaField.fields.map((field, i) => (
                <div key={field.id} className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input {...register(`panitia.${i}.nama`)} className="input-field" placeholder="Nama lengkap" />
                    <input {...register(`panitia.${i}.jabatan`)} className="input-field" placeholder="Jabatan (Ketua, Sekretaris...)" />
                  </div>
                  <button type="button" onClick={() => panitiaField.remove(i)} className="text-rose-400 hover:text-rose-600 mt-2.5 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => panitiaField.append({ nama: "", jabatan: "" })}
              className="btn-secondary mt-3"
            >
              <Plus size={14} /> Tambah Anggota
            </button>
          </>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 shadow-sm sticky bottom-0 z-10">
        <div>
          <p className="text-sm text-gray-500">Total Anggaran</p>
          <p className="text-lg font-bold text-primary-700">{formatRupiah(totalRAB)}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Menyimpan..." : "Simpan Kegiatan"}
          </button>
        </div>
      </div>
    </form>
  );
}
