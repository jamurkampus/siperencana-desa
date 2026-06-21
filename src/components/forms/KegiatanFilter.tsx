"use client";
// src/components/forms/KegiatanFilter.tsx
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "DIAJUKAN", label: "Diajukan" },
  { value: "DISETUJUI", label: "Disetujui" },
  { value: "BERJALAN", label: "Berjalan" },
  { value: "SELESAI", label: "Selesai" },
];

const bidangOptions = [
  { value: "", label: "Semua Bidang" },
  { value: "PENYELENGGARAAN_PEMERINTAHAN", label: "Penyelenggaraan Pemerintahan" },
  { value: "PEMBANGUNAN_DESA", label: "Pembangunan Desa" },
  { value: "PEMBERDAYAAN_MASYARAKAT", label: "Pemberdayaan Masyarakat" },
  { value: "PEMBINAAN_KEMASYARAKATAN", label: "Pembinaan Kemasyarakatan" },
];

export function KegiatanFilter() {
  const router = useRouter();
  const params = useSearchParams();

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/kegiatan?${p.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atau lokasi..."
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => {
            clearTimeout((window as unknown as { _st?: ReturnType<typeof setTimeout> })._st);
            (window as unknown as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => updateParam("q", e.target.value), 400);
          }}
          className="input-field pl-9"
        />
      </div>

      {/* Status filter */}
      <select
        defaultValue={params.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className="input-field w-auto"
      >
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Bidang filter */}
      <select
        defaultValue={params.get("bidang") ?? ""}
        onChange={(e) => updateParam("bidang", e.target.value)}
        className="input-field w-auto"
      >
        {bidangOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
