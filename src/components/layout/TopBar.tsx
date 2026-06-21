"use client";
// src/components/layout/TopBar.tsx
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/kegiatan": "Daftar Kegiatan",
  "/kegiatan/tambah": "Tambah Kegiatan Baru",
  "/dokumen": "Manajemen Dokumen",
  "/laporan": "Laporan",
  "/pengaturan": "Pengaturan",
};

export function TopBar() {
  const pathname = usePathname();
  const title = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] ?? "SiPerenDesa";

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0 h-16">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search trigger */}
        <button className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-100 transition-colors w-52">
          <Search size={15} />
          <span>Cari kegiatan...</span>
          <kbd className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
        
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
          L
        </div>
      </div>
    </header>
  );
}
