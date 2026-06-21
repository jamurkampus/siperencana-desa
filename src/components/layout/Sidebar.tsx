"use client";
// src/components/layout/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, FolderOpen,
  PlusCircle, BarChart2, Settings, ChevronRight, Map
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kegiatan", label: "Daftar Kegiatan", icon: FolderOpen },
  { href: "/kegiatan/tambah", label: "Tambah Kegiatan", icon: PlusCircle },
  { href: "/dokumen", label: "Dokumen", icon: FileText },
  { href: "/laporan", label: "Laporan", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-primary-950 text-white h-screen shrink-0">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-primary-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
              <Map size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">SiPerenDesa</div>
              <div className="text-primary-300 text-xs">Desa Susuk Dalam</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-primary-400 uppercase tracking-wider">Menu Utama</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  active
                    ? "bg-primary-700 text-white"
                    : "text-primary-200 hover:bg-primary-800 hover:text-white"
                )}
              >
                <Icon size={17} className={active ? "text-primary-300" : "text-primary-400 group-hover:text-primary-300"} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} className="text-primary-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-primary-800">
          <Link
            href="/pengaturan"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-300 hover:bg-primary-800 hover:text-white transition-colors"
          >
            <Settings size={17} />
            <span>Pengaturan</span>
          </Link>
          <div className="px-3 mt-3">
            <div className="text-xs text-primary-500">Kaur Perencanaan</div>
            <div className="text-xs text-primary-300 font-medium mt-0.5">Lamri, S.P.</div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                active ? "text-primary-600" : "text-gray-500"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
