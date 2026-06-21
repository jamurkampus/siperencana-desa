// src/app/pengaturan/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

export default function PengaturanPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Pengaturan Desa</h2>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi data desa untuk kop dokumen dan administrasi</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="section-title border-b pb-3">🏘️ Identitas Desa</h3>
          {[
            { label: "Nama Desa", placeholder: "Susuk Dalam", name: "namaDesa" },
            { label: "Kecamatan", placeholder: "Anggana", name: "kecamatan" },
            { label: "Kabupaten", placeholder: "Kutai Kartanegara", name: "kabupaten" },
            { label: "Provinsi", placeholder: "Kalimantan Timur", name: "provinsi" },
            { label: "Kode Pos", placeholder: "75394", name: "kodePos" },
          ].map((f) => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input className="input-field" placeholder={f.placeholder} defaultValue={f.placeholder} />
            </div>
          ))}
        </div>

        <div className="card space-y-4">
          <h3 className="section-title border-b pb-3">👤 Perangkat Desa</h3>
          {[
            { label: "Nama Kepala Desa", name: "kepalaDesaNama", placeholder: "Nama Kepala Desa" },
            { label: "NIP Kepala Desa", name: "kepalaDesaNip", placeholder: "NIP (opsional)" },
            { label: "Nama Kaur Perencanaan", name: "kaurNama", placeholder: "Lamri, S.P." },
            { label: "Nama Sekretaris Desa", name: "sekdesNama", placeholder: "Nama Sekdes" },
            { label: "Nama Bendahara", name: "bendaharaNama", placeholder: "Nama Bendahara" },
          ].map((f) => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input className="input-field" placeholder={f.placeholder} defaultValue={f.placeholder} />
            </div>
          ))}
        </div>

        <div className="card space-y-4">
          <h3 className="section-title border-b pb-3">📅 Tahun Anggaran</h3>
          <div>
            <label className="label">Tahun Anggaran Aktif</label>
            <select className="input-field">
              <option value="2025">2025 (Aktif)</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
