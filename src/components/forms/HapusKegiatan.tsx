"use client";
// src/components/forms/HapusKegiatan.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface Props {
  id: string;
  nama: string;
}

export function HapusKegiatan({ id, nama }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleHapus() {
    setLoading(true);
    try {
      const res = await fetch(`/api/kegiatan/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/kegiatan");
        router.refresh();
      } else {
        alert("Gagal menghapus kegiatan");
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-danger hidden md:flex"
      >
        <Trash2 size={14} /> Hapus
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-800">Hapus Kegiatan</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Yakin ingin menghapus kegiatan <strong>{nama}</strong>? Semua data RAB, jadwal, panitia, dan dokumen terkait akan ikut terhapus dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="btn-secondary flex-1 justify-center"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleHapus}
                disabled={loading}
                className="btn-danger flex-1 justify-center"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {loading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
