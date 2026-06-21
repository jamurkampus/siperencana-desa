// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatTanggal(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatTanggalPendek(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export const namaBulan = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

export function getBulanNama(bulan: number): string {
  return namaBulan[bulan - 1] ?? "-";
}

export function terbilang(angka: number): string {
  const satuan = ["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas"];
  if (angka < 12) return satuan[angka];
  if (angka < 20) return satuan[angka - 10] + " belas";
  if (angka < 100) return satuan[Math.floor(angka / 10)] + " puluh " + satuan[angka % 10];
  if (angka < 200) return "seratus " + terbilang(angka - 100);
  if (angka < 1000) return satuan[Math.floor(angka / 100)] + " ratus " + terbilang(angka % 100);
  if (angka < 2000) return "seribu " + terbilang(angka - 1000);
  if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + " ribu " + terbilang(angka % 1000);
  if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + " juta " + terbilang(angka % 1000000);
  return terbilang(Math.floor(angka / 1000000000)) + " miliar " + terbilang(angka % 1000000000);
}

export function terbilangRupiah(angka: number): string {
  return terbilang(angka).trim() + " rupiah";
}

export const labelBidang: Record<string, string> = {
  PENYELENGGARAAN_PEMERINTAHAN: "Penyelenggaraan Pemerintahan",
  PEMBANGUNAN_DESA: "Pembangunan Desa",
  PEMBERDAYAAN_MASYARAKAT: "Pemberdayaan Masyarakat",
  PEMBINAAN_KEMASYARAKATAN: "Pembinaan Kemasyarakatan",
  PENANGGULANGAN_BENCANA: "Penanggulangan Bencana",
  KEADAAN_DARURAT: "Keadaan Darurat",
  MENDESAK: "Mendesak",
};

export const labelSumberDana: Record<string, string> = {
  ADD: "Alokasi Dana Desa (ADD)",
  DD: "Dana Desa (APBN)",
  PAD: "Pendapatan Asli Desa",
  APBD_KAB: "APBD Kabupaten",
  APBD_PROV: "APBD Provinsi",
  BANTUAN_PROVINSI: "Bantuan Provinsi",
  BANTUAN_KABUPATEN: "Bantuan Kabupaten",
  LAINNYA: "Lainnya",
};

export const labelStatus: Record<string, string> = {
  DRAFT: "Draft",
  DIAJUKAN: "Diajukan",
  DISETUJUI: "Disetujui",
  BERJALAN: "Berjalan",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

export const colorStatus: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  DIAJUKAN: "bg-blue-100 text-blue-700",
  DISETUJUI: "bg-emerald-100 text-emerald-700",
  BERJALAN: "bg-amber-100 text-amber-700",
  SELESAI: "bg-purple-100 text-purple-700",
  DITOLAK: "bg-rose-100 text-rose-700",
};
